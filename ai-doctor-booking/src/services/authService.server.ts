/**
 * Authentication Service - Server Side
 * Handles user authentication, registration, and session management
 * Following MONOCODE principles with structured logging and explicit error handling
 */

import { getServerSupabaseClient, logDatabaseOperation } from '@/lib/supabaseClient';
import { 
  ServiceResponse, 
  ServiceErrorCode, 
  ServiceError,
  logServiceOperation, 
  logServiceError, 
  createSuccessResponse, 
  createErrorResponse,
  generateCorrelationId,
  handleDatabaseError,
  measurePerformance,
  validateRequired,
  validateEmail,
  validateUUID
} from '@/lib/serverUtils';

// Auth-related types
export interface UserProfile {
  user_id: string;
  full_name: string;
  phone_number: string | null;
  avatar_url: string | null;
  role: 'patient' | 'doctor' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  profile: UserProfile;
}

export interface SignupRequest {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  role?: 'patient' | 'doctor';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

/**
 * User signup with profile creation
 * Creates both auth user and profile record in a transaction
 */
export const signup = async (
  signupData: SignupRequest,
  correlationId?: string
): Promise<ServiceResponse<AuthResponse>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('Auth', 'SIGNUP_START', { 
    email: signupData.email,
    role: signupData.role || 'patient'
  }, opId);
  
  try {
    // Validate input
    validateRequired(signupData.email, 'email');
    validateRequired(signupData.password, 'password');
    validateRequired(signupData.full_name, 'full_name');
    validateEmail(signupData.email);
    
    if (signupData.password.length < 6) {
      throw new ServiceError(
        ServiceErrorCode.INVALID_INPUT,
        'Password must be at least 6 characters long',
        opId,
        400
      );
    }
    
    return await measurePerformance(async () => {
      const supabase = getServerSupabaseClient();
      
      logDatabaseOperation('AUTH_SIGNUP', { 
        email: signupData.email,
        correlationId: opId 
      });
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.full_name,
            role: signupData.role || 'patient'
          }
        }
      });
      
      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new ServiceError(
            ServiceErrorCode.RESOURCE_ALREADY_EXISTS,
            'User already exists with this email',
            opId,
            409
          );
        }
        handleDatabaseError(authError, 'SIGNUP_AUTH', opId);
      }
      
      if (!authData.user) {
        throw new ServiceError(
          ServiceErrorCode.INTERNAL_SERVER_ERROR,
          'User creation failed',
          opId,
          500
        );
      }
      
      // Create profile record
      logDatabaseOperation('PROFILE_CREATE', { 
        user_id: authData.user.id,
        correlationId: opId 
      });
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          user_id: authData.user.id,
          full_name: signupData.full_name.trim(),
          phone_number: signupData.phone_number?.trim() || null,
          role: signupData.role || 'patient'
        }])
        .select()
        .single();
      
      if (profileError) {
        // Clean up auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        handleDatabaseError(profileError, 'SIGNUP_PROFILE', opId);
      }
      
      // Prepare response
      const response: AuthResponse = {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          email_confirmed_at: authData.user.email_confirmed_at,
          profile: profileData
        },
        access_token: authData.session?.access_token || '',
        refresh_token: authData.session?.refresh_token || '',
        expires_in: authData.session?.expires_in || 3600
      };
      
      logServiceOperation('Auth', 'SIGNUP_SUCCESS', { 
        user_id: authData.user.id,
        email: signupData.email,
        role: profileData.role
      }, opId);
      
      return createSuccessResponse(response, opId);
    }, 'signup', opId);
    
  } catch (error) {
    logServiceError('Auth', 'SIGNUP', error, opId, { 
      email: signupData.email 
    });
    return createErrorResponse(error, undefined, opId);
  }
};

/**
 * User login
 * Authenticates user and returns session with profile
 */
