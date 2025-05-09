import { NextRequest, NextResponse } from 'next/server';
import { toggleDoctorApproval } from '@/services/doctorService';

/**
 * PATCH /api/admin/doctors/[id]/approval
 * Updates a doctor's approval status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { approved } = await request.json();
    
    if (typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid input. "approved" must be a boolean value.' },
        { status: 400 }
      );
    }
    
    // Record the start time for performance metrics
    const startTime = performance.now();
    
    const updatedDoctor = await toggleDoctorApproval(params.id, approved);
    
    // Calculate operation time for monitoring
    const operationTime = Math.round(performance.now() - startTime);
    
    return NextResponse.json({ 
      doctor: updatedDoctor,
      message: `Doctor ${approved ? 'approved' : 'unapproved'} successfully`,
      metadata: {
        operationTime: `${operationTime}ms`
      }
    });
  } catch (error: any) {
    console.error(`Error in PATCH /api/admin/doctors/${params.id}/approval:`, error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 