import { NextRequest, NextResponse } from 'next/server';
import { verifyToken as serverVerifyToken } from '@/domains/shared/services/authService.server';
import { generateCorrelationId } from '@/platform/lib/serverUtils';

/**
 * GET /api/auth/verify
 * Verifies JWT token and returns user data
 * Used for session restoration and middleware authentication
 * Frontend → API Route → authService.server → Supabase → Response Chain
 */
export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId();
  
  console.log('🔍 AUTH API: Token verification request received', { correlationId });
  
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ AUTH API: Missing or invalid authorization header', { correlationId });
      return NextResponse.json(
        { 
          success: false, 
          message: 'Token de autorización requerido',
          correlationId 
        },
        { status: 401 }
      );
    }
    
    // Extract access token
    const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    console.log('🔄 AUTH API: Calling server verify token service', { correlationId });
    
    // Call server verification service
    const result = await serverVerifyToken(accessToken, correlationId);
    
    if (!result.success) {
      console.log('❌ AUTH API: Token verification failed', { 
        error: result.error,
        correlationId 
      });
      
      let errorMessage = 'Token inválido o expirado';
      let statusCode = 401;
      
      if (result.error?.code === 'INVALID_TOKEN') {
        errorMessage = 'Token inválido o expirado';
        statusCode = 401;
      } else if (result.error?.code === 'RESOURCE_NOT_FOUND') {
        errorMessage = 'Usuario no encontrado';
        statusCode = 404;
      }
      
      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
          correlationId
        },
        { status: statusCode }
      );
    }
    
    console.log('✅ AUTH API: Token verification successful', { 
      userId: result.data?.id,
      role: result.data?.profile.role,
      correlationId 
    });
    
    // Format response for frontend
    const responseData = {
      user: {
        id: result.data!.id,
        email: result.data!.email,
        name: result.data!.profile.full_name,
        role: result.data!.profile.role,
        phone: result.data!.profile.phone_number
      }
    };
    
    return NextResponse.json(
      {
        success: true,
        data: responseData,
        correlationId
      },
      { 
        status: 200,
        headers: {
          // CORS headers for local development
          'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
    
  } catch (error) {
    console.error('💥 AUTH API: Unexpected error during verification', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      correlationId 
    });
    
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor',
        correlationId
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
} 