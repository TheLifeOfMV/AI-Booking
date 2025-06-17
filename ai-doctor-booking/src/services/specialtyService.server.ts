/**
 * Specialty Service - Server Side
 * Handles medical specialties data operations
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
  measurePerformance
} from '@/lib/serverUtils';

// Specialty data type (matches database schema)
export interface Specialty {
  id: number;
  name: string;
  icon_url: string | null;
  description: string | null;
  created_at: string;
}

export interface SpecialtyInsert {
  name: string;
  icon_url?: string | null;
  description?: string | null;
}

/**
 * Get all medical specialties
 * Public endpoint - no authentication required
 */
export const getSpecialties = async (correlationId?: string): Promise<ServiceResponse<Specialty[]>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('Specialty', 'GET_SPECIALTIES_START', {}, opId);
  
  try {
    return await measurePerformance(async () => {
      const supabase = getServerSupabaseClient();
      
      logDatabaseOperation('SPECIALTY_SELECT_ALL', { correlationId: opId });
      
      const { data, error } = await supabase
        .from('specialties')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        handleDatabaseError(error, 'GET_SPECIALTIES', opId);
      }
      
      if (!data || data.length === 0) {
        logServiceOperation('Specialty', 'GET_SPECIALTIES_EMPTY', {}, opId);
      }
      
      logServiceOperation('Specialty', 'GET_SPECIALTIES_SUCCESS', { 
        count: data?.length || 0 
      }, opId);
      
      return createSuccessResponse(data || [], opId);
    }, 'getSpecialties', opId);
    
  } catch (error) {
    logServiceError('Specialty', 'GET_SPECIALTIES', error, opId);
    return createErrorResponse(error, undefined, opId);
  }
};

/**
 * Get a specialty by ID
 * Public endpoint - no authentication required
 */
export const getSpecialtyById = async (
  id: number, 
  correlationId?: string
): Promise<ServiceResponse<Specialty | null>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('Specialty', 'GET_SPECIALTY_BY_ID_START', { id }, opId);
  
  try {
    // Validate input
    if (!Number.isInteger(id) || id <= 0) {
      throw new ServiceError(
        ServiceErrorCode.INVALID_INPUT,
        'Specialty ID must be a positive integer',
        opId,
        400
      );
    }
    
    return await measurePerformance(async () => {
      const supabase = getServerSupabaseClient();
      
      logDatabaseOperation('SPECIALTY_SELECT_BY_ID', { id, correlationId: opId });
      
      const { data, error } = await supabase
        .from('specialties')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        // Handle "not found" as a special case
        if (error.code === 'PGRST116') {
          logServiceOperation('Specialty', 'GET_SPECIALTY_BY_ID_NOT_FOUND', { id }, opId);
          return createSuccessResponse(null, opId);
        }
        handleDatabaseError(error, 'GET_SPECIALTY_BY_ID', opId);
      }
      
      logServiceOperation('Specialty', 'GET_SPECIALTY_BY_ID_SUCCESS', { 
        id, 
        found: !!data 
      }, opId);
      
      return createSuccessResponse(data, opId);
    }, 'getSpecialtyById', opId);
    
  } catch (error) {
    logServiceError('Specialty', 'GET_SPECIALTY_BY_ID', error, opId, { id });
    return createErrorResponse(error, undefined, opId);
  }
};

/**
 * Create a new specialty
 * Admin-only operation (will be used by admin service)
 */
export const createSpecialty = async (
  specialtyData: SpecialtyInsert,
  correlationId?: string
): Promise<ServiceResponse<Specialty>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('Specialty', 'CREATE_SPECIALTY_START', { 
    name: specialtyData.name 
  }, opId);
  
  try {
    // Validate input
    if (!specialtyData.name?.trim()) {
      throw new ServiceError(
        ServiceErrorCode.MISSING_REQUIRED_FIELD,
        'Specialty name is required',
        opId,
        400
      );
    }
    
    return await measurePerformance(async () => {
      const supabase = getServerSupabaseClient(true); // Use admin client
      
      logDatabaseOperation('SPECIALTY_INSERT', { 
        name: specialtyData.name,
        correlationId: opId 
      });
      
      const { data, error } = await supabase
        .from('specialties')
        .insert([{
          name: specialtyData.name.trim(),
          icon_url: specialtyData.icon_url,
          description: specialtyData.description?.trim() || null
        }])
        .select()
        .single();
      
      if (error) {
        handleDatabaseError(error, 'CREATE_SPECIALTY', opId);
      }
      
      logServiceOperation('Specialty', 'CREATE_SPECIALTY_SUCCESS', { 
        id: data.id,
        name: data.name 
      }, opId);
      
      return createSuccessResponse(data, opId);
    }, 'createSpecialty', opId);
    
  } catch (error) {
    logServiceError('Specialty', 'CREATE_SPECIALTY', error, opId, { 
      specialtyData 
    });
    return createErrorResponse(error, undefined, opId);
  }
};

