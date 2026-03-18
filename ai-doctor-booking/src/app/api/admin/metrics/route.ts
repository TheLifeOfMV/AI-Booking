import { NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/platform/lib/supabaseClient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7', 10);

    const supabase = getServerSupabaseClient(true);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, appointment_time, status')
      .gte('appointment_time', startDateStr)
      .order('appointment_time', { ascending: true });

    if (bookingsError) {
      throw bookingsError;
    }

    const bookingsByDayMap: Record<string, number> = {};
    const dates = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1) + i);
      const dateStr = date.toISOString().split('T')[0];
      bookingsByDayMap[dateStr] = 0;
      return dateStr;
    });

    for (const booking of (bookings || [])) {
      const dateStr = booking.appointment_time.split('T')[0];
      if (bookingsByDayMap[dateStr] !== undefined) {
        bookingsByDayMap[dateStr]++;
      }
    }

    const bookingsByDay = dates.map(date => ({
      date,
      count: bookingsByDayMap[date] || 0,
    }));

    const { count: totalDoctors } = await supabase
      .from('doctors')
      .select('*', { count: 'exact', head: true })
      .eq('approval_status', true);

    const { count: totalScheduleSlots } = await supabase
      .from('doctor_schedules')
      .select('*', { count: 'exact', head: true });

    const bookedSlots = (bookings || []).filter(
      b => b.status === 'confirmed' || b.status === 'pending'
    ).length;

    const totalSlots = (totalScheduleSlots || 0) * days;

    return NextResponse.json({
      bookingsByDay,
      utilization: {
        bookedSlots,
        totalSlots: totalSlots || 1,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin metrics' },
      { status: 500 }
    );
  }
}
