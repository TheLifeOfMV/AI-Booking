import { NextRequest, NextResponse } from 'next/server';
import { toggleDoctorApproval } from '@/domains/doctorService/services/doctorService.server';
import { generateCorrelationId } from '@/platform/lib/serverUtils';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const correlationId = generateCorrelationId();
  const { id } = await params;
  try {
    const { approved } = await request.json();
    if (typeof approved !== 'boolean') {
      return NextResponse.json(
        { success: false, error: '"approved" must be a boolean value.' },
        { status: 400 }
      );
    }

    const result = await toggleDoctorApproval(id, approved, correlationId);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error?.message }, { status: result.error?.statusCode || 500 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: `Doctor ${approved ? 'approved' : 'unapproved'} successfully`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
