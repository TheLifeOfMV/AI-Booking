import { Doctor, DoctorFilter, CredentialStatus } from '@/types/doctor';

// Mock data for doctors
const MOCK_DOCTORS: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Amanda Chen',
    email: 'amanda.chen@example.com',
    phone: '+1 555-123-4567',
    status: 'active',
    specialtyId: '1',
    specialtyName: 'Cardiología',
    experience: '10+ años',
    rating: 4.8,
    credentials: {
      licenseNumber: 'MC12345',
      expiryDate: '2025-05-15',
      status: 'verified',
      verifiedAt: new Date('2022-05-15').toISOString(),
      documentUrls: ['/documents/license-1.pdf']
    },
    education: [
      {
        degree: 'MD',
        institution: 'Stanford University',
        year: 2012
      }
    ],
    approvalStatus: true,
    availableTimes: [
      {
        dayOfWeek: 1,
        slots: [
          { start: '09:00', end: '10:00' },
          { start: '11:00', end: '12:00' }
        ]
      },
      {
        dayOfWeek: 3,
        slots: [
          { start: '14:00', end: '15:00' },
          { start: '16:00', end: '17:00' }
        ]
      }
    ],
    location: 'San Francisco Medical Center',
    createdAt: new Date('2022-05-15').toISOString(),
  },
  {
    id: '2',
    name: 'Dr. James Wilson',
    email: 'james.wilson@example.com',
    phone: '+1 555-987-6543',
    status: 'active',
    specialtyId: '2',
    specialtyName: 'Neurología',
    experience: '15+ años',
    rating: 4.9,
    credentials: {
      licenseNumber: 'MC67890',
      expiryDate: '2024-11-20',
      status: 'verified',
      verifiedAt: new Date('2021-11-20').toISOString(),
      documentUrls: ['/documents/license-2.pdf']
    },
    education: [
      {
        degree: 'MD',
        institution: 'Harvard Medical School',
        year: 2007
      },
      {
        degree: 'PhD',
        institution: 'MIT',
        year: 2010
      }
    ],
    approvalStatus: true,
    availableTimes: [
      {
        dayOfWeek: 2,
        slots: [
          { start: '10:00', end: '11:00' },
          { start: '13:00', end: '14:00' }
        ]
      },
      {
        dayOfWeek: 4,
        slots: [
          { start: '09:00', end: '10:00' },
          { start: '15:00', end: '16:00' }
        ]
      }
    ],
    location: 'Boston Medical Center',
    createdAt: new Date('2021-11-20').toISOString(),
  },
  {
    id: '3',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1 555-456-7890',
    status: 'active',
    specialtyId: '3',
    specialtyName: 'Dermatología',
    experience: '8+ años',
    rating: 4.7,
    credentials: {
      licenseNumber: 'MC54321',
      expiryDate: '2023-12-10',
      status: 'pending',
      documentUrls: ['/documents/license-3.pdf']
    },
    education: [
      {
        degree: 'MD',
        institution: 'UCLA Medical School',
        year: 2015
      }
    ],
    approvalStatus: false,
    availableTimes: [
      {
        dayOfWeek: 1,
        slots: [
          { start: '13:00', end: '14:00' },
          { start: '15:00', end: '16:00' }
        ]
      },
      {
        dayOfWeek: 5,
        slots: [
          { start: '10:00', end: '11:00' },
          { start: '14:00', end: '15:00' }
        ]
      }
    ],
    location: 'Los Angeles Medical Plaza',
    createdAt: new Date('2022-01-10').toISOString(),
  },
  {
    id: '4',
    name: 'Dr. Robert Kim',
    email: 'robert.kim@example.com',
    phone: '+1 555-789-0123',
    status: 'inactive',
    specialtyId: '4',
    specialtyName: 'Oftalmología',
    experience: '12+ años',
    rating: 4.6,
    credentials: {
      licenseNumber: 'MC98765',
      expiryDate: '2024-03-25',
      status: 'rejected',
      documentUrls: ['/documents/license-4.pdf']
    },
    education: [
      {
        degree: 'MD',
        institution: 'Johns Hopkins University',
        year: 2010
      }
    ],
    approvalStatus: false,
    availableTimes: [
      {
        dayOfWeek: 2,
        slots: [
          { start: '09:00', end: '10:00' },
          { start: '11:00', end: '12:00' }
        ]
      },
      {
        dayOfWeek: 4,
        slots: [
          { start: '13:00', end: '14:00' },
          { start: '15:00', end: '16:00' }
        ]
      }
    ],
    location: 'Chicago Medical Center',
    createdAt: new Date('2022-03-25').toISOString(),
  },
  {
    id: '5',
    name: 'Dr. Emily Martinez',
    email: 'emily.martinez@example.com',
    phone: '+1 555-234-5678',
    status: 'active',
    specialtyId: '5',
    specialtyName: 'Pediatría',
    experience: '7+ años',
    rating: 4.9,
    credentials: {
      licenseNumber: 'MC24680',
      expiryDate: '2025-08-15',
      status: 'pending',
      documentUrls: ['/documents/license-5.pdf']
    },
    education: [
      {
        degree: 'MD',
        institution: 'University of Pennsylvania',
        year: 2016
      }
    ],
    approvalStatus: false,
    availableTimes: [
      {
        dayOfWeek: 1,
        slots: [
          { start: '10:00', end: '11:00' },
          { start: '14:00', end: '15:00' }
        ]
      },
      {
        dayOfWeek: 3,
        slots: [
          { start: '09:00', end: '10:00' },
          { start: '13:00', end: '14:00' }
        ]
      }
    ],
    location: 'Philadelphia Children\'s Hospital',
    createdAt: new Date('2022-08-15').toISOString(),
  },
];

