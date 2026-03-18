import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/platform/lib/supabaseClient';
import { generateCorrelationId } from '@/platform/lib/serverUtils';

export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId();

  try {
    const body = await request.json();
    const {
      user_id,
      specialty_id,
      experience_years,
      consultation_fee,
      location,
      license_number,
      expiry_date,
      schedules,
    } = body;

    if (!user_id || !license_number) {
      return NextResponse.json(
        { success: false, message: 'user_id and license_number are required', correlationId },
        { status: 400 }
      );
    }

    const supabase = getServerSupabaseClient(true);

    const { error: doctorError } = await supabase
      .from('doctors')
      .upsert({
        user_id,
        specialty_id: specialty_id || null,
        experience_years: experience_years || null,
        consultation_fee: consultation_fee || null,
        location: location || null,
        approval_status: false,
        is_accepting_new_patients: true,
      }, { onConflict: 'user_id' });

    if (doctorError) {
      return NextResponse.json(
        { success: false, message: doctorError.message, correlationId },
        { status: 500 }
      );
    }

    const { error: credError } = await supabase
      .from('doctor_credentials')
      .insert({
        doctor_user_id: user_id,
        license_number,
        expiry_date: expiry_date || null,
        status: 'pending',
      });

    if (credError) {
      console.error('Error creating credentials:', credError);
    }

    if (schedules && Array.isArray(schedules) && schedules.length > 0) {
      const scheduleRows = schedules.map((s: any) => ({
        doctor_user_id: user_id,
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
      }));

      const { error: schedError } = await supabase
        .from('doctor_schedules')
        .insert(scheduleRows);

      if (schedError) {
        console.error('Error creating schedules:', schedError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Doctor registration submitted. Pending approval.',
      correlationId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error', correlationId },
      { status: 500 }
    );
  }
}
