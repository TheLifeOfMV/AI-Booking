import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/platform/lib/supabaseClient';
import {
  createTransaction,
  getAcceptanceToken,
  generateReference,
  PLAN_AMOUNT_COP,
  type PlanType,
} from '@/platform/lib/wompiClient';

const CRON_SECRET = process.env.CRON_SECRET || '';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServerSupabaseClient(true);
  const now = new Date().toISOString();

  const { data: dueSubs, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'active')
    .not('wompi_payment_source_id', 'is', null)
    .lte('next_payment_date', now);

  if (error || !dueSubs) {
    return NextResponse.json({ error: error?.message || 'No subscriptions found' }, { status: 500 });
  }

  const results: Array<{ subId: number; status: string; error?: string }> = [];

  for (const sub of dueSubs) {
    const planType = sub.plan_type as PlanType;
    const amountInCents = PLAN_AMOUNT_COP[planType];

    if (!amountInCents || !sub.wompi_payment_source_id) {
      results.push({ subId: sub.id, status: 'skipped', error: 'No amount or payment source' });
      continue;
    }

    try {
      const acceptanceToken = await getAcceptanceToken();
      const reference = generateReference(sub.doctor_user_id, planType);

      await createTransaction({
        amount_in_cents: amountInCents,
        currency: 'COP',
        customer_email: sub.wompi_customer_email || '',
        reference,
        payment_source_id: Number(sub.wompi_payment_source_id),
        acceptance_token: acceptanceToken,
      });

      const nextPayment = new Date();
      nextPayment.setMonth(nextPayment.getMonth() + 1);

      await supabase
        .from('subscriptions')
        .update({
          next_payment_date: nextPayment.toISOString(),
          payment_status: 'pending',
        })
        .eq('id', sub.id);

      results.push({ subId: sub.id, status: 'charged' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';

      await supabase
        .from('subscriptions')
        .update({
          failed_payment_attempts: (sub.failed_payment_attempts || 0) + 1,
          payment_status: 'failed',
        })
        .eq('id', sub.id);

      results.push({ subId: sub.id, status: 'failed', error: message });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
