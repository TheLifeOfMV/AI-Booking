/**
 * Booking Service - Server Side
 * Handles appointment booking, confirmation, and management
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

// Import doctor service for availability checking
import { getDoctorAvailableSlots } from './doctorService.server';

// Booking-related types
export interface Booking {
  id: number;
  patient_user_id: string;
  doctor_user_id: string;
  specialty_id: number | null;
  appointment_time: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'cancelled_by_patient' | 'cancelled_by_doctor' | 'completed' | 'no_show';
  channel: 'app' | 'whatsapp' | 'phone' | 'admin';
  created_at: string;
  updated_at: string;
  // Joined data
  patient?: {
    full_name: string;
    phone_number: string | null;
    avatar_url: string | null;
  };
  doctor?: {
    full_name: string;
    phone_number: string | null;
    avatar_url: string | null;
    consultation_fee: number | null;
    location: string | null;
  };
  specialty?: {
    id: number;
    name: string;
    icon_url: string | null;
  };
}

export interface CreateBookingRequest {
  patient_user_id: string;
  doctor_user_id: string;
  specialty_id?: number | null;
  appointment_time: string; // ISO datetime string
  duration_minutes?: number;
  channel?: 'app' | 'whatsapp' | 'phone' | 'admin';
}

export interface BookingFilters {
  patient_user_id?: string;
  doctor_user_id?: string;
  status?: string[];
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

/**
 * Create a new booking with auto-confirmation logic
 * Implements business rule: auto-confirm if doctor is approved and available
 */
