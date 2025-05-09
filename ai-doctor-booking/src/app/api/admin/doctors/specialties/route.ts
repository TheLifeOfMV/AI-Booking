import { NextRequest, NextResponse } from 'next/server';
import { getSpecialties } from '@/services/doctorService';

/**
 * GET /api/admin/doctors/specialties
 * Fetches all available medical specialties
 */
export async function GET(request: NextRequest) {
  try {
    const startTime = performance.now();
    
    const specialties = await getSpecialties();
    
    // Calculate operation time for monitoring
    const operationTime = Math.round(performance.now() - startTime);
    
    return NextResponse.json({ 
      specialties,
      metadata: {
        count: specialties.length,
        operationTime: `${operationTime}ms`
      }
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/doctors/specialties:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 