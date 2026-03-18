import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/platform/lib/supabaseClient';
import { generateCorrelationId } from '@/platform/lib/serverUtils';

export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId();

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search');
    const role = url.searchParams.get('role');
    const offset = (page - 1) * limit;

    const supabase = getServerSupabaseClient(true);

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (role) {
      query = query.eq('role', role);
    }
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone_number.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message, correlationId }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        users: data || [],
        total: count || 0,
      },
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      correlationId,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, correlationId }, { status: 500 });
  }
}