export const createBooking = async (
  bookingData: CreateBookingRequest,
  correlationId?: string
): Promise<ServiceResponse<Booking>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('Booking', 'CREATE_BOOKING_START', { 
    doctor_id: bookingData.doctor_user_id,
    patient_id: bookingData.patient_user_id,
    appointment_time: bookingData.appointment_time
  }, opId);
  
  try {
    // Validate input
    validateRequired(bookingData.patient_user_id, 'patient_user_id');
    validateRequired(bookingData.doctor_user_id, 'doctor_user_id');
    validateRequired(bookingData.appointment_time, 'appointment_time');
    validateUUID(bookingData.patient_user_id, 'patient_user_id');
    validateUUID(bookingData.doctor_user_id, 'doctor_user_id');
    
    if (bookingData.specialty_id) {
      validatePositiveInteger(bookingData.specialty_id, 'specialty_id');
    }
    
    // Validate appointment time
    const appointmentDate = new Date(bookingData.appointment_time);
    if (isNaN(appointmentDate.getTime())) {
      throw new ServiceError(
        ServiceErrorCode.INVALID_FORMAT,
        'Invalid appointment time format',
        opId,
        400
      );
    }
    
    // Check if appointment is in the future
    if (appointmentDate <= new Date()) {
      throw new ServiceError(
        ServiceErrorCode.INVALID_INPUT,
        'Appointment time must be in the future',
        opId,
        400
      );
    }
    
    return await measurePerformance(async () => {
      const supabase = getServerSupabaseClient();
      
      // Step 1: Verify doctor exists and is approved
      logDatabaseOperation('DOCTOR_VERIFICATION', { 
        doctor_id: bookingData.doctor_user_id,
        correlationId: opId 
      });
      
      const { data: doctor, error: doctorError } = await supabase
        .from('doctors')
        .select('user_id, approval_status, is_accepting_new_patients, specialty_id')
        .eq('user_id', bookingData.doctor_user_id)
        .single();
      
      if (doctorError) {
        if (doctorError.code === 'PGRST116') {
          throw new ServiceError(
            ServiceErrorCode.RESOURCE_NOT_FOUND,
            'Doctor not found',
            opId,
            404
          );
        }
        handleDatabaseError(doctorError, 'CREATE_BOOKING_DOCTOR_CHECK', opId);
      }
      
      if (!doctor.approval_status) {
        throw new ServiceError(
          ServiceErrorCode.DOCTOR_UNAVAILABLE,
          'Doctor is not approved',
          opId,
          400
        );
      }
      
      if (!doctor.is_accepting_new_patients) {
        throw new ServiceError(
          ServiceErrorCode.DOCTOR_UNAVAILABLE,
          'Doctor is not accepting new patients',
          opId,
          400
        );
      }
      
      // Step 2: Check doctor availability for the requested time
      const appointmentDateStr = appointmentDate.toISOString().split('T')[0];
      const appointmentTimeStr = appointmentDate.toTimeString().substr(0, 5);
      
      const availabilityResult = await getDoctorAvailableSlots(
        bookingData.doctor_user_id,
        appointmentDateStr,
        opId
      );
      
      if (!availabilityResult.success) {
        throw new ServiceError(
          ServiceErrorCode.DOCTOR_UNAVAILABLE,
          'Unable to check doctor availability',
          opId,
          500
        );
      }
      
      const requestedSlot = availabilityResult.data?.find(slot => 
        slot.time === appointmentTimeStr
      );
      
      if (!requestedSlot || !requestedSlot.available) {
        throw new ServiceError(
          ServiceErrorCode.BOOKING_CONFLICT,
          'Requested time slot is not available',
          opId,
          409
        );
      }
      
      // Step 3: Check for existing booking conflicts
      const endTime = new Date(appointmentDate.getTime() + (bookingData.duration_minutes || 30) * 60000);
      
      logDatabaseOperation('BOOKING_CONFLICT_CHECK', { 
        doctor_id: bookingData.doctor_user_id,
        appointment_time: bookingData.appointment_time,
        correlationId: opId 
      });
      
      const { data: conflicts, error: conflictError } = await supabase
        .from('bookings')
        .select('id')
        .eq('doctor_user_id', bookingData.doctor_user_id)
        .gte('appointment_time', appointmentDate.toISOString())
        .lt('appointment_time', endTime.toISOString())
        .in('status', ['confirmed', 'pending']);
      
      if (conflictError) {
        handleDatabaseError(conflictError, 'CREATE_BOOKING_CONFLICT_CHECK', opId);
      }
      
      if (conflicts && conflicts.length > 0) {
        throw new ServiceError(
          ServiceErrorCode.BOOKING_CONFLICT,
          'Time slot conflicts with existing booking',
          opId,
          409
        );
      }
      
      // Step 4: Create the booking
      const bookingStatus = 'confirmed'; // Auto-confirm per business rule
      
      logDatabaseOperation('BOOKING_CREATE', { 
        patient_id: bookingData.patient_user_id,
        doctor_id: bookingData.doctor_user_id,
        status: bookingStatus,
        correlationId: opId 
      });
      
      const { data: newBooking, error: createError } = await supabase
        .from('bookings')
        .insert([{
          patient_user_id: bookingData.patient_user_id,
          doctor_user_id: bookingData.doctor_user_id,
          specialty_id: bookingData.specialty_id || doctor.specialty_id,
          appointment_time: appointmentDate.toISOString(),
          duration_minutes: bookingData.duration_minutes || 30,
          status: bookingStatus,
          channel: bookingData.channel || 'app'
        }])
        .select(`
          *,
          patient:profiles!patient_user_id(full_name, phone_number, avatar_url),
          doctor:profiles!doctor_user_id(full_name, phone_number, avatar_url),
          specialty:specialties(id, name, icon_url)
        `)
        .single();
      
      if (createError) {
        handleDatabaseError(createError, 'CREATE_BOOKING', opId);
      }
      
      // Transform the response data
      const transformedBooking: Booking = {
        ...newBooking,
        patient: newBooking.patient,
        doctor: newBooking.doctor,
        specialty: newBooking.specialty
      };
      
      logServiceOperation('Booking', 'CREATE_BOOKING_SUCCESS', { 
        booking_id: newBooking.id,
        patient_id: bookingData.patient_user_id,
        doctor_id: bookingData.doctor_user_id,
        status: bookingStatus,
        auto_confirmed: true
      }, opId);
      
      return createSuccessResponse(transformedBooking, opId);
    }, 'createBooking', opId);
    
  } catch (error) {
    logServiceError('Booking', 'CREATE_BOOKING', error, opId, { 
      bookingData 
    });
    return createErrorResponse(error, undefined, opId);
  }
};

