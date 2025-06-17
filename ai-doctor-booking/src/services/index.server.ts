/**
 * Server Services Registry
 * Central export point for all server-side services
 * Following MONOCODE principles with service health monitoring
 */

// Import all server services
import * as AuthService from './authService.server';
import * as SpecialtyService from './specialtyService.server';
import * as PatientService from './patientService.server';
import * as DoctorService from './doctorService.server';
import * as BookingService from './bookingService.server';

import { 
  ServiceResponse, 
  ServiceErrorCode,
  logServiceOperation, 
  logServiceError, 
  createSuccessResponse, 
  createErrorResponse,
  generateCorrelationId
} from '@/lib/serverUtils';

// Export all services
export {
  AuthService,
  SpecialtyService,
  PatientService,
  DoctorService,
  BookingService
};

// Service registry for health checks and monitoring
export const SERVICE_REGISTRY = {
  auth: AuthService,
  specialty: SpecialtyService,
  patient: PatientService,
  doctor: DoctorService,
  booking: BookingService
} as const;

export type ServiceName = keyof typeof SERVICE_REGISTRY;

/**
 * Health check for individual service
 */
export const checkServiceHealth = async (
  serviceName: ServiceName,
  correlationId?: string
): Promise<ServiceResponse<{ status: string; timestamp: string }>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('ServiceRegistry', 'CHECK_SERVICE_HEALTH_START', { 
    service: serviceName 
  }, opId);
  
  try {
    const service = SERVICE_REGISTRY[serviceName];
    
    if (!service) {
      throw new Error(`Service '${serviceName}' not found in registry`);
    }
    
    // All services should have a health check method
    const healthCheckMethod = (service as any)[`check${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)}ServiceHealth`];
    
    if (!healthCheckMethod) {
      throw new Error(`Health check method not found for service '${serviceName}'`);
    }
    
    const result = await healthCheckMethod();
    
    logServiceOperation('ServiceRegistry', 'CHECK_SERVICE_HEALTH_SUCCESS', { 
      service: serviceName,
      status: result.data?.status 
    }, opId);
    
    return result;
    
  } catch (error) {
    logServiceError('ServiceRegistry', 'CHECK_SERVICE_HEALTH', error, opId, { 
      service: serviceName 
    });
    return createErrorResponse(error, ServiceErrorCode.EXTERNAL_SERVICE_ERROR, opId);
  }
};

/**
 * Health check for all services
 */
export const checkAllServicesHealth = async (
  correlationId?: string
): Promise<ServiceResponse<Record<ServiceName, { status: string; timestamp: string; error?: string }>>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('ServiceRegistry', 'CHECK_ALL_SERVICES_HEALTH_START', {}, opId);
  
  try {
    const healthChecks = Object.keys(SERVICE_REGISTRY).map(async (serviceName) => {
      const result = await checkServiceHealth(serviceName as ServiceName, opId);
      return {
        serviceName: serviceName as ServiceName,
        result: result.success ? result.data! : { 
          status: 'unhealthy', 
          timestamp: new Date().toISOString(),
          error: result.error 
        }
      };
    });
    
    const results = await Promise.all(healthChecks);
    
    const healthStatus = results.reduce((acc, { serviceName, result }) => {
      acc[serviceName] = result;
      return acc;
    }, {} as Record<ServiceName, { status: string; timestamp: string; error?: string }>);
    
    const allHealthy = results.every(({ result }) => result.status === 'healthy');
    
    logServiceOperation('ServiceRegistry', 'CHECK_ALL_SERVICES_HEALTH_SUCCESS', { 
      all_healthy: allHealthy,
      services_count: results.length
    }, opId);
    
    return createSuccessResponse(healthStatus, opId);
    
  } catch (error) {
    logServiceError('ServiceRegistry', 'CHECK_ALL_SERVICES_HEALTH', error, opId);
    return createErrorResponse(error, ServiceErrorCode.INTERNAL_SERVER_ERROR, opId);
  }
};

/**
 * Initialize all services
 * Performs startup checks and configuration
 */
export const initializeServices = async (
  correlationId?: string
): Promise<ServiceResponse<{ initialized: ServiceName[]; failed: ServiceName[] }>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('ServiceRegistry', 'INITIALIZE_SERVICES_START', {}, opId);
  
  try {
    const initResults = await checkAllServicesHealth(opId);
    
    if (!initResults.success) {
      throw new Error('Failed to check services health during initialization');
    }
    
    const initialized: ServiceName[] = [];
    const failed: ServiceName[] = [];
    
    Object.entries(initResults.data!).forEach(([serviceName, healthData]) => {
      if (healthData.status === 'healthy') {
        initialized.push(serviceName as ServiceName);
      } else {
        failed.push(serviceName as ServiceName);
      }
    });
    
    logServiceOperation('ServiceRegistry', 'INITIALIZE_SERVICES_SUCCESS', { 
      initialized_count: initialized.length,
      failed_count: failed.length,
      initialized,
      failed
    }, opId);
    
    return createSuccessResponse({ initialized, failed }, opId);
    
  } catch (error) {
    logServiceError('ServiceRegistry', 'INITIALIZE_SERVICES', error, opId);
    return createErrorResponse(error, ServiceErrorCode.INTERNAL_SERVER_ERROR, opId);
  }
};

