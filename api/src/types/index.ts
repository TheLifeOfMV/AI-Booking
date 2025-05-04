// Type definitions for the medical booking system

// Database types
export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'patient' | 'doctor' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: string;
  specialty: string;
  bio?: string;
  years_of_experience?: number;
  education?: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  start_time: string;
  end_time: string;
  status: string;
  reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AvailabilityRule {
  id: string;
  doctor_id: string;
  day_of_week: number; // 0-6, Sunday-Saturday
  start_time: string; // HH:MM:SS format
  end_time: string; // HH:MM:SS format
  slot_duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface BlackoutDate {
  id: string;
  doctor_id: string;
  date: string; // YYYY-MM-DD format
  reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  id: number;
  business_hours_start: string; // HH:MM:SS format
  business_hours_end: string; // HH:MM:SS format
  timezone: string;
  slot_duration: number;
  min_booking_notice: number;
  updated_at: string;
}

export interface Holiday {
  id: number;
  date: string; // YYYY-MM-DD format
  description?: string;
  created_at: string;
}

// Service types
export interface TimeSlot {
  start_time: string;
  end_time: string;
  available: boolean;
}

export interface SlotRequest {
  doctor_id: string;
  start_date: string; // YYYY-MM-DD format
  end_date: string; // YYYY-MM-DD format
}

export interface BookingCreateRequest {
  doctor_id: string;
  patient_id: string;
  start_time: string;
  end_time: string;
  reason?: string;
  notes?: string;
}

export interface BookingResponse {
  success: boolean;
  booking?: Appointment;
  error?: string;
}

// Auth types
export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: string;
  iat: number;
  exp: number;
} 