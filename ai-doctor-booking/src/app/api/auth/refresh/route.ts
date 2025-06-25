import { NextRequest, NextResponse } from 'next/server';
import { refreshToken as serverRefreshToken } from '@/services/authService.server';
import { generateCorrelationId } from '@/lib/serverUtils';

/**
 * POST /api/auth/refresh
 * Refreshes access token using refresh token
 * Used for automatic session renewal before token expiry
 * Frontend → API Route → authService.server → Supabase → Response Chain
 */
export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId();
  
  console.log('🔄 AUTH API: Token refresh request received', { correlationId });
  
  try {
    // Parse request body
    const body = await request.json();
    const { refresh_token } = body;
    
    // Validate refresh token
    if (!refresh_token) {
      console.log('❌ AUTH API: Missing refresh token', { correlationId });
      return NextResponse.json(
        { 
          success: false, 
          message: 'Token de actualización requerido',
          correlationId 
        },
        { status: 400 }
      );
    }
    
    console.log('🔄 AUTH API: Calling server refresh token service', { correlationId });
    
    // Call server refresh service
    const result = await serverRefreshToken(refresh_token, correlationId);
    
    if (!result.success) {
      console.log('❌ AUTH API: Token refresh failed', { 
        error: result.error,
        correlationId 
      });
      
      let errorMessage = 'Token de actualización inválido o expirado';
      let statusCode = 401;
      
      if (result.error?.code === 'INVALID_TOKEN') {
        errorMessage = 'Token de actualización inválido o expirado';
        statusCode = 401;
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
    
    console.log('✅ AUTH API: Token refresh successful', { correlationId });
    
    // Format response for frontend
    const responseData = {
      access_token: result.data!.access_token,
      expires_in: result.data!.expires_in
    };
    
    return NextResponse.json(
      {
        success: true,
        data: responseData,
        message: 'Token actualizado exitosamente',
        correlationId
      },
      { 
        status: 200,
        headers: {
          // CORS headers for local development
          'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
    
  } catch (error) {
    console.error('💥 AUTH API: Unexpected error during token refresh', { 
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
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
} 