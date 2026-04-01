import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/platform/lib/supabaseClient';
import { verifyWebhookSignature, getTransaction } from '@/platform/lib/wompiClient';
import { SUBSCRIPTION_PLANS } from '@/platform/constants/subscriptionPlans';

interface WompiEvent {
  event: string;
  data: {
    transaction: {
      id: string;
      status: string;
      reference: string;
      amount_in_cents: number;
      payment_source_id?: number;
      payment_method?: { type: string; token?: string };
      customer_email?: string;
    };
  };
  sent_at: string;
  timestamp: number;
  signature: {
    checksum: string;
    properties: string[];
  };
  environment: string;
}

function parseReference(reference: string): { doctorUserId: string; planType: string } | null {
  const parts = reference.split('_');
  if (parts.length < 4 || parts[0] !== 'sub') return null;
  return {
    doctorUserId: parts[1],
    planType: parts[2],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: WompiEvent = await request.json();

    if (body.event !== 'transaction.updated') {
      return NextResponse.json({ received: true });
    }

    const tx = body.data.transaction;
    const { checksum } = body.signature;
    const timestamp = String(body.timestamp);

    const isValid = verifyWebhookSignature(
      timestamp,
      checksum,
      tx.id,
      tx.status,
      tx.amount_in_cents,
    );

    if (!isValid) {
      console.error('Wompi webhook: invalid checksum');
      return NextResponse.json({ error: 'Invalid checksum' }, { status: 401 });
    }

    const supabase = getServerSupabaseClient(true);

    if (tx.status === 'APPROVED') {
      const fullTx = await getTransaction(tx.id);
      const reference = fullTx.data.reference || tx.reference;
      const parsed = parseReference(reference);

      if (!parsed) {
        console.error('Wompi webhook: cannot parse reference', reference);
        return NextResponse.json({ received: true });
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .ilike('id', `${parsed.doctorUserId}%`)
        .limit(1)
        .single();

      if (!profile) {
        console.error('Wompi webhook: doctor not found for prefix', parsed.doctorUserId);
        return NextResponse.json({ received: true });
      }

      const doctorUserId = profile.id;
      const planType = parsed.planType;
      const planConfig = SUBSCRIPTION_PLANS[planType];
      const monthlyFee = planConfig?.monthlyFee ?? 0;

      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled', end_date: new Date().toISOString() })
        .eq('doctor_user_id', doctorUserId)
        .eq('status', 'active');

      const paymentSourceId = fullTx.data.payment_source_id
        ? String(fullTx.data.payment_source_id)
        : tx.payment_source_id
          ? String(tx.payment_source_id)
          : null;

      const nextPayment = new Date();
      nextPayment.setMonth(nextPayment.getMonth() + 1);

      const { data: newSub } = await supabase
        .from('subscriptions')
        .insert({
          doctor_user_id: doctorUserId,
          plan_type: planType,
          status: 'active',
          payment_status: 'paid',
          monthly_fee: monthlyFee,
          wompi_payment_source_id: paymentSourceId,
          wompi_customer_email: tx.customer_email || null,
          start_date: new Date().toISOString(),
          next_payment_date: nextPayment.toISOString(),
          failed_payment_attempts: 0,
        })
        .select('id')
        .single();

      if (newSub) {
        await supabase.from('payments').insert({
          subscription_id: newSub.id,
          doctor_user_id: doctorUserId,
          amount: tx.amount_in_cents / 100,
          currency: 'COP',
          status: 'completed',
          wompi_transaction_id: tx.id,
          wompi_reference: reference,
          description: `Pago de suscripción - Plan ${planType}`,
        });
      }
    } else if (tx.status === 'DECLINED' || tx.status === 'ERROR') {
      const reference = tx.reference;
      const parsed = parseReference(reference);
      if (parsed) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .ilike('id', `${parsed.doctorUserId}%`)
          .limit(1)
          .single();

        if (profile) {
          await supabase
            .from('subscriptions')
            .update({ payment_status: 'failed' })
            .eq('doctor_user_id', profile.id)
            .eq('status', 'pending');
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Wompi webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
