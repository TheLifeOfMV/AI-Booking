import { NextRequest, NextResponse } from 'next/server';
import { logout as serverLogout } from '@/services/authService.server';
import { generateCorrelationId } from '@/lib/serverUtils';
import { testingConfig } from '@/config/testing';

/**
 * POST /api/auth/logout
 * Handles user session termination via Supabase
 * Frontend → API Route → authService.server → Supabase → Response Chain
 */
export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId();
  
  console.log('🚪 AUTH API: Logout request received', { correlationId });
  
  try {
    // TESTING MODE: Bypass logout authentication
    if (testingConfig.ENABLE_TESTING_MODE && process.env.NODE_ENV !== 'production') {
      console.log('🧪 TESTING MODE: Bypassing logout authentication', { correlationId });
      
      return NextResponse.json(
        {
          success: true,
          message: 'Logout successful (testing mode)',
          correlationId
        },
        { status: 200 }
      );
    }
    
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
    
    console.log('🔄 AUTH API: Calling server logout service', { correlationId });
    
    // Call server logout service
    const result = await serverLogout(accessToken, correlationId);
    
    if (!result.success) {
      console.log('❌ AUTH API: Server logout failed', { 
        error: result.error,
        correlationId 
      });
      
      // Even if server logout fails, we should still clear client-side data
      // Return success to allow client cleanup
      return NextResponse.json(
        {
          success: true,
          message: 'Sesión cerrada (con advertencias)',
          correlationId
        },
        { status: 200 }
      );
    }
    
    console.log('✅ AUTH API: Logout successful', { correlationId });
    
    return NextResponse.json(
      {
        success: true,
        message: 'Sesión cerrada exitosamente',
        correlationId
      },
      { 
        status: 200,
        headers: {
          // CORS headers for local development
          'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
    
  } catch (error) {
    console.error('💥 AUTH API: Unexpected error during logout', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      correlationId 
    });
    
    // For logout, we want to be permissive - even if there's an error,
    // the client should be able to clear its local state
    return NextResponse.json(
      {
        success: true,
        message: 'Sesión cerrada (con errores)',
        correlationId
      },
      { status: 200 }
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
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
} 