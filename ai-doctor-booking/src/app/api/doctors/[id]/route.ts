import { NextRequest, NextResponse } from 'next/server';
import { getDoctorProfile } from '@/domains/doctorService/services/doctorService.server';
import { generateCorrelationId } from '@/platform/lib/serverUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const correlationId = generateCorrelationId();
  const { id } = await params;

  try {
    const result = await getDoctorProfile(id, correlationId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error?.message || 'Error fetching doctor', correlationId },
        { status: result.error?.statusCode || 500 }
      );
    }

    if (!result.data) {
      return NextResponse.json(
        { success: false, message: 'Doctor not found', correlationId },
        { status: 404 }
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
