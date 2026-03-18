import { NextResponse } from 'next/server';
import { getSpecialties } from '@/domains/shared/services/specialtyService.server';
import { generateCorrelationId } from '@/platform/lib/serverUtils';

export async function GET() {
  const correlationId = generateCorrelationId();

  try {
    const result = await getSpecialties(correlationId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error?.message || 'Error fetching specialties', correlationId },
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
