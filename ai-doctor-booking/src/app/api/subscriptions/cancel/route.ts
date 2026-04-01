import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/platform/lib/supabaseClient';
import { verifyToken } from '@/domains/shared/services/authService.server';
import { generateCorrelationId } from '@/platform/lib/serverUtils';

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

    const supabase = getServerSupabaseClient(true);
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('doctor_user_id', verifyResult.data.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subError || !subscription) {
      return NextResponse.json(
        { success: false, message: 'No active subscription found' },
        { status: 404 },
      );
    }

    await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        end_date: new Date().toISOString(),
        wompi_payment_source_id: null,
      })
      .eq('id', subscription.id);

    await supabase.from('subscriptions').insert({
      doctor_user_id: verifyResult.data.id,
      plan_type: 'gratuito',
      status: 'active',
      payment_status: 'paid',
      monthly_fee: 0,
      start_date: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled. Reverted to free plan.',
      correlationId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
