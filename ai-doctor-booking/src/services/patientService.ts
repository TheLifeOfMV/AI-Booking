import { Patient, PatientFormData } from '@/types/patient';

// Datos de ejemplo para pacientes
const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    name: 'María González',
    email: 'maria.gonzalez@example.com',
    phone: '+34 612 345 678',
    status: 'active',
    role: 'patient',
    createdAt: new Date('2023-05-12').toISOString(),
    avatar: '/avatars/patient1.jpg',
    bloodType: 'O+',
    allergies: ['Penicilina', 'Polen'],
    chronicConditions: ['Asma'],
    medications: ['Salbutamol'],
    emergencyContact: {
      name: 'Carlos González',
      relationship: 'Esposo',
      phone: '+34 698 765 432'
    },
    address: {
      street: 'Calle Mayor 23, 2º B',
      city: 'Madrid',
      postalCode: '28001',
      country: 'España'
    },
    insurance: {
      provider: 'Sanitas',
      policyNumber: 'SAN-12345678',
      expirationDate: '2024-12-31',
      coverageDetails: 'Cobertura completa'
    },
    medicalDocuments: [
      {
        id: 'doc1',
        title: 'Análisis de sangre',
        date: '2023-11-15',
        fileUrl: '/documents/analisis_sangre_nov2023.pdf',
        type: 'labResult'
      },
      {
        id: 'doc2',
        title: 'Radiografía de tórax',
        date: '2023-10-20',
        fileUrl: '/documents/radiografia_torax_oct2023.pdf',
        type: 'report'
      }
    ]
  }
];

/**
 * Obtiene el perfil de un paciente por su ID
 */
export const getPatientProfile = async (id: string): Promise<Patient | null> => {
  // Simular retraso de red
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const patient = MOCK_PATIENTS.find(p => p.id === id);
  return patient || null;
};

/**
 * Actualiza el perfil de un paciente
 */
export const updatePatientProfile = async (id: string, data: PatientFormData): Promise<Patient> => {
  // Simular retraso de red
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Buscar el paciente existente
  const index = MOCK_PATIENTS.findIndex(p => p.id === id);
  
  if (index === -1) {
    throw new Error('Paciente no encontrado');
  }
  
  // Crear un objeto con la estructura anidada correcta
  const updatedPatient: Patient = {
    ...MOCK_PATIENTS[index],
    name: data.name,
    email: data.email,
    phone: data.phone,
    bloodType: data.bloodType as any,
    allergies: data.allergies ? data.allergies.split(',').map(a => a.trim()) : undefined,
    chronicConditions: data.chronicConditions ? data.chronicConditions.split(',').map(c => c.trim()) : undefined,
    medications: data.medications ? data.medications.split(',').map(m => m.trim()) : undefined,
    emergencyContact: {
      name: data.emergencyContactName || '',
      relationship: data.emergencyContactRelationship || '',
      phone: data.emergencyContactPhone || ''
    },
    address: {
      street: data.street || '',
      city: data.city || '',
      postalCode: data.postalCode || '',
      country: data.country || ''
    },
    insurance: {
      provider: data.insuranceProvider || '',
      policyNumber: data.insurancePolicyNumber || '',
      expirationDate: data.insuranceExpirationDate || '',
      coverageDetails: data.insuranceCoverageDetails || ''
    }
  };
  
  // En una aplicación real, esto sería una llamada API
  MOCK_PATIENTS[index] = updatedPatient;
  
  return updatedPatient;
};

/**
 * Obtiene los documentos médicos de un paciente
 */
export const getPatientDocuments = async (patientId: string) => {
  // Simular retraso de red
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const patient = MOCK_PATIENTS.find(p => p.id === patientId);
  return patient?.medicalDocuments || [];
};

/**
 * Obtiene las citas de un paciente
 */
export const getPatientAppointments = async (patientId: string) => {
  // Simular retraso de red
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // Datos de ejemplo para citas
  return [
    {
      id: 'apt1',
      doctorName: 'Dr. Alejandro Serrano',
      doctorSpecialty: 'Cardiología',
      date: '2023-12-15',
      time: '10:00',
      status: 'confirmed',
      location: 'Centro Médico Alameda, Consulta 5',
      isVirtual: false
    },
    {
      id: 'apt2',
      doctorName: 'Dra. Lucía Martínez',
      doctorSpecialty: 'Dermatología',
      date: '2023-11-10',
      time: '16:30',
      status: 'completed',
      location: 'Consulta Online',
      isVirtual: true
    },
    {
      id: 'apt3',
      doctorName: 'Dr. Roberto Fernández',
      doctorSpecialty: 'Oftalmología',
      date: '2024-01-20',
      time: '09:15',
      status: 'pending',
      location: 'Hospital Universitario, Piso 3',
      isVirtual: false
    }
  ];
}; 