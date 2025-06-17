/**
 * Doctor Service - Server Side
 * Handles doctor profile management, availability, and scheduling logic
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
  validateUUID,
  validatePositiveInteger
} from '@/lib/serverUtils';

// Doctor-related types
export interface DoctorProfile {
  user_id: string;
  specialty_id: number | null;
  experience_years: number | null;
  rating: number | null;
  consultation_fee: number | null;
  location: string | null;
  approval_status: boolean;
  is_accepting_new_patients: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  profile?: {
    full_name: string;
    phone_number: string | null;
    avatar_url: string | null;
    role: 'doctor';
  };
  specialty?: {
    id: number;
    name: string;
    icon_url: string | null;
    description: string | null;
  };
}

export interface DoctorSchedule {
  id: number;
  doctor_user_id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  created_at: string;
}

export interface TimeSlot {
  time: string; // HH:MM format
  available: boolean;
  booking_id?: number | null;
}

export interface DoctorUpdate {
  specialty_id?: number | null;
  experience_years?: number | null;
  consultation_fee?: number | null;
  location?: string | null;
  is_accepting_new_patients?: boolean;
}

/**
 * Get approved doctors with optional filtering
 * Public endpoint - only returns approved doctors
 */
export const getApprovedDoctors = async (
  filters?: {
    specialtyId?: number;
    date?: string; // ISO date string
    location?: string;
    limit?: number;
    offset?: number;
  },
  correlationId?: string
): Promise<ServiceResponse<{ doctors: DoctorProfile[]; total: number }>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('Doctor', 'GET_APPROVED_DOCTORS_START', { filters }, opId);
  
  try {
    return await measurePerformance(async () => {
      const supabase = getServerSupabaseClient();
      
      let query = supabase
        .from('doctors')
        .select(`
          *,
          profiles!inner(full_name, phone_number, avatar_url, role),
          specialties(id, name, icon_url, description)
        `, { count: 'exact' })
        .eq('approval_status', true)
        .eq('is_accepting_new_patients', true)
        .order('rating', { ascending: false });
      
      // Apply specialty filter
      if (filters?.specialtyId) {
        validatePositiveInteger(filters.specialtyId, 'specialty_id');
        query = query.eq('specialty_id', filters.specialtyId);
      }
      
      // Apply location filter
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      
      // Apply pagination
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
      }
      
      logDatabaseOperation('DOCTOR_SELECT_APPROVED', { 
        filters,
        correlationId: opId 
      });
      
      const { data, error, count } = await query;
      
      if (error) {
        handleDatabaseError(error, 'GET_APPROVED_DOCTORS', opId);
      }
      
      // Transform data structure
      const transformedData = (data || []).map(doctor => ({
        ...doctor,
        profile: doctor.profiles,
        specialty: doctor.specialties
      }));
      
      // If date filter is provided, filter by availability
      let filteredDoctors = transformedData;
      if (filters?.date) {
        const availabilityPromises = transformedData.map(async (doctor) => {
          const availability = await getDoctorAvailableSlots(doctor.user_id, filters.date!, opId);
          return {
            doctor,
            hasAvailability: availability.success && (availability.data?.length || 0) > 0
          };
        });
        
        const availabilityResults = await Promise.all(availabilityPromises);
        filteredDoctors = availabilityResults
          .filter(result => result.hasAvailability)
          .map(result => result.doctor);
      }
      
      logServiceOperation('Doctor', 'GET_APPROVED_DOCTORS_SUCCESS', { 
        count: filteredDoctors.length,
        total: count || 0,
        filtered_by_date: !!filters?.date
      }, opId);
      
      return createSuccessResponse({
        doctors: filteredDoctors,
        total: count || 0
      }, opId);
    }, 'getApprovedDoctors', opId);
    
  } catch (error) {
    logServiceError('Doctor', 'GET_APPROVED_DOCTORS', error, opId, { filters });
    return createErrorResponse(error, undefined, opId);
  }
};

/**
 * Get doctor's available time slots for a specific date
 * Complex availability calculation logic
 */
