import { NextRequest, NextResponse } from 'next/server';
import { getDoctorProfile, updateDoctorProfile } from '@/domains/doctorService/services/doctorService.server';
import { generateCorrelationId } from '@/platform/lib/serverUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const correlationId = generateCorrelationId();
  const { id } = await params;
  try {
    const result = await getDoctorProfile(id, correlationId);
    if (!result.success || !result.data) {
      return NextResponse.json({ success: false, error: 'Doctor not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result.data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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
    const result = await updateDoctorProfile(id, body, correlationId);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error?.message }, { status: result.error?.statusCode || 500 });
    }
    return NextResponse.json({ success: true, data: result.data, message: 'Doctor updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
