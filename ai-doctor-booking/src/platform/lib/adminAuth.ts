import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/domains/shared/services/authService.server';
import { generateCorrelationId } from '@/platform/lib/serverUtils';

export interface AdminAuthResult {
  userId: string;
  email: string;
  role: string;
  correlationId: string;
}

export async function verifyAdminAuth(request: NextRequest): Promise<AdminAuthResult | NextResponse> {
  const correlationId = generateCorrelationId();
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, message: 'Authorization required', correlationId },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7);
  const verifyResult = await verifyToken(token, correlationId);

  if (!verifyResult.success || !verifyResult.data) {
    return NextResponse.json(
      { success: false, message: 'Invalid or expired token', correlationId },
      { status: 401 }
    );
  }

  const userRole = verifyResult.data.profile?.role;
  if (userRole !== 'admin') {
    return NextResponse.json(
      { success: false, message: 'Admin access required', correlationId },
      { status: 403 }
    );
  }

  return {
    userId: verifyResult.data.id,
    email: verifyResult.data.email || '',
    role: userRole,
    correlationId,
  };
}

export function isAdminAuthResult(result: AdminAuthResult | NextResponse): result is AdminAuthResult {
  return !(result instanceof NextResponse);
}
