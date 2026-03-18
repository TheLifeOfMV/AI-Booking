import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/platform/lib/supabaseClient';
import { generateCorrelationId } from '@/platform/lib/serverUtils';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const correlationId = generateCorrelationId();
  const { id } = await params;
  try {
    const { status } = await request.json();
    if (!status || !['pending', 'verified', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid credential status. Must be "pending", "verified", or "rejected".' },
        { status: 400 }
      );
    }

    const supabase = getServerSupabaseClient(true);

    const updateData: any = { status };
    if (status === 'verified') {
      updateData.verified_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('doctor_credentials')
      .update(updateData)
      .eq('doctor_user_id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      message: `Doctor credentials ${status} successfully`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
