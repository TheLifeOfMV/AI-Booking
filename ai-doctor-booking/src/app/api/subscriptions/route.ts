import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/platform/lib/supabaseClient';
import {
  createTransaction,
  getAcceptanceToken,
  generateReference,
  PLAN_AMOUNT_COP,
  type PlanType,
} from '@/platform/lib/wompiClient';
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
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
        { status: 400 },
      );
    }

    const amountInCents = PLAN_AMOUNT_COP[plan_type as PlanType];
    if (!amountInCents) {
      return NextResponse.json(
        { success: false, message: 'Plan amount not configured' },
        { status: 400 },
      );
    }

    const planConfig = SUBSCRIPTION_PLANS[plan_type];
    const userId = verifyResult.data.id;
    const userEmail = verifyResult.data.email || '';
    const reference = generateReference(userId, plan_type);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const acceptanceToken = await getAcceptanceToken();

    const txResponse = await createTransaction({
      amount_in_cents: amountInCents,
      currency: 'COP',
      customer_email: userEmail,
      reference,
      redirect_url: `${appUrl}/doctor/subscription/success?reference=${reference}`,
      acceptance_token: acceptanceToken,
      customer_data: {
        full_name: verifyResult.data.email || 'Doctor',
        phone_number: '3000000000',
      },
    });

    const supabase = getServerSupabaseClient(true);

    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('doctor_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingSub) {
      await supabase
        .from('subscriptions')
        .update({
          status: 'pending',
          plan_type,
          monthly_fee: planConfig.monthlyFee,
          wompi_customer_email: userEmail,
        })
        .eq('id', existingSub.id);
    } else {
      await supabase.from('subscriptions').insert({
        doctor_user_id: userId,
        status: 'pending',
        plan_type,
        monthly_fee: planConfig.monthlyFee,
        start_date: new Date().toISOString(),
        wompi_customer_email: userEmail,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        transactionId: txResponse.data.id,
        reference,
        redirectUrl: `https://checkout.wompi.co/l/${txResponse.data.id}`,
      },
      correlationId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
