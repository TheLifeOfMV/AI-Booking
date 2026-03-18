import { NextRequest, NextResponse } from 'next/server';
import { createBooking, getPatientBookings } from '@/domains/shared/services/bookingService.server';
import { verifyToken } from '@/domains/shared/services/authService.server';
import { generateCorrelationId } from '@/platform/lib/serverUtils';

export async function POST(request: NextRequest) {
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
    const verifyResult = await verifyToken(token, correlationId);
    if (!verifyResult.success || !verifyResult.data) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token', correlationId },
        { status: 401 }
      );
    }

    const patientUserId = verifyResult.data.id;
    const body = await request.json();

    const bookingRequest = {
      patient_user_id: patientUserId,
      doctor_user_id: body.doctor_user_id,
      specialty_id: body.specialty_id || null,
      appointment_time: body.appointment_time,
      duration_minutes: body.duration_minutes || 30,
      channel: (body.channel || 'app') as 'app' | 'whatsapp' | 'admin',
    };

    const result = await createBooking(bookingRequest, correlationId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error?.message || 'Error creating booking', correlationId },
        { status: result.error?.statusCode || 500 }
      );
    }

    return NextResponse.json({ success: true, data: result.data, correlationId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error', correlationId },
      { status: 500 }
    );
  }
}

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
    const verifyResult = await verifyToken(token, correlationId);
    if (!verifyResult.success || !verifyResult.data) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token', correlationId },
        { status: 401 }
      );
    }

    const patientUserId = verifyResult.data.id;
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const result = await getPatientBookings({
      patient_user_id: patientUserId,
      status: status ? [status] : undefined,
      limit,
      offset,
    }, correlationId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error?.message || 'Error fetching bookings', correlationId },
        { status: result.error?.statusCode || 500 }
      );
    }

    return NextResponse.json({ success: true, data: result.data, correlationId });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error', correlationId },
      { status: 500 }
    );
  }
}
