import { NextRequest, NextResponse } from 'next/server';
import { getDoctors, getSpecialties } from '@/services/doctorService';
import { DoctorFilter } from '@/types/doctor';

/**
 * GET /api/admin/doctors
 * Fetches a paginated list of doctors with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    // Build filters from query parameters
    const filters: DoctorFilter = {};
    
    const search = url.searchParams.get('search');
    if (search) filters.search = search;
    
    const specialtyId = url.searchParams.get('specialtyId');
    if (specialtyId) filters.specialtyId = specialtyId;
    
    const credentialStatus = url.searchParams.get('credentialStatus');
    if (credentialStatus && ['pending', 'verified', 'rejected'].includes(credentialStatus)) {
      filters.credentialStatus = credentialStatus as any;
    }
    
    const approvalStatus = url.searchParams.get('approvalStatus');
    if (approvalStatus !== null) {
      filters.approvalStatus = approvalStatus === 'true';
    }
    
    // Fetch data
    const { doctors, total } = await getDoctors(filters, page, limit);
    
    // Start time for performance logging
    const startTime = performance.now();
    
    // Return response with metadata
    const response = {
      doctors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      metadata: {
        loadTime: Math.round(performance.now() - startTime) + 'ms',
      }
    };
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in GET /api/admin/doctors:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/doctors/specialties
 * Fetches all available specialties
 */
export async function GET_specialties(request: NextRequest) {
  try {
    const specialties = await getSpecialties();
    return NextResponse.json({ specialties });
  } catch (error: any) {
    console.error('Error in GET /api/admin/doctors/specialties:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 