import postgres from 'postgres';
import { createClient } from '@supabase/supabase-js';

// Environment variables (should be loaded via dotenv in a real app)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://urnoobvlfaolqqfxhjij.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Create a Postgres client
const sql = postgres({
  host: process.env.DB_HOST || 'db.urnoobvlfaolqqfxhjij.supabase.co',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'postgres',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: true,
  max: 10, // Max connections
  idle_timeout: 30, // Idle connection timeout in seconds
  transform: {
    undefined: null, // Convert undefined to null
  },
});

export default sql;

// Helper functions for common database operations
export async function transaction<T>(callback: (sql: postgres.Sql) => Promise<T>): Promise<T> {
  return sql.begin(async (sql) => {
    return await callback(sql);
  });
}

// Utility to handle common error patterns
export function handleDatabaseError(error: unknown): Error {
  console.error('Database error:', error);
  
  if (error instanceof Error) {
    // Check for specific postgres errors if needed
    return error;
  }
  
  return new Error('Unknown database error');
}

// Export typed query helpers for common operations
export const queries = {
  // Doctor availability queries
  availability: {
    getRules: (doctorId: string) => sql`
      SELECT * FROM availability_rules 
      WHERE doctor_id = ${doctorId}
      ORDER BY day_of_week, start_time
    `,
    getBlackoutDates: (doctorId: string, startDate: string, endDate: string) => sql`
      SELECT * FROM blackout_dates 
      WHERE doctor_id = ${doctorId} 
      AND date BETWEEN ${startDate} AND ${endDate}
      ORDER BY date
    `,
  },
  
  // Appointment queries
  appointments: {
    getByDoctor: (doctorId: string, startDate: string, endDate: string) => sql`
      SELECT * FROM appointments 
      WHERE doctor_id = ${doctorId} 
      AND start_time >= ${startDate}::timestamptz
      AND end_time <= ${endDate}::timestamptz
      AND status != 'cancelled'
      ORDER BY start_time
    `,
    create: (appointment: any) => sql`
      INSERT INTO appointments (
        doctor_id, patient_id, start_time, end_time, 
        status, reason, notes
      ) VALUES (
        ${appointment.doctor_id}, ${appointment.patient_id},
        ${appointment.start_time}, ${appointment.end_time},
        ${appointment.status || 'scheduled'}, ${appointment.reason}, ${appointment.notes}
      ) RETURNING *
    `,
    findConflicts: (doctorId: string, startTime: string, endTime: string) => sql`
      SELECT COUNT(*) as count FROM appointments 
      WHERE doctor_id = ${doctorId}
      AND status != 'cancelled'
      AND (
        (start_time <= ${startTime}::timestamptz AND end_time > ${startTime}::timestamptz) OR
        (start_time < ${endTime}::timestamptz AND end_time >= ${endTime}::timestamptz) OR
        (start_time >= ${startTime}::timestamptz AND end_time <= ${endTime}::timestamptz)
      )
    `,
  },
  
  // Settings queries
  settings: {
    get: () => sql`SELECT * FROM settings ORDER BY id LIMIT 1`,
  },
  
  // Holiday queries
  holidays: {
    getInRange: (startDate: string, endDate: string) => sql`
      SELECT * FROM holidays
      WHERE date BETWEEN ${startDate} AND ${endDate}
      ORDER BY date
    `,
  },
}; 