/**
 * Get service status summary for monitoring
 */
export const getServiceStatusSummary = async (
  correlationId?: string
): Promise<ServiceResponse<{
  total_services: number;
  healthy_services: number;
  unhealthy_services: number;
  overall_status: 'healthy' | 'degraded' | 'unhealthy';
  services: Record<ServiceName, { status: string; timestamp: string }>;
}>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('ServiceRegistry', 'GET_SERVICE_STATUS_SUMMARY_START', {}, opId);
  
  try {
    const healthResults = await checkAllServicesHealth(opId);
    
    if (!healthResults.success) {
      throw new Error('Failed to get services health status');
    }
    
    const services = healthResults.data!;
    const totalServices = Object.keys(services).length;
    const healthyServices = Object.values(services).filter(s => s.status === 'healthy').length;
    const unhealthyServices = totalServices - healthyServices;
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (unhealthyServices === 0) {
      overallStatus = 'healthy';
    } else if (healthyServices > unhealthyServices) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'unhealthy';
    }
    
    const summary = {
      total_services: totalServices,
      healthy_services: healthyServices,
      unhealthy_services: unhealthyServices,
      overall_status: overallStatus,
      services: Object.fromEntries(
        Object.entries(services).map(([name, data]) => [
          name,
          { status: data.status, timestamp: data.timestamp }
        ])
      ) as Record<ServiceName, { status: string; timestamp: string }>
    };
    
    logServiceOperation('ServiceRegistry', 'GET_SERVICE_STATUS_SUMMARY_SUCCESS', {
      overall_status: overallStatus,
      healthy_count: healthyServices,
      total_count: totalServices
    }, opId);
    
    return createSuccessResponse(summary, opId);
    
  } catch (error) {
    logServiceError('ServiceRegistry', 'GET_SERVICE_STATUS_SUMMARY', error, opId);
    return createErrorResponse(error, ServiceErrorCode.INTERNAL_SERVER_ERROR, opId);
  }
};

/**
 * Service performance metrics
 * Can be extended to track response times, error rates, etc.
 */
export interface ServiceMetrics {
  service_name: ServiceName;
  last_health_check: string;
  status: 'healthy' | 'unhealthy';
  uptime_percentage?: number;
  average_response_time?: number;
  error_rate?: number;
}

/**
 * Get basic service metrics
 */
export const getServiceMetrics = async (
  correlationId?: string
): Promise<ServiceResponse<ServiceMetrics[]>> => {
  const opId = correlationId || generateCorrelationId();
  
  logServiceOperation('ServiceRegistry', 'GET_SERVICE_METRICS_START', {}, opId);
  
  try {
    const healthResults = await checkAllServicesHealth(opId);
    
    if (!healthResults.success) {
      throw new Error('Failed to get services health for metrics');
    }
    
    const metrics: ServiceMetrics[] = Object.entries(healthResults.data!).map(([serviceName, healthData]) => ({
      service_name: serviceName as ServiceName,
      last_health_check: healthData.timestamp,
      status: healthData.status === 'healthy' ? 'healthy' : 'unhealthy',
      // These would be populated from actual monitoring data in a real system
      uptime_percentage: healthData.status === 'healthy' ? 99.9 : 85.0,
      average_response_time: Math.floor(Math.random() * 200) + 50, // Simulated
      error_rate: healthData.status === 'healthy' ? 0.1 : 5.0 // Simulated
    }));
    
    logServiceOperation('ServiceRegistry', 'GET_SERVICE_METRICS_SUCCESS', {
      metrics_count: metrics.length
    }, opId);
    
    return createSuccessResponse(metrics, opId);
    
  } catch (error) {
    logServiceError('ServiceRegistry', 'GET_SERVICE_METRICS', error, opId);
    return createErrorResponse(error, ServiceErrorCode.INTERNAL_SERVER_ERROR, opId);
  }
};

// Default export
export default {
  ...SERVICE_REGISTRY,
  checkServiceHealth,
  checkAllServicesHealth,
  initializeServices,
  getServiceStatusSummary,
  getServiceMetrics
}; 