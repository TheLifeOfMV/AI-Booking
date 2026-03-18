import { NextResponse } from 'next/server';
import { getSpecialties } from '@/domains/shared/services/specialtyService.server';
import { generateCorrelationId } from '@/platform/lib/serverUtils';

export async function GET() {
  const correlationId = generateCorrelationId();
  try {
    const result = await getSpecialties(correlationId);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error?.message }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      specialties: result.data || [],
      metadata: { count: result.data?.length || 0 },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