export const getDoctorAvailableSlots = async (
  doctorId: string,
  date: string, // ISO date string (YYYY-MM-DD)
  correlationId?: string
): Promise<ServiceResponse<TimeSlot[]>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('Doctor', 'GET_DOCTOR_AVAILABLE_SLOTS_START', { 
    doctor_id: doctorId,
    date 
  }, opId);
  
  try {
    // Validate input
    validateRequired(doctorId, 'doctor_id');
    validateRequired(date, 'date');
    validateUUID(doctorId, 'doctor_id');
    
    // Validate date format
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      throw new ServiceError(
        ServiceErrorCode.INVALID_FORMAT,
        'Invalid date format. Use YYYY-MM-DD',
        opId,
        400
      );
    }
    
    return await measurePerformance(async () => {
      const supabase = getServerSupabaseClient();
      
      // Get doctor's schedule for the day of week
      const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      logDatabaseOperation('DOCTOR_SCHEDULE_SELECT', { 
        doctor_id: doctorId,
        day_of_week: dayOfWeek,
        correlationId: opId 
      });
      
      const { data: schedules, error: scheduleError } = await supabase
        .from('doctor_schedules')
        .select('*')
        .eq('doctor_user_id', doctorId)
        .eq('day_of_week', dayOfWeek);
      
      if (scheduleError) {
        handleDatabaseError(scheduleError, 'GET_DOCTOR_SCHEDULE', opId);
      }
      
      if (!schedules || schedules.length === 0) {
        logServiceOperation('Doctor', 'GET_DOCTOR_AVAILABLE_SLOTS_NO_SCHEDULE', { 
          doctor_id: doctorId,
          date,
          day_of_week: dayOfWeek
        }, opId);
        return createSuccessResponse([], opId);
      }
      
      // Get existing bookings for the date
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      logDatabaseOperation('DOCTOR_BOOKINGS_SELECT', { 
        doctor_id: doctorId,
        date: date,
        correlationId: opId 
      });
      
      const { data: bookings, error: bookingError } = await supabase
        .from('bookings')
        .select('id, appointment_time, duration_minutes, status')
        .eq('doctor_user_id', doctorId)
        .gte('appointment_time', startOfDay.toISOString())
        .lte('appointment_time', endOfDay.toISOString())
        .in('status', ['confirmed', 'pending']);
      
      if (bookingError) {
        handleDatabaseError(bookingError, 'GET_DOCTOR_BOOKINGS', opId);
      }
      
      // Generate time slots
      const allSlots: TimeSlot[] = [];
      const slotDuration = 30; // 30-minute slots
      
      for (const schedule of schedules) {
        const slots = generateTimeSlots(
          schedule.start_time,
          schedule.end_time,
          slotDuration,
          targetDate,
          bookings || []
        );
        allSlots.push(...slots);
      }
      
      // Sort slots by time
      allSlots.sort((a, b) => a.time.localeCompare(b.time));
      
      // Filter out past slots for today
      const now = new Date();
      const isToday = targetDate.toDateString() === now.toDateString();
      const availableSlots = allSlots.filter(slot => {
        if (!isToday) return true;
        
        const slotDateTime = new Date(targetDate);
        const [hours, minutes] = slot.time.split(':').map(Number);
        slotDateTime.setHours(hours, minutes, 0, 0);
        
        return slotDateTime > now;
      });
      
      logServiceOperation('Doctor', 'GET_DOCTOR_AVAILABLE_SLOTS_SUCCESS', { 
        doctor_id: doctorId,
        date,
        total_slots: availableSlots.length,
        available_slots: availableSlots.filter(s => s.available).length
      }, opId);
      
      return createSuccessResponse(availableSlots, opId);
    }, 'getDoctorAvailableSlots', opId);
    
  } catch (error) {
    logServiceError('Doctor', 'GET_DOCTOR_AVAILABLE_SLOTS', error, opId, { 
      doctor_id: doctorId,
      date 
    });
    return createErrorResponse(error, undefined, opId);
  }
};

