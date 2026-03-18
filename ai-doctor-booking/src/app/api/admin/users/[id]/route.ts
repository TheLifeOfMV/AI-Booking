import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/platform/lib/supabaseClient';
import { generateCorrelationId } from '@/platform/lib/serverUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const correlationId = generateCorrelationId();
  const { id } = await params;

  try {
    const supabase = getServerSupabaseClient(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', id)
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message, correlationId }, { status: error.code === 'PGRST116' ? 404 : 500 });
    }

    return NextResponse.json({ success: true, data, correlationId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, correlationId }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const correlationId = generateCorrelationId();
  const { id } = await params;

  try {
    const body = await request.json();
    const supabase = getServerSupabaseClient(true);

    const { data, error } = await supabase
      .from('profiles')
      .update(body)
      .eq('user_id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message, correlationId }, { status: 500 });
    }

    return NextResponse.json({ success: true, data, correlationId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, correlationId }, { status: 500 });
  }
}