/**
 * Update an existing specialty
 * Admin-only operation
 */
export const updateSpecialty = async (
  id: number,
  updates: Partial<SpecialtyInsert>,
  correlationId?: string
): Promise<ServiceResponse<Specialty>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('Specialty', 'UPDATE_SPECIALTY_START', { id }, opId);
  
  try {
    // Validate input
    if (!Number.isInteger(id) || id <= 0) {
      throw new ServiceError(
        ServiceErrorCode.INVALID_INPUT,
        'Specialty ID must be a positive integer',
        opId,
        400
      );
    }
    
    if (Object.keys(updates).length === 0) {
      throw new ServiceError(
        ServiceErrorCode.INVALID_INPUT,
        'At least one field must be updated',
        opId,
        400
      );
    }
    
    return await measurePerformance(async () => {
      const supabase = getServerSupabaseClient(true); // Use admin client
      
      // Prepare update data
      const updateData: any = {};
      if (updates.name !== undefined) {
        updateData.name = updates.name.trim();
      }
      if (updates.icon_url !== undefined) {
        updateData.icon_url = updates.icon_url;
      }
      if (updates.description !== undefined) {
        updateData.description = updates.description?.trim() || null;
      }
      
      logDatabaseOperation('SPECIALTY_UPDATE', { 
        id, 
        updates: updateData,
        correlationId: opId 
      });
      
      const { data, error } = await supabase
        .from('specialties')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          throw new ServiceError(
            ServiceErrorCode.RESOURCE_NOT_FOUND,
            'Specialty not found',
            opId,
            404
          );
        }
        handleDatabaseError(error, 'UPDATE_SPECIALTY', opId);
      }
      
      logServiceOperation('Specialty', 'UPDATE_SPECIALTY_SUCCESS', { 
        id: data.id,
        name: data.name 
      }, opId);
      
      return createSuccessResponse(data, opId);
    }, 'updateSpecialty', opId);
    
  } catch (error) {
    logServiceError('Specialty', 'UPDATE_SPECIALTY', error, opId, { 
      id, 
      updates 
    });
    return createErrorResponse(error, undefined, opId);
  }
};

/**
 * Get specialties with doctor count
 * Useful for displaying specialty statistics
 */
export const getSpecialtiesWithDoctorCount = async (
  correlationId?: string
): Promise<ServiceResponse<(Specialty & { doctor_count: number })[]>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('Specialty', 'GET_SPECIALTIES_WITH_COUNT_START', {}, opId);
  
  try {
    return await measurePerformance(async () => {
      const supabase = getServerSupabaseClient();
      
      logDatabaseOperation('SPECIALTY_SELECT_WITH_DOCTOR_COUNT', { correlationId: opId });
      
      const { data, error } = await supabase
        .from('specialties')
        .select(`
          *,
          doctors!inner(count)
        `)
        .order('name', { ascending: true });
      
      if (error) {
        handleDatabaseError(error, 'GET_SPECIALTIES_WITH_COUNT', opId);
      }
      
      // Transform the data to include doctor count
      const transformedData = (data || []).map(specialty => ({
        ...specialty,
        doctor_count: specialty.doctors?.[0]?.count || 0
      }));
      
      logServiceOperation('Specialty', 'GET_SPECIALTIES_WITH_COUNT_SUCCESS', { 
        count: transformedData.length 
      }, opId);
      
      return createSuccessResponse(transformedData, opId);
    }, 'getSpecialtiesWithDoctorCount', opId);
    
  } catch (error) {
    logServiceError('Specialty', 'GET_SPECIALTIES_WITH_COUNT', error, opId);
    return createErrorResponse(error, undefined, opId);
  }
};

// Service health check
export const checkSpecialtyServiceHealth = async (): Promise<ServiceResponse<{ status: string; timestamp: string }>> => {
  const opId = generateCorrelationId();
  
  try {
    const supabase = getServerSupabaseClient();
    
    // Simple query to check database connectivity
    const { error } = await supabase
      .from('specialties')
      .select('count')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    return createSuccessResponse({
      status: 'healthy',
      timestamp: new Date().toISOString()
    }, opId);
    
  } catch (error) {
    logServiceError('Specialty', 'HEALTH_CHECK', error, opId);
    return createErrorResponse(error, ServiceErrorCode.DATABASE_ERROR, opId);
  }
}; 