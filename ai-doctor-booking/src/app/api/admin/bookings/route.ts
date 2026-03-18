import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/platform/lib/supabaseClient';
import { generateCorrelationId } from '@/platform/lib/serverUtils';

export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId();

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const offset = (page - 1) * limit;

    const supabase = getServerSupabaseClient(true);

    let query = supabase
      .from('bookings')
      .select(`
        *,
        patient:profiles!bookings_patient_user_id_fkey(user_id, full_name, phone_number, avatar_url),
        specialties(id, name)
      `, { count: 'exact' })
      .order('appointment_time', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }
    if (startDate) {
      query = query.gte('appointment_time', startDate);
    }
    if (endDate) {
      query = query.lte('appointment_time', endDate);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message, correlationId }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        bookings: data || [],
        total: count || 0,
      },
      pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
      correlationId,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, correlationId }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const correlationId = generateCorrelationId();

  try {
    const body = await request.json();
    const { bookingIds, status } = body;

    if (!bookingIds || !Array.isArray(bookingIds) || !status) {
      return NextResponse.json(
        { success: false, error: 'bookingIds (array) and status are required', correlationId },
        { status: 400 }
      );
    }

    const supabase = getServerSupabaseClient(true);

    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .in('id', bookingIds)
      .select();

    if (error) {
      return NextResponse.json({ success: false, error: error.message, correlationId }, { status: 500 });
    }

    return NextResponse.json({ success: true, data, message: `${data?.length || 0} bookings updated`, correlationId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, correlationId }, { status: 500 });
  }
}
