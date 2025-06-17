/**
 * Patient Service - Server Side
 * Handles patient profile management and data operations
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
  validateUUID
} from '@/lib/serverUtils';

// Patient-related types
export interface PatientProfile {
  user_id: string;
  full_name: string;
  phone_number: string | null;
  avatar_url: string | null;
  role: 'patient';
  created_at: string;
  updated_at: string;
}

export interface PatientProfileUpdate {
  full_name?: string;
  phone_number?: string | null;
  avatar_url?: string | null;
}

/**
 * Get patient profile by user ID
 * Includes RLS enforcement to ensure users can only access their own profile
 */
export const getPatientProfile = async (
  userId: string,
  correlationId?: string
): Promise<ServiceResponse<PatientProfile | null>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('Patient', 'GET_PATIENT_PROFILE_START', { user_id: userId }, opId);
  
  try {
    // Validate input
    validateRequired(userId, 'user_id');
    validateUUID(userId, 'user_id');
    
    return await measurePerformance(async () => {
      const supabase = getServerSupabaseClient();
      
      logDatabaseOperation('PATIENT_PROFILE_SELECT', { 
        user_id: userId,
        correlationId: opId 
      });
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'patient')
        .single();
      
      if (error) {
        // Handle "not found" as a special case
        if (error.code === 'PGRST116') {
          logServiceOperation('Patient', 'GET_PATIENT_PROFILE_NOT_FOUND', { user_id: userId }, opId);
          return createSuccessResponse(null, opId);
        }
        handleDatabaseError(error, 'GET_PATIENT_PROFILE', opId);
      }
      
      logServiceOperation('Patient', 'GET_PATIENT_PROFILE_SUCCESS', { 
        user_id: userId,
        found: !!data 
      }, opId);
      
      return createSuccessResponse(data, opId);
    }, 'getPatientProfile', opId);
    
  } catch (error) {
    logServiceError('Patient', 'GET_PATIENT_PROFILE', error, opId, { user_id: userId });
    return createErrorResponse(error, undefined, opId);
  }
};

/**
 * Update patient profile
 * Includes RLS enforcement and input validation
 */
export const updatePatientProfile = async (
  userId: string,
  updateData: PatientProfileUpdate,
  correlationId?: string
): Promise<ServiceResponse<PatientProfile>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('Patient', 'UPDATE_PATIENT_PROFILE_START', { 
    user_id: userId 
  }, opId);
  
  try {
    // Validate input
    validateRequired(userId, 'user_id');
    validateUUID(userId, 'user_id');
    
    if (Object.keys(updateData).length === 0) {
      throw new ServiceError(
        ServiceErrorCode.INVALID_INPUT,
        'At least one field must be updated',
        opId,
        400
      );
    }
    
    // Validate specific fields if they're provided
    if (updateData.full_name !== undefined && !updateData.full_name?.trim()) {
      throw new ServiceError(
        ServiceErrorCode.INVALID_INPUT,
        'Full name cannot be empty',
        opId,
        400
      );
    }
    
    return await measurePerformance(async () => {
      const supabase = getServerSupabaseClient();
      
      // Prepare update data
      const cleanUpdateData: any = {
        updated_at: new Date().toISOString()
      };
      
      if (updateData.full_name !== undefined) {
        cleanUpdateData.full_name = updateData.full_name.trim();
      }
      if (updateData.phone_number !== undefined) {
        cleanUpdateData.phone_number = updateData.phone_number?.trim() || null;
      }
      if (updateData.avatar_url !== undefined) {
        cleanUpdateData.avatar_url = updateData.avatar_url;
      }
      
      logDatabaseOperation('PATIENT_PROFILE_UPDATE', { 
        user_id: userId,
        updates: Object.keys(cleanUpdateData),
        correlationId: opId 
      });
      
      const { data, error } = await supabase
        .from('profiles')
        .update(cleanUpdateData)
        .eq('user_id', userId)
        .eq('role', 'patient')
        .select()
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          throw new ServiceError(
            ServiceErrorCode.RESOURCE_NOT_FOUND,
            'Patient profile not found',
            opId,
            404
          );
        }
        handleDatabaseError(error, 'UPDATE_PATIENT_PROFILE', opId);
      }
      
      logServiceOperation('Patient', 'UPDATE_PATIENT_PROFILE_SUCCESS', { 
        user_id: userId,
        name: data.full_name
      }, opId);
      
      return createSuccessResponse(data, opId);
    }, 'updatePatientProfile', opId);
    
  } catch (error) {
    logServiceError('Patient', 'UPDATE_PATIENT_PROFILE', error, opId, { 
      user_id: userId,
      updateData 
    });
    return createErrorResponse(error, undefined, opId);
  }
};

