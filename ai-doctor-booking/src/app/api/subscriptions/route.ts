import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/platform/lib/supabaseClient';
import { stripe, STRIPE_PRICE_IDS } from '@/platform/lib/stripeClient';
import { SUBSCRIPTION_PLANS } from '@/platform/constants/subscriptionPlans';
import { verifyToken } from '@/domains/shared/services/authService.server';
import { generateCorrelationId } from '@/platform/lib/serverUtils';

export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId();

  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const verifyResult = await verifyToken(token, correlationId);
    if (!verifyResult.success || !verifyResult.data) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const supabase = getServerSupabaseClient(true);
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('doctor_user_id', verifyResult.data.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || null, correlationId });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId();

  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const verifyResult = await verifyToken(token, correlationId);
    if (!verifyResult.success || !verifyResult.data) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { plan_type } = body;

    if (!plan_type || !['premium', 'elite'].includes(plan_type)) {
      return NextResponse.json(
        { success: false, message: 'plan_type must be "premium" or "elite"' },
        { status: 400 }
      );
    }

    const stripePriceId = STRIPE_PRICE_IDS[plan_type];
    if (!stripePriceId) {
      return NextResponse.json(
        { success: false, message: 'Stripe price not configured for this plan' },
        { status: 400 }
      );
    }

    const planConfig = SUBSCRIPTION_PLANS[plan_type];

    const userId = verifyResult.data.id;
    const userEmail = verifyResult.data.email;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: userEmail || undefined,
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      metadata: {
        doctor_user_id: userId,
        plan_type,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/doctor/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/plans`,
    });

    const supabase = getServerSupabaseClient(true);
    await supabase
      .from('subscriptions')
      .update({ status: 'pending', plan_type })
      .eq('doctor_user_id', userId);

    return NextResponse.json({
      success: true,
      data: { checkoutUrl: session.url, sessionId: session.id },
      correlationId,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