/**
 * Helper function to generate time slots
 */
function generateTimeSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number,
  date: Date,
  existingBookings: any[]
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startTimeMinutes = startHour * 60 + startMinute;
  const endTimeMinutes = endHour * 60 + endMinute;
  
  for (let minutes = startTimeMinutes; minutes < endTimeMinutes; minutes += durationMinutes) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    // Check if this slot conflicts with existing bookings
    const slotDateTime = new Date(date);
    slotDateTime.setHours(hour, minute, 0, 0);
    
    const conflicting = existingBookings.find(booking => {
      const bookingStart = new Date(booking.appointment_time);
      const bookingEnd = new Date(bookingStart.getTime() + (booking.duration_minutes * 60000));
      
      return slotDateTime >= bookingStart && slotDateTime < bookingEnd;
    });
    
    slots.push({
      time: timeString,
      available: !conflicting,
      booking_id: conflicting?.id || null
    });
  }
  
  return slots;
}

/**
 * Get doctor profile by ID
 */
export const getDoctorProfile = async (
  doctorId: string,
  correlationId?: string
): Promise<ServiceResponse<DoctorProfile | null>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('Doctor', 'GET_DOCTOR_PROFILE_START', { doctor_id: doctorId }, opId);
  
  try {
    validateRequired(doctorId, 'doctor_id');
    validateUUID(doctorId, 'doctor_id');
    
    return await measurePerformance(async () => {
      const supabase = getServerSupabaseClient();
      
      logDatabaseOperation('DOCTOR_PROFILE_SELECT', { 
        doctor_id: doctorId,
        correlationId: opId 
      });
      
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          profiles!inner(full_name, phone_number, avatar_url, role),
          specialties(id, name, icon_url, description)
        `)
        .eq('user_id', doctorId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          logServiceOperation('Doctor', 'GET_DOCTOR_PROFILE_NOT_FOUND', { doctor_id: doctorId }, opId);
          return createSuccessResponse(null, opId);
        }
        handleDatabaseError(error, 'GET_DOCTOR_PROFILE', opId);
      }
      
      // Transform data structure
      const transformedData = {
        ...data,
        profile: data.profiles,
        specialty: data.specialties
      };
      
      logServiceOperation('Doctor', 'GET_DOCTOR_PROFILE_SUCCESS', { 
        doctor_id: doctorId,
        approved: data.approval_status
      }, opId);
      
      return createSuccessResponse(transformedData, opId);
    }, 'getDoctorProfile', opId);
    
  } catch (error) {
    logServiceError('Doctor', 'GET_DOCTOR_PROFILE', error, opId, { doctor_id: doctorId });
    return createErrorResponse(error, undefined, opId);
  }
};

/**
 * Update doctor profile
 */
export const updateDoctorProfile = async (
  doctorId: string,
  updateData: DoctorUpdate,
  correlationId?: string
): Promise<ServiceResponse<DoctorProfile>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('Doctor', 'UPDATE_DOCTOR_PROFILE_START', { 
    doctor_id: doctorId 
  }, opId);
  
  try {
    validateRequired(doctorId, 'doctor_id');
    validateUUID(doctorId, 'doctor_id');
    
    if (Object.keys(updateData).length === 0) {
      throw new ServiceError(
        ServiceErrorCode.INVALID_INPUT,
        'At least one field must be updated',
        opId,
        400
      );
    }
    
    // Validate fields
    if (updateData.specialty_id !== undefined && updateData.specialty_id !== null) {
      validatePositiveInteger(updateData.specialty_id, 'specialty_id');
    }
    if (updateData.experience_years !== undefined && updateData.experience_years !== null) {
      validatePositiveInteger(updateData.experience_years, 'experience_years');
    }
    if (updateData.consultation_fee !== undefined && updateData.consultation_fee !== null) {
      validatePositiveInteger(updateData.consultation_fee, 'consultation_fee');
    }
    
    return await measurePerformance(async () => {
      const supabase = getServerSupabaseClient();
      
      const cleanUpdateData: any = {
        updated_at: new Date().toISOString(),
        ...updateData
      };
      
      if (updateData.location !== undefined) {
        cleanUpdateData.location = updateData.location?.trim() || null;
      }
      
      logDatabaseOperation('DOCTOR_PROFILE_UPDATE', { 
        doctor_id: doctorId,
        updates: Object.keys(cleanUpdateData),
        correlationId: opId 
      });
      
      const { data, error } = await supabase
        .from('doctors')
        .update(cleanUpdateData)
        .eq('user_id', doctorId)
        .select(`
          *,
          profiles!inner(full_name, phone_number, avatar_url, role),
          specialties(id, name, icon_url, description)
        `)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          throw new ServiceError(
            ServiceErrorCode.RESOURCE_NOT_FOUND,
            'Doctor profile not found',
            opId,
            404
          );
        }
        handleDatabaseError(error, 'UPDATE_DOCTOR_PROFILE', opId);
      }
      
      const transformedData = {
        ...data,
        profile: data.profiles,
        specialty: data.specialties
      };
      
      logServiceOperation('Doctor', 'UPDATE_DOCTOR_PROFILE_SUCCESS', { 
        doctor_id: doctorId
      }, opId);
      
      return createSuccessResponse(transformedData, opId);
    }, 'updateDoctorProfile', opId);
    
  } catch (error) {
    logServiceError('Doctor', 'UPDATE_DOCTOR_PROFILE', error, opId, { 
      doctor_id: doctorId,
      updateData 
    });
    return createErrorResponse(error, undefined, opId);
  }
};

/**
 * Toggle doctor approval status (admin operation)
 */
export const toggleDoctorApproval = async (
  doctorId: string,
  approved: boolean,
  correlationId?: string
): Promise<ServiceResponse<DoctorProfile>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('Doctor', 'TOGGLE_DOCTOR_APPROVAL_START', { 
    doctor_id: doctorId,
    approved 
  }, opId);
  
  try {
    validateRequired(doctorId, 'doctor_id');
    validateUUID(doctorId, 'doctor_id');
    
    return await measurePerformance(async () => {
      const supabase = getServerSupabaseClient(true); // Use admin client
      
      logDatabaseOperation('DOCTOR_APPROVAL_UPDATE', { 
        doctor_id: doctorId,
        approved,
        correlationId: opId 
      });
      
      const { data, error } = await supabase
        .from('doctors')
        .update({
          approval_status: approved,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', doctorId)
        .select(`
          *,
          profiles!inner(full_name, phone_number, avatar_url, role),
          specialties(id, name, icon_url, description)
        `)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          throw new ServiceError(
            ServiceErrorCode.RESOURCE_NOT_FOUND,
            'Doctor not found',
            opId,
            404
          );
        }
        handleDatabaseError(error, 'TOGGLE_DOCTOR_APPROVAL', opId);
      }
      
      const transformedData = {
        ...data,
        profile: data.profiles,
        specialty: data.specialties
      };
      
      logServiceOperation('Doctor', 'TOGGLE_DOCTOR_APPROVAL_SUCCESS', { 
        doctor_id: doctorId,
        approved: data.approval_status
      }, opId);
      
      return createSuccessResponse(transformedData, opId);
    }, 'toggleDoctorApproval', opId);
    
  } catch (error) {
    logServiceError('Doctor', 'TOGGLE_DOCTOR_APPROVAL', error, opId, { 
      doctor_id: doctorId,
      approved 
    });
    return createErrorResponse(error, undefined, opId);
  }
};

// Service health check
export const checkDoctorServiceHealth = async (): Promise<ServiceResponse<{ status: string; timestamp: string }>> => {
  const opId = generateCorrelationId();
  
  try {
    const supabase = getServerSupabaseClient();
    
    // Check if we can query doctors table
    const { error } = await supabase
      .from('doctors')
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
    logServiceError('Doctor', 'HEALTH_CHECK', error, opId);
    return createErrorResponse(error, ServiceErrorCode.DATABASE_ERROR, opId);
  }
}; 