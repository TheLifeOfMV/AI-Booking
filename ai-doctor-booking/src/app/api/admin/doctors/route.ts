import { NextRequest, NextResponse } from 'next/server';
import { getApprovedDoctors } from '@/domains/doctorService/services/doctorService.server';
import { generateCorrelationId } from '@/platform/lib/serverUtils';

export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId();
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const specialtyId = url.searchParams.get('specialtyId');
    const search = url.searchParams.get('search');

    const result = await getApprovedDoctors({
      specialtyId: specialtyId ? parseInt(specialtyId) : undefined,
      limit,
      offset: (page - 1) * limit,
    }, correlationId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error?.message },
        { status: result.error?.statusCode || 500 }
      );
    }

    let doctors = result.data?.doctors || [];

    if (search) {
      const term = search.toLowerCase();
      doctors = doctors.filter((d: any) => {
        const name = (d.profile?.full_name || d.profiles?.full_name || '').toLowerCase();
        const specialty = (d.specialty?.name || d.specialties?.name || '').toLowerCase();
        return name.includes(term) || specialty.includes(term);
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        doctors,
        total: result.data?.total || 0,
      },
      pagination: {
        page,
        limit,
        total: result.data?.total || 0,
        totalPages: Math.ceil((result.data?.total || 0) / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