/**
 * Get patient's bookings with filtering
 */
export const getPatientBookings = async (
  patientId: string,
  filters?: {
    status?: string[];
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  },
  correlationId?: string
): Promise<ServiceResponse<{ bookings: Booking[]; total: number }>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('Booking', 'GET_PATIENT_BOOKINGS_START', { 
    patient_id: patientId,
    filters 
  }, opId);
  
  try {
    validateRequired(patientId, 'patient_id');
    validateUUID(patientId, 'patient_id');
    
    return await measurePerformance(async () => {
      const supabase = getServerSupabaseClient();
      
      let query = supabase
        .from('bookings')
        .select(`
          *,
          patient:profiles!patient_user_id(full_name, phone_number, avatar_url),
          doctor:profiles!doctor_user_id(full_name, phone_number, avatar_url),
          specialty:specialties(id, name, icon_url)
        `, { count: 'exact' })
        .eq('patient_user_id', patientId)
        .order('appointment_time', { ascending: false });
      
      // Apply filters
      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }
      
      if (filters?.start_date) {
        query = query.gte('appointment_time', filters.start_date);
      }
      
      if (filters?.end_date) {
        query = query.lte('appointment_time', filters.end_date);
      }
      
      // Apply pagination
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
      }
      
      logDatabaseOperation('PATIENT_BOOKINGS_SELECT', { 
        patient_id: patientId,
        filters,
        correlationId: opId 
      });
      
      const { data, error, count } = await query;
      
      if (error) {
        handleDatabaseError(error, 'GET_PATIENT_BOOKINGS', opId);
      }
      
      // Transform the response data
      const transformedBookings: Booking[] = (data || []).map(booking => ({
        ...booking,
        patient: booking.patient,
        doctor: booking.doctor,
        specialty: booking.specialty
      }));
      
      logServiceOperation('Booking', 'GET_PATIENT_BOOKINGS_SUCCESS', { 
        patient_id: patientId,
        count: transformedBookings.length,
        total: count || 0
      }, opId);
      
      return createSuccessResponse({
        bookings: transformedBookings,
        total: count || 0
      }, opId);
    }, 'getPatientBookings', opId);
    
  } catch (error) {
    logServiceError('Booking', 'GET_PATIENT_BOOKINGS', error, opId, { 
      patient_id: patientId,
      filters 
    });
    return createErrorResponse(error, undefined, opId);
  }
};

/**
 * Get booking by ID with access control
 */