// Mock specialties data
export const SPECIALTIES = [
  { id: '1', name: 'Cardiología' },
  { id: '2', name: 'Neurología' },
  { id: '3', name: 'Dermatología' },
  { id: '4', name: 'Oftalmología' },
  { id: '5', name: 'Pediatría' },
  { id: '6', name: 'Ortopedia' },
  { id: '7', name: 'Otorrinolaringología' },
  { id: '8', name: 'Psiquiatría' },
];

/**
 * Fetch doctors with optional filtering and pagination
 */
export const getDoctors = async (
  filters?: DoctorFilter,
  page: number = 1,
  limit: number = 10
): Promise<{ doctors: Doctor[]; total: number }> => {
  try {
    // This would be an actual API call in production
    // const response = await fetch(`/api/doctors?page=${page}&limit=${limit}`, { ... });
    
    // Using mock data with filtering logic
    let filteredDoctors = [...MOCK_DOCTORS];
    
    // Apply filters if provided
    if (filters) {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredDoctors = filteredDoctors.filter(
          doctor => 
            doctor.name.toLowerCase().includes(searchTerm) ||
            doctor.email.toLowerCase().includes(searchTerm) ||
            doctor.specialtyName.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filters.specialtyId) {
        filteredDoctors = filteredDoctors.filter(
          doctor => doctor.specialtyId === filters.specialtyId
        );
      }
      
      if (filters.credentialStatus) {
        filteredDoctors = filteredDoctors.filter(
          doctor => doctor.credentials.status === filters.credentialStatus
        );
      }
      
      if (filters.approvalStatus !== undefined) {
        filteredDoctors = filteredDoctors.filter(
          doctor => doctor.approvalStatus === filters.approvalStatus
        );
      }
    }
    
    // Calculate pagination
    const total = filteredDoctors.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedDoctors = filteredDoctors.slice(start, end);
    
    // Simulate network delay for realistic testing
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      doctors: paginatedDoctors,
      total
    };
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw new Error('Failed to fetch doctors. Please try again later.');
  }
};

/**
 * Get a single doctor by ID
 */
