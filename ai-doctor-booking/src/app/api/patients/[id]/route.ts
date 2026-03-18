import { NextRequest, NextResponse } from 'next/server';
import { getPatientProfile, updatePatientProfile } from '@/domains/patientService/services/patientService.server';
import { generateCorrelationId } from '@/platform/lib/serverUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const correlationId = generateCorrelationId();
  const { id } = await params;

  try {
    const result = await getPatientProfile(id, correlationId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error?.message || 'Error fetching patient', correlationId },
        { status: result.error?.statusCode || 500 }
      );
    }

    if (!result.data) {
      return NextResponse.json(
        { success: false, message: 'Patient not found', correlationId },
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const correlationId = generateCorrelationId();
  const { id } = await params;

  try {
    const body = await request.json();
    const result = await updatePatientProfile(id, body, correlationId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error?.message || 'Error updating patient', correlationId },
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
