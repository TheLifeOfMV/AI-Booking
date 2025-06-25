import { NextRequest, NextResponse } from 'next/server';
import { login as serverLogin } from '@/services/authService.server';
import { generateCorrelationId } from '@/lib/serverUtils';

/**
 * POST /api/auth/login
 * Handles user authentication via Supabase
 * Frontend → API Route → authService.server → Supabase → Response Chain
 */
export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId();
  
  console.log('🔐 AUTH API: Login request received', { correlationId });
  
  try {
    // Parse request body
    const body = await request.json();
    const { identifier, password, role } = body;
    
    // Validate required fields
    if (!identifier || !password) {
      console.log('❌ AUTH API: Missing credentials', { correlationId });
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email y contraseña son requeridos',
          correlationId 
        },
        { status: 400 }
      );
    }
    
    // Convert identifier to email format and role to server format
    const loginRequest = {
      email: identifier.toLowerCase().trim(),
      password: password
    };
    
    console.log('🔄 AUTH API: Calling server login service', { 
      email: loginRequest.email,
      correlationId 
    });
    
    // Call server authentication service
    const result = await serverLogin(loginRequest, correlationId);
    
    if (!result.success) {
      console.log('❌ AUTH API: Server login failed', { 
        error: result.error,
        correlationId 
      });
      
      return NextResponse.json(
        {
          success: false,
          message: result.error?.message || 'Error de autenticación',
          correlationId
        },
        { status: result.error?.statusCode || 401 }
      );
    }
    
    console.log('✅ AUTH API: Login successful', { 
      userId: result.data?.user.id,
      role: result.data?.user.profile.role,
      correlationId 
    });
    
    // Format response for frontend
    const responseData = {
      user: {
        id: result.data!.user.id,
        email: result.data!.user.email,
        name: result.data!.user.profile.full_name,
        role: result.data!.user.profile.role,
        phone: result.data!.user.profile.phone_number
      },
      access_token: result.data!.access_token,
      refresh_token: result.data!.refresh_token,
      expires_in: result.data!.expires_in
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
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
    
  } catch (error) {
    console.error('💥 AUTH API: Unexpected error during login', { 
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