/**
 * Create patient profile (used during registration)
 * Admin or system operation
 */
export const createPatientProfile = async (
  profileData: {
    user_id: string;
    full_name: string;
    phone_number?: string | null;
    avatar_url?: string | null;
  },
  correlationId?: string
): Promise<ServiceResponse<PatientProfile>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('Patient', 'CREATE_PATIENT_PROFILE_START', { 
    user_id: profileData.user_id 
  }, opId);
  
  try {
    // Validate input
    validateRequired(profileData.user_id, 'user_id');
    validateRequired(profileData.full_name, 'full_name');
    validateUUID(profileData.user_id, 'user_id');
    
    return await measurePerformance(async () => {
      const supabase = getServerSupabaseClient(true); // Use admin client
      
      logDatabaseOperation('PATIENT_PROFILE_CREATE', { 
        user_id: profileData.user_id,
        correlationId: opId 
      });
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          user_id: profileData.user_id,
          full_name: profileData.full_name.trim(),
          phone_number: profileData.phone_number?.trim() || null,
          avatar_url: profileData.avatar_url,
          role: 'patient'
        }])
        .select()
        .single();
      
      if (error) {
        handleDatabaseError(error, 'CREATE_PATIENT_PROFILE', opId);
      }
      
      logServiceOperation('Patient', 'CREATE_PATIENT_PROFILE_SUCCESS', { 
        user_id: data.user_id,
        name: data.full_name
      }, opId);
      
      return createSuccessResponse(data, opId);
    }, 'createPatientProfile', opId);
    
  } catch (error) {
    logServiceError('Patient', 'CREATE_PATIENT_PROFILE', error, opId, { 
      profileData 
    });
    return createErrorResponse(error, undefined, opId);
  }
};

/**
 * Get all patients (admin operation)
 * Used for admin user management
 */