export const getBookingById = async (
  bookingId: number,
  userId?: string, // For access control
  correlationId?: string
): Promise<ServiceResponse<Booking | null>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('Booking', 'GET_BOOKING_BY_ID_START', { 
    booking_id: bookingId,
    user_id: userId 
  }, opId);
  
  try {
    validateRequired(bookingId, 'booking_id');
    validatePositiveInteger(bookingId, 'booking_id');
    
    if (userId) {
      validateUUID(userId, 'user_id');
    }
    
    return await measurePerformance(async () => {
      const supabase = getServerSupabaseClient();
      
      let query = supabase
        .from('bookings')
        .select(`
          *,
          patient:profiles!patient_user_id(full_name, phone_number, avatar_url),
          doctor:profiles!doctor_user_id(full_name, phone_number, avatar_url),
          specialty:specialties(id, name, icon_url)
        `)
        .eq('id', bookingId);
      
      // Apply access control if user ID is provided
      if (userId) {
        query = query.or(`patient_user_id.eq.${userId},doctor_user_id.eq.${userId}`);
      }
      
      logDatabaseOperation('BOOKING_SELECT_BY_ID', { 
        booking_id: bookingId,
        user_id: userId,
        correlationId: opId 
      });
      
      const { data, error } = await query.single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          logServiceOperation('Booking', 'GET_BOOKING_BY_ID_NOT_FOUND', { 
            booking_id: bookingId 
          }, opId);
          return createSuccessResponse(null, opId);
        }
        handleDatabaseError(error, 'GET_BOOKING_BY_ID', opId);
      }
      
      // Transform the response data
      const transformedBooking: Booking = {
        ...data,
        patient: data.patient,
        doctor: data.doctor,
        specialty: data.specialty
      };
      
      logServiceOperation('Booking', 'GET_BOOKING_BY_ID_SUCCESS', { 
        booking_id: bookingId,
        status: data.status
      }, opId);
      
      return createSuccessResponse(transformedBooking, opId);
    }, 'getBookingById', opId);
    
  } catch (error) {
    logServiceError('Booking', 'GET_BOOKING_BY_ID', error, opId, { 
      booking_id: bookingId,
      user_id: userId 
    });
    return createErrorResponse(error, undefined, opId);
  }
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (
  bookingId: number,
  newStatus: 'confirmed' | 'cancelled_by_patient' | 'cancelled_by_doctor' | 'completed' | 'no_show',
  userId?: string, // For access control
  correlationId?: string
): Promise<ServiceResponse<Booking>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('Booking', 'UPDATE_BOOKING_STATUS_START', { 
    booking_id: bookingId,
    new_status: newStatus,
    user_id: userId 
  }, opId);
  
  try {
    validateRequired(bookingId, 'booking_id');
    validateRequired(newStatus, 'new_status');
    validatePositiveInteger(bookingId, 'booking_id');
    
    if (userId) {
      validateUUID(userId, 'user_id');
    }
    
    return await measurePerformance(async () => {
      const supabase = getServerSupabaseClient();
      
      // First, get the current booking to check permissions and current status
      const { data: currentBooking, error: fetchError } = await supabase
        .from('bookings')
        .select('id, status, patient_user_id, doctor_user_id, appointment_time')
        .eq('id', bookingId)
        .single();
      
      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new ServiceError(
            ServiceErrorCode.RESOURCE_NOT_FOUND,
            'Booking not found',
            opId,
            404
          );
        }
        handleDatabaseError(fetchError, 'UPDATE_BOOKING_STATUS_FETCH', opId);
      }
      
      // Check access control
      if (userId && currentBooking.patient_user_id !== userId && currentBooking.doctor_user_id !== userId) {
        throw new ServiceError(
          ServiceErrorCode.FORBIDDEN,
          'Not authorized to update this booking',
          opId,
          403
        );
      }
      
      // Validate status transition
      if (currentBooking.status === newStatus) {
        throw new ServiceError(
          ServiceErrorCode.INVALID_INPUT,
          'Booking is already in the requested status',
          opId,
          400
        );
      }
      
      // Check if appointment is in the past for certain status changes
      const appointmentDate = new Date(currentBooking.appointment_time);
      const now = new Date();
      
      if (appointmentDate < now && newStatus === 'confirmed') {
        throw new ServiceError(
          ServiceErrorCode.INVALID_INPUT,
          'Cannot confirm past appointments',
          opId,
          400
        );
      }
      
      logDatabaseOperation('BOOKING_STATUS_UPDATE', { 
        booking_id: bookingId,
        old_status: currentBooking.status,
        new_status: newStatus,
        correlationId: opId 
      });
      
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .select(`
          *,
          patient:profiles!patient_user_id(full_name, phone_number, avatar_url),
          doctor:profiles!doctor_user_id(full_name, phone_number, avatar_url),
          specialty:specialties(id, name, icon_url)
        `)
        .single();
      
      if (error) {
        handleDatabaseError(error, 'UPDATE_BOOKING_STATUS', opId);
      }
      
      // Transform the response data
      const transformedBooking: Booking = {
        ...data,
        patient: data.patient,
        doctor: data.doctor,
        specialty: data.specialty
      };
      
      logServiceOperation('Booking', 'UPDATE_BOOKING_STATUS_SUCCESS', { 
        booking_id: bookingId,
        old_status: currentBooking.status,
        new_status: newStatus
      }, opId);
      
      return createSuccessResponse(transformedBooking, opId);
    }, 'updateBookingStatus', opId);
    
  } catch (error) {
    logServiceError('Booking', 'UPDATE_BOOKING_STATUS', error, opId, { 
      booking_id: bookingId,
      new_status: newStatus,
      user_id: userId 
    });
    return createErrorResponse(error, undefined, opId);
  }
};