export const login = async (
  loginData: LoginRequest,
  correlationId?: string
): Promise<ServiceResponse<AuthResponse>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('Auth', 'LOGIN_START', { 
    email: loginData.email 
  }, opId);
  
  try {
    // Validate input
    validateRequired(loginData.email, 'email');
    validateRequired(loginData.password, 'password');
    validateEmail(loginData.email);
    
    return await measurePerformance(async () => {
      const supabase = getServerSupabaseClient();
      
      logDatabaseOperation('AUTH_LOGIN', { 
        email: loginData.email,
        correlationId: opId 
      });
      
      // Authenticate user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      });
      
      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          throw new ServiceError(
            ServiceErrorCode.UNAUTHORIZED,
            'Invalid email or password',
            opId,
            401
          );
        }
        handleDatabaseError(authError, 'LOGIN_AUTH', opId);
      }
      
      if (!authData.user || !authData.session) {
        throw new ServiceError(
          ServiceErrorCode.UNAUTHORIZED,
          'Authentication failed',
          opId,
          401
        );
      }
      
      // Get user profile
      logDatabaseOperation('PROFILE_GET', { 
        user_id: authData.user.id,
        correlationId: opId 
      });
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();
      
      if (profileError) {
        handleDatabaseError(profileError, 'LOGIN_PROFILE', opId);
      }
      
      // Prepare response
      const response: AuthResponse = {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          email_confirmed_at: authData.user.email_confirmed_at,
          profile: profileData
        },
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_in: authData.session.expires_in
      };
      
      logServiceOperation('Auth', 'LOGIN_SUCCESS', { 
        user_id: authData.user.id,
        email: loginData.email,
        role: profileData.role
      }, opId);
      
      return createSuccessResponse(response, opId);
    }, 'login', opId);
    
  } catch (error) {
    logServiceError('Auth', 'LOGIN', error, opId, { 
      email: loginData.email 
    });
    return createErrorResponse(error, undefined, opId);
  }
};

/**
 * User logout
 * Invalidates the current session
 */
export const logout = async (
  accessToken: string,
  correlationId?: string
): Promise<ServiceResponse<{ success: boolean }>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('Auth', 'LOGOUT_START', {}, opId);
  
  try {
    validateRequired(accessToken, 'access_token');
    
    return await measurePerformance(async () => {
      const supabase = getServerSupabaseClient();
      
      // Set the session for logout
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '' // Not needed for logout
      });
      
      logDatabaseOperation('AUTH_LOGOUT', { correlationId: opId });
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        handleDatabaseError(error, 'LOGOUT', opId);
      }
      
      logServiceOperation('Auth', 'LOGOUT_SUCCESS', {}, opId);
      
      return createSuccessResponse({ success: true }, opId);
    }, 'logout', opId);
    
  } catch (error) {
    logServiceError('Auth', 'LOGOUT', error, opId);
    return createErrorResponse(error, undefined, opId);
  }
};

/**
 * Verify JWT token and get user
 * Used by middleware to validate requests
 */
export const verifyToken = async (
  token: string,
  correlationId?: string
): Promise<ServiceResponse<AuthUser>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('Auth', 'VERIFY_TOKEN_START', {}, opId);
  
  try {
    validateRequired(token, 'token');
    
    return await measurePerformance(async () => {
      const supabase = getServerSupabaseClient();
      
      logDatabaseOperation('AUTH_VERIFY_TOKEN', { correlationId: opId });
      
      // Verify the JWT token
      const { data: userData, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !userData.user) {
        throw new ServiceError(
          ServiceErrorCode.INVALID_TOKEN,
          'Invalid or expired token',
          opId,
          401
        );
      }
      
      // Get user profile
      logDatabaseOperation('PROFILE_GET_BY_TOKEN', { 
        user_id: userData.user.id,
        correlationId: opId 
      });
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userData.user.id)
        .single();
      
      if (profileError) {
        handleDatabaseError(profileError, 'VERIFY_TOKEN_PROFILE', opId);
      }
      
      const authUser: AuthUser = {
        id: userData.user.id,
        email: userData.user.email!,
        email_confirmed_at: userData.user.email_confirmed_at,
        profile: profileData
      };
      
      logServiceOperation('Auth', 'VERIFY_TOKEN_SUCCESS', { 
        user_id: userData.user.id,
        role: profileData.role
      }, opId);
      
      return createSuccessResponse(authUser, opId);
    }, 'verifyToken', opId);
    
  } catch (error) {
    logServiceError('Auth', 'VERIFY_TOKEN', error, opId);
    return createErrorResponse(error, undefined, opId);
  }
};

