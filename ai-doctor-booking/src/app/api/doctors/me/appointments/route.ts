import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/platform/lib/supabaseClient';
import { generateCorrelationId } from '@/platform/lib/serverUtils';

export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId();

  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization required', correlationId },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const supabase = getServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Invalid token', correlationId },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    let query = supabase
      .from('bookings')
      .select(`
        *,
        profiles!bookings_patient_user_id_fkey(full_name, phone_number, avatar_url),
        specialties(id, name)
      `)
      .eq('doctor_user_id', user.id)
      .order('appointment_time', { ascending: true })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json(
        { success: false, message: error.message, correlationId },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: data || [], correlationId });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error', correlationId },
      { status: 500 }
    );
  }
}
