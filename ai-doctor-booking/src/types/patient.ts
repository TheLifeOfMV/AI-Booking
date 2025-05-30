import { User } from './user';

/**
 * Representa el perfil completo de un paciente
 */
export interface Patient extends User {
  // Información básica adicional
  lastName?: string;
  documentType?: 'cedula_ciudadania' | 'pasaporte' | 'tarjeta_identidad' | 'cedula_extranjeria' | 'registro_civil';
  documentNumber?: string;
  birthDate?: string;
  gender?: 'masculino' | 'femenino' | 'otro';
  
  // Contacto de emergencia (simplificado)
  emergencyContact?: {
    name: string;
    phone: string;
  };

  // Información de seguro médico
  insurance?: {
    provider: string;
    policyNumber: string;
    expirationDate: string;
    coverageDetails: string;
  };
}

/**
 * Modelo para crear o actualizar un paciente
 */
export interface PatientFormData {
  name: string;
  lastName?: string;
  email: string;
  phone: string;
  documentType?: string;
  documentNumber?: string;
  birthDate?: string;
  gender?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceExpirationDate?: string;
  insuranceCoverageDetails?: string;
} 