import { User } from './user';

/**
 * Representa el perfil completo de un paciente
 */
export interface Patient extends User {
  // Información médica
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies?: string[];
  chronicConditions?: string[];
  medications?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  
  // Información de dirección
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  
  // Información de seguro médico
  insurance?: {
    provider: string;
    policyNumber: string;
    expirationDate: string;
    coverageDetails: string;
  };
  
  // Documentos médicos
  medicalDocuments?: Array<{
    id: string;
    title: string;
    date: string;
    fileUrl: string;
    type: 'report' | 'prescription' | 'labResult' | 'other';
  }>;
}

/**
 * Modelo para crear o actualizar un paciente
 */
export interface PatientFormData {
  name: string;
  email: string;
  phone: string;
  bloodType?: string;
  allergies?: string;
  chronicConditions?: string;
  medications?: string;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceExpirationDate?: string;
  insuranceCoverageDetails?: string;
} 