/**
 * Refresh access token
 * Generates new access token using refresh token
 */
export const refreshToken = async (
  refreshToken: string,
  correlationId?: string
): Promise<ServiceResponse<{ access_token: string; expires_in: number }>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('Auth', 'REFRESH_TOKEN_START', {}, opId);
  
  try {
    validateRequired(refreshToken, 'refresh_token');
    
    return await measurePerformance(async () => {
      const supabase = getServerSupabaseClient();
      
      logDatabaseOperation('AUTH_REFRESH_TOKEN', { correlationId: opId });
      
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken
      });
      
      if (error || !data.session) {
        throw new ServiceError(
          ServiceErrorCode.INVALID_TOKEN,
          'Invalid refresh token',
          opId,
          401
        );
      }
      
      logServiceOperation('Auth', 'REFRESH_TOKEN_SUCCESS', {}, opId);
      
      return createSuccessResponse({
        access_token: data.session.access_token,
        expires_in: data.session.expires_in
      }, opId);
    }, 'refreshToken', opId);
    
  } catch (error) {
    logServiceError('Auth', 'REFRESH_TOKEN', error, opId);
    return createErrorResponse(error, undefined, opId);
  }
};

/**
 * Get user by ID (admin operation)
 * Used for admin user management
 */
export const getUserById = async (
  userId: string,
  correlationId?: string
): Promise<ServiceResponse<AuthUser>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('Auth', 'GET_USER_BY_ID_START', { user_id: userId }, opId);
  
  try {
    validateRequired(userId, 'user_id');
    validateUUID(userId, 'user_id');
    
    return await measurePerformance(async () => {
      const supabase = getServerSupabaseClient(true); // Use admin client
      
      logDatabaseOperation('AUTH_GET_USER_BY_ID', { 
        user_id: userId,
        correlationId: opId 
      });
      
      // Get auth user
      const { data: userData, error: authError } = await supabase.auth.admin.getUserById(userId);
      
      if (authError || !userData.user) {
        throw new ServiceError(
          ServiceErrorCode.RESOURCE_NOT_FOUND,
          'User not found',
          opId,
          404
        );
      }
      
      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (profileError) {
        handleDatabaseError(profileError, 'GET_USER_BY_ID_PROFILE', opId);
      }
      
      const authUser: AuthUser = {
        id: userData.user.id,
        email: userData.user.email!,
        email_confirmed_at: userData.user.email_confirmed_at,
        profile: profileData
      };
      
      logServiceOperation('Auth', 'GET_USER_BY_ID_SUCCESS', { 
        user_id: userId,
        role: profileData.role
      }, opId);
      
      return createSuccessResponse(authUser, opId);
    }, 'getUserById', opId);
    
  } catch (error) {
    logServiceError('Auth', 'GET_USER_BY_ID', error, opId, { user_id: userId });
    return createErrorResponse(error, undefined, opId);
  }
};

// Service health check
export const checkAuthServiceHealth = async (): Promise<ServiceResponse<{ status: string; timestamp: string }>> => {
  const opId = generateCorrelationId();
  
  try {
    const supabase = getServerSupabaseClient();
    
    // Simple auth service health check
    const { error } = await supabase.auth.getUser('dummy_token');
    
    // We expect this to fail, but it should fail with a specific error
    // If it throws an unexpected error, that indicates a service problem
    if (error && !error.message.includes('Invalid JWT')) {
      throw error;
    }
    
    return createSuccessResponse({
      status: 'healthy',
      timestamp: new Date().toISOString()
    }, opId);
    
  } catch (error) {
    logServiceError('Auth', 'HEALTH_CHECK', error, opId);
    return createErrorResponse(error, ServiceErrorCode.EXTERNAL_SERVICE_ERROR, opId);
  }
}; 