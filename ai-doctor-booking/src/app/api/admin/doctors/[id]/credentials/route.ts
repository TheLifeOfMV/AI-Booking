import { NextRequest, NextResponse } from 'next/server';
import { updateCredentialStatus } from '@/services/doctorService';
import { CredentialStatus } from '@/types/doctor';

/**
 * PATCH /api/admin/doctors/[id]/credentials
 * Updates a doctor's credential status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    
    // Validate the status value
    if (!status || !['pending', 'verified', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid credential status. Must be "pending", "verified", or "rejected".' },
        { status: 400 }
      );
    }
    
    // Record the start time for performance metrics
    const startTime = performance.now();
    
    const updatedDoctor = await updateCredentialStatus(params.id, status as CredentialStatus);
    
    // Calculate operation time for monitoring
    const operationTime = Math.round(performance.now() - startTime);
    
    return NextResponse.json({ 
      doctor: updatedDoctor,
      message: `Doctor credentials ${status} successfully`,
      metadata: {
        operationTime: `${operationTime}ms`
      }
    });
  } catch (error: any) {
    console.error(`Error in PATCH /api/admin/doctors/${params.id}/credentials:`, error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 