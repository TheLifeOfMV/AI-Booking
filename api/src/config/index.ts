// Environment variable configuration with defaults
// In production, these would be loaded from environment variables or secrets service

export const config = {
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
  },
  
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'development-secret-do-not-use-in-production',
    tokenExpiresIn: '24h',
  },
  
  supabase: {
    url: process.env.SUPABASE_URL || 'https://urnoobvlfaolqqfxhjij.supabase.co',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceKey: process.env.SUPABASE_SERVICE_KEY || '',
  },
  
  database: {
    host: process.env.DB_HOST || 'db.urnoobvlfaolqqfxhjij.supabase.co',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    name: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: true,
    poolSize: 10,
  },
  
  business: {
    defaultSlotDuration: 30, // minutes
    minBookingNotice: 24, // hours
    maxAdvanceBookingDays: 60, // days
  },
}; 