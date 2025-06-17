import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (for API routes)
export const createServerSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// Admin Supabase client with service role key (for privileged operations)
export const createAdminSupabaseClient = () => {
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// Server-side client factory with error handling
export const getServerSupabaseClient = (useServiceRole = false) => {
  try {
    return useServiceRole ? createAdminSupabaseClient() : createServerSupabaseClient();
  } catch (error) {
    console.error('[Supabase Client Error]:', error);
    throw error;
  }
};

// Database operation logger
export const logDatabaseOperation = (operation: string, data: any) => {
  console.log('[Database Operation]', {
    operation,
    timestamp: new Date().toISOString(),
    correlationId: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...data
  });
};

// Database types (will be generated later)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          full_name: string;
          phone_number: string | null;
          avatar_url: string | null;
          role: 'patient' | 'doctor' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          full_name: string;
          phone_number?: string | null;
          avatar_url?: string | null;
          role?: 'patient' | 'doctor' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          full_name?: string;
          phone_number?: string | null;
          avatar_url?: string | null;
          role?: 'patient' | 'doctor' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      specialties: {
        Row: {
          id: number;
          name: string;
          icon_url: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          icon_url?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          icon_url?: string | null;
          description?: string | null;
          created_at?: string;
        };
      };
      doctors: {
        Row: {
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
        };
        Insert: {
          user_id: string;
          specialty_id?: number | null;
          experience_years?: number | null;
          rating?: number | null;
          consultation_fee?: number | null;
          location?: string | null;
          approval_status?: boolean;
          is_accepting_new_patients?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          specialty_id?: number | null;
          experience_years?: number | null;
          rating?: number | null;
          consultation_fee?: number | null;
          location?: string | null;
          approval_status?: boolean;
          is_accepting_new_patients?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      doctor_schedules: {
        Row: {
          id: number;
          doctor_user_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          doctor_user_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          doctor_user_id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          created_at?: string;
        };
      };
      bookings: {
        Row: {
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
        };
        Insert: {
          id?: number;
          patient_user_id: string;
          doctor_user_id: string;
          specialty_id?: number | null;
          appointment_time: string;
          duration_minutes?: number;
          status?: 'pending' | 'confirmed' | 'cancelled_by_patient' | 'cancelled_by_doctor' | 'completed' | 'no_show';
          channel?: 'app' | 'whatsapp' | 'phone' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          patient_user_id?: string;
          doctor_user_id?: string;
          specialty_id?: number | null;
          appointment_time?: string;
          duration_minutes?: number;
          status?: 'pending' | 'confirmed' | 'cancelled_by_patient' | 'cancelled_by_doctor' | 'completed' | 'no_show';
          channel?: 'app' | 'whatsapp' | 'phone' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}; 