import { NextRequest, NextResponse } from 'next/server';
import { getDoctorById, updateDoctor } from '@/services/doctorService';

/**
 * GET /api/admin/doctors/[id]
 * Fetches a single doctor by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doctor = await getDoctorById(params.id);
    
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ doctor });
  } catch (error: any) {
    console.error(`Error in GET /api/admin/doctors/${params.id}:`, error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/doctors/[id]
 * Updates a doctor's record
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doctorData = await request.json();
    
    // Optimistic locking - version check would go here in a real system
    
    const updatedDoctor = await updateDoctor(params.id, doctorData);
    
    return NextResponse.json({ 
      doctor: updatedDoctor,
      message: 'Doctor updated successfully' 
    });
  } catch (error: any) {
    console.error(`Error in PUT /api/admin/doctors/${params.id}:`, error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 