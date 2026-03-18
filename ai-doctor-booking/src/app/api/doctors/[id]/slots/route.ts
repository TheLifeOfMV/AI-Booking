import { NextRequest, NextResponse } from 'next/server';
import { getDoctorAvailableSlots } from '@/domains/doctorService/services/doctorService.server';
import { generateCorrelationId } from '@/platform/lib/serverUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const correlationId = generateCorrelationId();
  const { id } = await params;
  const url = new URL(request.url);
  const date = url.searchParams.get('date');

  if (!date) {
    return NextResponse.json(
      { success: false, message: 'date query parameter is required (YYYY-MM-DD)', correlationId },
      { status: 400 }
    );
  }

  try {
    const result = await getDoctorAvailableSlots(id, date, correlationId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error?.message || 'Error fetching slots', correlationId },
        { status: result.error?.statusCode || 500 }
      );
    }

    return NextResponse.json({ success: true, data: result.data, correlationId });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', correlationId },
      { status: 500 }
    );
  }
}
