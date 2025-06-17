import { logDatabaseOperation } from './supabaseClient';

// Service response type for consistent API responses
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  correlationId?: string;
}

// Error codes enum for standardized error handling
export enum ServiceErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  // Validation errors
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Business logic errors
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
  BOOKING_CONFLICT = 'BOOKING_CONFLICT',
  DOCTOR_UNAVAILABLE = 'DOCTOR_UNAVAILABLE',
  
  // System errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}

// Custom error class for service errors
export class ServiceError extends Error {
  constructor(
    public code: ServiceErrorCode,
    message: string,
    public correlationId?: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

// Generate correlation ID for request tracking
export const generateCorrelationId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Log service operation with structured format
export const logServiceOperation = (
  service: string,
  operation: string,
  data: any,
  correlationId?: string
) => {
  console.log(`[${service}Service]`, {
    operation,
    timestamp: new Date().toISOString(),
    correlationId: correlationId || generateCorrelationId(),
    ...data
  });
};

// Log service error with full context
export const logServiceError = (
  service: string,
  operation: string,
  error: any,
  correlationId?: string,
  additionalData?: any
) => {
  console.error(`[${service}Service] ERROR`, {
    operation,
    timestamp: new Date().toISOString(),
    correlationId: correlationId || generateCorrelationId(),
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error,
    ...additionalData
  });
};

// Create successful service response
export const createSuccessResponse = <T>(
  data: T,
  correlationId?: string
): ServiceResponse<T> => {
  return {
    success: true,
    data,
    correlationId
  };
};

// Create error service response
export const createErrorResponse = (
  error: string | Error | ServiceError,
  code?: ServiceErrorCode,
  correlationId?: string
): ServiceResponse => {
  if (error instanceof ServiceError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      correlationId: error.correlationId || correlationId
    };
  }
  
  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
      code: code || ServiceErrorCode.INTERNAL_SERVER_ERROR,
      correlationId
    };
  }
  
  return {
    success: false,
    error: error.toString(),
    code: code || ServiceErrorCode.INTERNAL_SERVER_ERROR,
    correlationId
  };
};

// Input validation helpers
export const validateRequired = (value: any, fieldName: string): void => {
  if (value === undefined || value === null || value === '') {
    throw new ServiceError(
      ServiceErrorCode.MISSING_REQUIRED_FIELD,
      `${fieldName} is required`,
      undefined,
      400
    );
  }
};

export const validateEmail = (email: string): void => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ServiceError(
      ServiceErrorCode.INVALID_FORMAT,
      'Invalid email format',
      undefined,
      400
    );
  }
};

export const validateUUID = (id: string, fieldName: string = 'ID'): void => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new ServiceError(
      ServiceErrorCode.INVALID_FORMAT,
      `${fieldName} must be a valid UUID`,
      undefined,
      400
    );
  }
};

export const validatePositiveInteger = (value: number, fieldName: string): void => {
  if (!Number.isInteger(value) || value <= 0) {
    throw new ServiceError(
      ServiceErrorCode.INVALID_FORMAT,
      `${fieldName} must be a positive integer`,
      undefined,
      400
    );
  }
};

// Database error handler
export const handleDatabaseError = (
  error: any,
  operation: string,
  correlationId?: string
): never => {
  logServiceError('Database', operation, error, correlationId);
  
  // Handle specific PostgreSQL errors
  if (error?.code) {
    switch (error.code) {
      case '23505': // unique_violation
        throw new ServiceError(
          ServiceErrorCode.RESOURCE_ALREADY_EXISTS,
          'Resource already exists',
          correlationId,
          409
        );
      case '23503': // foreign_key_violation
        throw new ServiceError(
          ServiceErrorCode.INVALID_INPUT,
          'Referenced resource does not exist',
          correlationId,
          400
        );
      case '23514': // check_violation
        throw new ServiceError(
          ServiceErrorCode.INVALID_INPUT,
          'Data violates database constraints',
          correlationId,
          400
        );
      default:
        throw new ServiceError(
          ServiceErrorCode.DATABASE_ERROR,
          'Database operation failed',
          correlationId,
          500
        );
    }
  }
  
  throw new ServiceError(
    ServiceErrorCode.DATABASE_ERROR,
    error?.message || 'Database operation failed',
    correlationId,
    500
  );
};

// Retry logic for transient failures
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt - 1)));
    }
  }
  
  throw lastError!;
};

// Performance monitoring helper
export const measurePerformance = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  correlationId?: string
): Promise<T> => {
  const startTime = Date.now();
  
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    
    logServiceOperation('Performance', 'MEASURE', {
      operationName,
      duration,
      status: 'success'
    }, correlationId);
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logServiceError('Performance', 'MEASURE', error, correlationId, {
      operationName,
      duration,
      status: 'error'
    });
    
    throw error;
  }
}; 