export const getAllPatients = async (
  filters?: {
    search?: string;
    limit?: number;
    offset?: number;
  },
  correlationId?: string
): Promise<ServiceResponse<{ patients: PatientProfile[]; total: number }>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('Patient', 'GET_ALL_PATIENTS_START', { 
    filters 
  }, opId);
  
  try {
    return await measurePerformance(async () => {
      const supabase = getServerSupabaseClient(true); // Use admin client
      
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('role', 'patient')
        .order('created_at', { ascending: false });
      
      // Apply search filter
      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,phone_number.ilike.%${filters.search}%`);
      }
      
      // Apply pagination
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
      }
      
      logDatabaseOperation('PATIENT_SELECT_ALL', { 
        filters,
        correlationId: opId 
      });
      
      const { data, error, count } = await query;
      
      if (error) {
        handleDatabaseError(error, 'GET_ALL_PATIENTS', opId);
      }
      
      logServiceOperation('Patient', 'GET_ALL_PATIENTS_SUCCESS', { 
        count: data?.length || 0,
        total: count || 0
      }, opId);
      
      return createSuccessResponse({
        patients: data || [],
        total: count || 0
      }, opId);
    }, 'getAllPatients', opId);
    
  } catch (error) {
    logServiceError('Patient', 'GET_ALL_PATIENTS', error, opId, { filters });
    return createErrorResponse(error, undefined, opId);
  }
};

/**
 * Delete patient profile (admin operation)
 * Soft delete by updating a status field or hard delete
 */
export const deletePatientProfile = async (
  userId: string,
  correlationId?: string
): Promise<ServiceResponse<{ success: boolean }>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('Patient', 'DELETE_PATIENT_PROFILE_START', { 
    user_id: userId 
  }, opId);
  
  try {
    // Validate input
    validateRequired(userId, 'user_id');
    validateUUID(userId, 'user_id');
    
    return await measurePerformance(async () => {
      const supabase = getServerSupabaseClient(true); // Use admin client
      
      // First check if patient exists
      const { data: existingPatient, error: checkError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', userId)
        .eq('role', 'patient')
        .single();
      
      if (checkError) {
        if (checkError.code === 'PGRST116') {
          throw new ServiceError(
            ServiceErrorCode.RESOURCE_NOT_FOUND,
            'Patient profile not found',
            opId,
            404
          );
        }
        handleDatabaseError(checkError, 'DELETE_PATIENT_PROFILE_CHECK', opId);
      }
      
      logDatabaseOperation('PATIENT_PROFILE_DELETE', { 
        user_id: userId,
        correlationId: opId 
      });
      
      // Delete the profile
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'patient');
      
      if (deleteError) {
        handleDatabaseError(deleteError, 'DELETE_PATIENT_PROFILE', opId);
      }
      
      logServiceOperation('Patient', 'DELETE_PATIENT_PROFILE_SUCCESS', { 
        user_id: userId
      }, opId);
      
      return createSuccessResponse({ success: true }, opId);
    }, 'deletePatientProfile', opId);
    
  } catch (error) {
    logServiceError('Patient', 'DELETE_PATIENT_PROFILE', error, opId, { 
      user_id: userId 
    });
    return createErrorResponse(error, undefined, opId);
  }
};

/**
 * Get patient statistics (admin dashboard)
 * Returns aggregated data about patients
 */
export const getPatientStatistics = async (
  correlationId?: string
): Promise<ServiceResponse<{
  total_patients: number;
  recent_signups: number;
  active_patients: number;
}>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('Patient', 'GET_PATIENT_STATISTICS_START', {}, opId);
  
  try {
    return await measurePerformance(async () => {
      const supabase = getServerSupabaseClient(true); // Use admin client
      
      logDatabaseOperation('PATIENT_STATISTICS', { correlationId: opId });
      
      // Get total patients
      const { count: totalPatients, error: totalError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'patient');
      
      if (totalError) {
        handleDatabaseError(totalError, 'GET_PATIENT_STATISTICS_TOTAL', opId);
      }
      
      // Get recent signups (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: recentSignups, error: recentError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'patient')
        .gte('created_at', thirtyDaysAgo.toISOString());
      
      if (recentError) {
        handleDatabaseError(recentError, 'GET_PATIENT_STATISTICS_RECENT', opId);
      }
      
      // For now, consider all patients as active
      // In a real app, you might have activity tracking
      const activePatients = totalPatients || 0;
      
      const statistics = {
        total_patients: totalPatients || 0,
        recent_signups: recentSignups || 0,
        active_patients: activePatients
      };
      
      logServiceOperation('Patient', 'GET_PATIENT_STATISTICS_SUCCESS', statistics, opId);
      
      return createSuccessResponse(statistics, opId);
    }, 'getPatientStatistics', opId);
    
  } catch (error) {
    logServiceError('Patient', 'GET_PATIENT_STATISTICS', error, opId);
    return createErrorResponse(error, undefined, opId);
  }
};

// Service health check
export const checkPatientServiceHealth = async (): Promise<ServiceResponse<{ status: string; timestamp: string }>> => {
  const opId = generateCorrelationId();
  
  try {
    const supabase = getServerSupabaseClient();
    
    // Simple query to check database connectivity and RLS
    const { error } = await supabase
      .from('profiles')
      .select('count')
      .eq('role', 'patient')
      .limit(1)
      .single();
    
    // We expect this might fail due to RLS, but it should connect to the database
    if (error && !error.code.includes('PGRST')) {
      throw error;
    }
    
    return createSuccessResponse({
      status: 'healthy',
      timestamp: new Date().toISOString()
    }, opId);
    
  } catch (error) {
    logServiceError('Patient', 'HEALTH_CHECK', error, opId);
    return createErrorResponse(error, ServiceErrorCode.DATABASE_ERROR, opId);
  }
}; 