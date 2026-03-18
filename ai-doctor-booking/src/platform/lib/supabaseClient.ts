import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const createServerSupabaseClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

export const createAdminSupabaseClient = () => {
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
  }
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
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

export type { Database } from './database.types'; 