export const getDoctorById = async (doctorId: string): Promise<Doctor | null> => {
  try {
    // This would be an actual API call in production
    // const response = await fetch(`/api/doctors/${doctorId}`, { ... });
    
    // Using mock data
    const doctor = MOCK_DOCTORS.find(d => d.id === doctorId) || null;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return doctor;
  } catch (error) {
    console.error(`Error fetching doctor ${doctorId}:`, error);
    throw new Error('Failed to fetch doctor details. Please try again later.');
  }
};

/**
 * Update a doctor's record
 */
export const updateDoctor = async (doctorId: string, doctorData: Partial<Doctor>): Promise<Doctor> => {
  try {
    // This would be an actual API call in production
    // const response = await fetch(`/api/doctors/${doctorId}`, { 
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(doctorData)
    // });
    
    // Using mock data
    const doctorIndex = MOCK_DOCTORS.findIndex(d => d.id === doctorId);
    if (doctorIndex === -1) {
      throw new Error('Doctor not found');
    }
    
    // Update doctor data
    const updatedDoctor = {
      ...MOCK_DOCTORS[doctorIndex],
      ...doctorData,
      // Handle nested updates
      credentials: {
        ...MOCK_DOCTORS[doctorIndex].credentials,
        ...(doctorData.credentials || {})
      }
    };
    
    MOCK_DOCTORS[doctorIndex] = updatedDoctor;
    
    // Simulate network delay and potential failures (10% chance)
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.9) {
          reject(new Error('Network error'));
        } else {
          resolve(null);
        }
      }, 500);
    });
    
    return updatedDoctor;
  } catch (error) {
    console.error(`Error updating doctor ${doctorId}:`, error);
    throw new Error('Failed to update doctor. Please try again later.');
  }
};

/**
 * Toggle doctor approval status
 */
export const toggleDoctorApproval = async (doctorId: string, approve: boolean): Promise<Doctor> => {
  try {
    // This would be an actual API call in production
    // const response = await fetch(`/api/doctors/${doctorId}/approval`, { 
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ approved: approve })
    // });
    
    // Using mock data
    const doctorIndex = MOCK_DOCTORS.findIndex(d => d.id === doctorId);
    if (doctorIndex === -1) {
      throw new Error('Doctor not found');
    }
    
    // Update approval status
    const updatedDoctor = {
      ...MOCK_DOCTORS[doctorIndex],
      approvalStatus: approve
    };
    
    MOCK_DOCTORS[doctorIndex] = updatedDoctor;
    
    // Log approval change for auditing (this would go to a server-side logging system in production)
    console.log(`Doctor ${doctorId} approval status changed to ${approve ? 'approved' : 'unapproved'}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return updatedDoctor;
  } catch (error) {
    console.error(`Error updating doctor approval ${doctorId}:`, error);
    throw new Error('Failed to update doctor approval status. Please try again later.');
  }
};

/**
 * Update doctor credential status
 */
export const updateCredentialStatus = async (
  doctorId: string, 
  status: CredentialStatus,
): Promise<Doctor> => {
  try {
    // This would be an actual API call in production
    // const response = await fetch(`/api/doctors/${doctorId}/credentials`, { 
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ status })
    // });
    
    // Using mock data
    const doctorIndex = MOCK_DOCTORS.findIndex(d => d.id === doctorId);
    if (doctorIndex === -1) {
      throw new Error('Doctor not found');
    }
    
    // Update credential status
    const updatedDoctor = {
      ...MOCK_DOCTORS[doctorIndex],
      credentials: {
        ...MOCK_DOCTORS[doctorIndex].credentials,
        status,
        // If status is verified, add verification date
        ...(status === 'verified' ? { verifiedAt: new Date().toISOString() } : {})
      }
    };
    
    MOCK_DOCTORS[doctorIndex] = updatedDoctor;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return updatedDoctor;
  } catch (error) {
    console.error(`Error updating doctor credential status ${doctorId}:`, error);
    throw new Error('Failed to update credential status. Please try again later.');
  }
};

/**
 * Get all specialties
 */
export const getSpecialties = async () => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return SPECIALTIES;
  } catch (error) {
    console.error('Error fetching specialties:', error);
    throw new Error('Failed to fetch specialties. Please try again later.');
  }
}; 