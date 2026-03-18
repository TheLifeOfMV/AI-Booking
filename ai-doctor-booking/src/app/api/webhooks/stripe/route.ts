import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/platform/lib/stripeClient';
import { getServerSupabaseClient } from '@/platform/lib/supabaseClient';
import { SUBSCRIPTION_PLANS } from '@/platform/constants/subscriptionPlans';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = getServerSupabaseClient(true);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any;
      const doctorUserId = session.metadata?.doctor_user_id;
      const planType = session.metadata?.plan_type;
      const stripeSubscriptionId = session.subscription;

      if (doctorUserId && planType) {
        const monthlyFee = SUBSCRIPTION_PLANS[planType]?.monthlyFee ?? 0;

        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('doctor_user_id', doctorUserId)
          .eq('status', 'active');

        await supabase.from('subscriptions').insert({
          doctor_user_id: doctorUserId,
          plan_type: planType,
          status: 'active',
          payment_status: 'paid',
          monthly_fee: monthlyFee,
          stripe_subscription_id: stripeSubscriptionId,
          start_date: new Date().toISOString(),
        });
      }
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as any;
      const subscriptionId = invoice.subscription;

      if (subscriptionId) {
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('id, doctor_user_id')
          .eq('stripe_subscription_id', subscriptionId)
          .single();

        if (sub) {
          await supabase.from('payments').insert({
            subscription_id: sub.id,
            doctor_user_id: sub.doctor_user_id,
            amount: invoice.amount_paid,
            currency: invoice.currency?.toUpperCase() || 'COP',
            status: 'completed',
            stripe_payment_intent_id: invoice.payment_intent,
            stripe_invoice_id: invoice.id,
            description: `Pago de suscripción`,
          });

          await supabase
            .from('subscriptions')
            .update({ payment_status: 'paid', failed_payment_attempts: 0 })
            .eq('id', sub.id);
        }
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as any;
      const subscriptionId = invoice.subscription;

      if (subscriptionId) {
        await supabase.rpc('increment_failed_payments', { sub_stripe_id: subscriptionId }).catch(() => {
          supabase
            .from('subscriptions')
            .update({ payment_status: 'failed' })
            .eq('stripe_subscription_id', subscriptionId);
        });

        await supabase
          .from('subscriptions')
          .update({ payment_status: 'failed' })
          .eq('stripe_subscription_id', subscriptionId);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as any;

      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled', end_date: new Date().toISOString() })
        .eq('stripe_subscription_id', subscription.id);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
