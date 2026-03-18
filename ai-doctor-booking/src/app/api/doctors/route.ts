import { NextRequest, NextResponse } from 'next/server';
import { getApprovedDoctors } from '@/domains/doctorService/services/doctorService.server';
import { generateCorrelationId } from '@/platform/lib/serverUtils';

export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId();
  const url = new URL(request.url);

  const specialtyId = url.searchParams.get('specialtyId');
  const date = url.searchParams.get('date');
  const location = url.searchParams.get('location');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  try {
    const result = await getApprovedDoctors({
      specialtyId: specialtyId ? parseInt(specialtyId) : undefined,
      date: date || undefined,
      location: location || undefined,
      limit,
      offset,
    }, correlationId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error?.message || 'Error fetching doctors', correlationId },
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
