import { NextRequest, NextResponse } from 'next/server';
import { signup as serverSignup } from '@/services/authService.server';
import { generateCorrelationId } from '@/lib/serverUtils';
import { RoleMapper } from '@/types/auth';

/**
 * POST /api/auth/signup
 * Handles user registration via Supabase
 * Frontend → API Route → authService.server → Supabase → Response Chain
 */
export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId();
  
  console.log('📝 AUTH API: Signup request received', { correlationId });
  
  try {
    // Parse request body
    const body = await request.json();
    console.log('📝 AUTH API: Request body parsed', { body, correlationId });
    const { email, password, name, phone, role } = body;
    
    // Validate required fields
    if (!email || !password || !name) {
      console.log('❌ AUTH API: Missing required signup fields', { correlationId });
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email, contraseña y nombre completo son requeridos',
          correlationId 
        },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Formato de email inválido',
          correlationId 
        },
        { status: 400 }
      );
    }
    
    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'La contraseña debe tener al menos 6 caracteres',
          correlationId 
        },
        { status: 400 }
      );
    }
    
    // Convert role to server format (patient/doctor, default to patient)
    const serverRole = role === 'doctor' ? 'doctor' : 'patient';
    
    // Prepare signup request
    const signupRequest = {
      email: email.toLowerCase().trim(),
      password: password,
      full_name: name.trim(),
      phone_number: phone?.trim() || undefined,
      role: serverRole
    };
    
    console.log('🔄 AUTH API: Calling server signup service', { 
      email: signupRequest.email,
      role: signupRequest.role,
      correlationId 
    });
    
    // Call server authentication service
    const result = await serverSignup(signupRequest, correlationId);
    
    if (!result.success) {
      console.log('❌ AUTH API: Server signup failed', { 
        error: result.error,
        errorDetails: JSON.stringify(result.error, null, 2),
        correlationId 
      });
      
      // Handle specific error cases
      let errorMessage = result.error?.message || 'Error en el registro';
      
      if (result.error?.code === 'RESOURCE_ALREADY_EXISTS') {
        errorMessage = 'Ya existe una cuenta con este email';
      } else if (result.error?.code === 'INVALID_INPUT') {
        errorMessage = result.error.message;
      } else if (result.error?.message?.includes('infinite recursion')) {
        errorMessage = 'Error en configuración de base de datos. Intenta nuevamente.';
      }
      
      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
          debug: process.env.NODE_ENV === 'development' ? result.error : undefined,
          correlationId
        },
        { status: result.error?.statusCode || 400 }
      );
    }
    
    console.log('✅ AUTH API: Signup successful', { 
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
        message: 'Cuenta creada exitosamente',
        correlationId
      },
      { 
        status: 201,
        headers: {
          // CORS headers for local development
          'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
    
  } catch (error) {
    console.error('💥 AUTH API: Unexpected error during signup', { 
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