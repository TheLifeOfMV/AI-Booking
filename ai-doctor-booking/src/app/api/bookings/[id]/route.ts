import { NextRequest, NextResponse } from 'next/server';
import { getBookingById, updateBookingStatus } from '@/domains/shared/services/bookingService.server';
import { verifyToken } from '@/domains/shared/services/authService.server';
import { generateCorrelationId } from '@/platform/lib/serverUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const correlationId = generateCorrelationId();
  const { id } = await params;

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

    const bookingId = parseInt(id);
    if (isNaN(bookingId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid booking ID', correlationId },
        { status: 400 }
      );
    }

    const result = await getBookingById(bookingId, correlationId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error?.message || 'Error fetching booking', correlationId },
        { status: result.error?.statusCode || 500 }
      );
    }

    if (!result.data) {
      return NextResponse.json(
        { success: false, message: 'Booking not found', correlationId },
        { status: 404 }
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const correlationId = generateCorrelationId();
  const { id } = await params;

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

    const bookingId = parseInt(id);
    if (isNaN(bookingId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid booking ID', correlationId },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, message: 'status field is required', correlationId },
        { status: 400 }
      );
    }

    const result = await updateBookingStatus(bookingId, status, correlationId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error?.message || 'Error updating booking', correlationId },
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