/**
 * Get booking statistics for admin dashboard
 */
export const getBookingStatistics = async (
  filters?: {
    start_date?: string;
    end_date?: string;
  },
  correlationId?: string
): Promise<ServiceResponse<{
  total_bookings: number;
  confirmed_bookings: number;
  cancelled_bookings: number;
  completed_bookings: number;
  pending_bookings: number;
}>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('Booking', 'GET_BOOKING_STATISTICS_START', { filters }, opId);
  
  try {
    return await measurePerformance(async () => {
      const supabase = getServerSupabaseClient(true); // Use admin client
      
      let baseQuery = supabase.from('bookings').select('status', { count: 'exact' });
      
      if (filters?.start_date) {
        baseQuery = baseQuery.gte('appointment_time', filters.start_date);
      }
      if (filters?.end_date) {
        baseQuery = baseQuery.lte('appointment_time', filters.end_date);
      }
      
      logDatabaseOperation('BOOKING_STATISTICS', { 
        filters,
        correlationId: opId 
      });
      
      // Get total bookings
      const { count: totalBookings, error: totalError } = await baseQuery;
      
      if (totalError) {
        handleDatabaseError(totalError, 'GET_BOOKING_STATISTICS_TOTAL', opId);
      }
      
      // Get bookings by status
      const statusQueries = [
        { status: 'confirmed', key: 'confirmed_bookings' },
        { status: 'cancelled_by_patient', key: 'cancelled_bookings' },
        { status: 'cancelled_by_doctor', key: 'cancelled_bookings' },
        { status: 'completed', key: 'completed_bookings' },
        { status: 'pending', key: 'pending_bookings' }
      ];
      
      const statusCounts: any = {};
      
      for (const { status, key } of statusQueries) {
        let query = supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', status);
        
        if (filters?.start_date) {
          query = query.gte('appointment_time', filters.start_date);
        }
        if (filters?.end_date) {
          query = query.lte('appointment_time', filters.end_date);
        }
        
        const { count, error } = await query;
        
        if (error) {
          handleDatabaseError(error, `GET_BOOKING_STATISTICS_${status.toUpperCase()}`, opId);
        }
        
        if (key === 'cancelled_bookings') {
          statusCounts[key] = (statusCounts[key] || 0) + (count || 0);
        } else {
          statusCounts[key] = count || 0;
        }
      }
      
      const statistics = {
        total_bookings: totalBookings || 0,
        confirmed_bookings: statusCounts.confirmed_bookings,
        cancelled_bookings: statusCounts.cancelled_bookings,
        completed_bookings: statusCounts.completed_bookings,
        pending_bookings: statusCounts.pending_bookings
      };
      
      logServiceOperation('Booking', 'GET_BOOKING_STATISTICS_SUCCESS', statistics, opId);
      
      return createSuccessResponse(statistics, opId);
    }, 'getBookingStatistics', opId);
    
  } catch (error) {
    logServiceError('Booking', 'GET_BOOKING_STATISTICS', error, opId, { filters });
    return createErrorResponse(error, undefined, opId);
  }
};

// Service health check
export const checkBookingServiceHealth = async (): Promise<ServiceResponse<{ status: string; timestamp: string }>> => {
  const opId = generateCorrelationId();
  
  try {
    const supabase = getServerSupabaseClient();
    
    // Simple query to check database connectivity
    const { error } = await supabase
      .from('bookings')
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
    logServiceError('Booking', 'HEALTH_CHECK', error, opId);
    return createErrorResponse(error, ServiceErrorCode.DATABASE_ERROR, opId);
  }
}; 