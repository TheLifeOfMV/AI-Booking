/**
 * Extended Appointment Interface and Mock Data
 * 
 * BUSINESS RULE CHANGE: Automatic Appointment Confirmation for Doctors
 * ================================================================
 * 
 * Previous behavior:
 * - Appointments could have 'pending' status requiring manual confirmation by doctors
 * - Doctors had to manually confirm each appointment
 * 
 * New behavior (implemented):
 * - All appointments are automatically confirmed based on doctor availability
 * - Doctors attend to anyone and confirmation is automatic
 * - No 'pending' status in doctor views
 * - Removed confirmation buttons and actions from doctor UI
 * 
 * Changes made:
 * 1. Removed 'pending' from status generation in mock data
 * 2. Auto-confirm future appointments in generateMockAppointments()
 * 3. Updated all doctor UI components to remove pending status
 * 4. Created appointmentService.ts for automatic confirmation logic
 * 5. Updated booking flow to use automatic confirmation
 */

export interface ExtendedAppointment {
  id: string;
  patientName: string;
  patientAvatar: string;
  patientPhone: string;
  patientEmail: string;
  date: string;
  time: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'no-show';
  duration: number; // in minutes
  appointmentType: 'consultation' | 'follow-up' | 'emergency' | 'check-up';
  reason: string;
  consultationType: 'presencial' | 'virtual';
  fees: number;
  medicalNotes?: string;
  symptoms?: string[];
  urgency: 'low' | 'medium' | 'high';
  location: string;
  roomNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export const MOCK_APPOINTMENTS: ExtendedAppointment[] = [
  {
    id: '1',
    patientName: 'María García López',
    patientAvatar: 'https://via.placeholder.com/60',
    patientPhone: '+34 666 123 456',
    patientEmail: 'maria.garcia@email.com',
    date: '2023-07-15',
    time: '09:30',
    endTime: '10:00',
    status: 'confirmed',
    duration: 30,
    appointmentType: 'consultation',
    reason: 'Dolor de cabeza persistente',
    consultationType: 'presencial',
    fees: 60,
    symptoms: ['dolor de cabeza', 'mareos', 'fatiga'],
    urgency: 'medium',
    location: 'Consultorio Principal',
    roomNumber: '201',
    createdAt: '2023-07-10T10:30:00Z',
    updatedAt: '2023-07-12T14:20:00Z'
  },
  {
    id: '2',
    patientName: 'Carlos Rodríguez Martín',
    patientAvatar: 'https://via.placeholder.com/60',
    patientPhone: '+34 677 234 567',
    patientEmail: 'carlos.rodriguez@email.com',
    date: '2023-07-15',
    time: '11:00',
    endTime: '11:30',
    status: 'confirmed',
    duration: 30,
    appointmentType: 'follow-up',
    reason: 'Revisión post-operatoria',
    consultationType: 'presencial',
    fees: 45,
    symptoms: ['revisión', 'control'],
    urgency: 'low',
    location: 'Consultorio Principal',
    roomNumber: '201',
    createdAt: '2023-07-13T09:15:00Z',
    updatedAt: '2023-07-13T09:15:00Z'
  },
  {
    id: '3',
    patientName: 'Laura Martínez Ruiz',
    patientAvatar: 'https://via.placeholder.com/60',
    patientPhone: '+34 688 345 678',
    patientEmail: 'laura.martinez@email.com',
    date: '2023-07-15',
    time: '12:30',
    endTime: '13:00',
    status: 'completed',
    duration: 30,
    appointmentType: 'check-up',
    reason: 'Revisión anual',
    consultationType: 'presencial',
    fees: 50,
    medicalNotes: 'Paciente en buen estado general. Continuar con medicación actual.',
    symptoms: ['revisión general'],
    urgency: 'low',
    location: 'Consultorio Principal',
    roomNumber: '201',
    createdAt: '2023-06-15T11:00:00Z',
    updatedAt: '2023-07-15T13:00:00Z'
  },
  {
    id: '4',
    patientName: 'Alejandro Sánchez Torres',
    patientAvatar: 'https://via.placeholder.com/60',
    patientPhone: '+34 699 456 789',
    patientEmail: 'alejandro.sanchez@email.com',
    date: '2023-07-16',
    time: '09:00',
    endTime: '09:45',
    status: 'confirmed',
    duration: 45,
    appointmentType: 'consultation',
    reason: 'Consulta neurológica - migrañas',
    consultationType: 'virtual',
    fees: 70,
    symptoms: ['migrañas', 'sensibilidad a la luz', 'náuseas'],
    urgency: 'high',
    location: 'Consulta Virtual',
    createdAt: '2023-07-12T16:30:00Z',
    updatedAt: '2023-07-14T10:20:00Z'
  },
  {
    id: '5',
    patientName: 'Isabella González Vega',
    patientAvatar: 'https://via.placeholder.com/60',
    patientPhone: '+34 610 567 890',
    patientEmail: 'isabella.gonzalez@email.com',
    date: '2023-07-16',
    time: '10:30',
    endTime: '11:00',
    status: 'cancelled',
    duration: 30,
    appointmentType: 'follow-up',
    reason: 'Seguimiento tratamiento',
    consultationType: 'presencial',
    fees: 40,
    symptoms: ['seguimiento'],
    urgency: 'low',
    location: 'Consultorio Principal',
    roomNumber: '201',
    createdAt: '2023-07-11T14:20:00Z',
    updatedAt: '2023-07-15T08:30:00Z'
  },
  // ... Continue with more appointments to reach 50+
  // Adding variety in dates, times, statuses, and types
];

// Generate additional appointments programmatically for testing
const generateMockAppointments = (count: number): ExtendedAppointment[] => {
  const names = [
    'Ana Fernández', 'David López', 'Carmen Silva', 'Roberto Díaz',
    'Patricia Moreno', 'Francisco Ruiz', 'Lucía Herrera', 'Manuel Castro',
    'Elena Jiménez', 'Antonio Romero', 'Natalia Ramos', 'Sergio Guerrero'
  ];
  
  const reasons = [
    'Consulta general', 'Dolor de espalda', 'Revisión cardiológica',
    'Control de tensión', 'Análisis de resultados', 'Consulta dermatológica',
    'Dolor abdominal', 'Revisión neurológica', 'Control diabético',
    'Consulta respiratoria', 'Dolor articular', 'Revisión oftalmológica'
  ];
  
  const statuses: ExtendedAppointment['status'][] = ['confirmed', 'completed', 'cancelled', 'no-show'];
  const types: ExtendedAppointment['appointmentType'][] = ['consultation', 'follow-up', 'emergency', 'check-up'];
  const consultationTypes: ExtendedAppointment['consultationType'][] = ['presencial', 'virtual'];
  
  const appointments: ExtendedAppointment[] = [];
  
  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 30) - 15); // ±15 days from today
    
    const hour = 9 + Math.floor(Math.random() * 8); // 9 AM to 5 PM
    const minute = Math.random() > 0.5 ? '00' : '30';
    
    const appointmentDate = date.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    const isFuture = appointmentDate >= today;
    
    let appointmentStatus = statuses[Math.floor(Math.random() * statuses.length)];
    if (isFuture && appointmentStatus !== 'cancelled') {
      appointmentStatus = 'confirmed';
    }
    
    appointments.push({
      id: `generated-${i + 6}`,
      patientName: names[Math.floor(Math.random() * names.length)],
      patientAvatar: `https://via.placeholder.com/60?text=${i + 6}`,
      patientPhone: `+34 ${600 + Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 1000).toString().padStart(3, '0')} ${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      patientEmail: `patient${i + 6}@email.com`,
      date: appointmentDate,
      time: `${hour.toString().padStart(2, '0')}:${minute}`,
      endTime: `${hour.toString().padStart(2, '0')}:${parseInt(minute) + 30}`,
      status: appointmentStatus,
      duration: 30,
      appointmentType: types[Math.floor(Math.random() * types.length)],
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      consultationType: consultationTypes[Math.floor(Math.random() * consultationTypes.length)],
      fees: 30 + Math.floor(Math.random() * 50),
      symptoms: [reasons[Math.floor(Math.random() * reasons.length)]],
      urgency: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
      location: Math.random() > 0.3 ? 'Consultorio Principal' : 'Consulta Virtual',
      roomNumber: Math.random() > 0.3 ? `20${1 + Math.floor(Math.random() * 5)}` : undefined,
      createdAt: new Date(date.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(date.getTime() - Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  return appointments;
};

export const ALL_MOCK_APPOINTMENTS = [...MOCK_APPOINTMENTS, ...generateMockAppointments(45)];

// Helper functions for filtering
export const getAppointmentsByStatus = (status: ExtendedAppointment['status']) => 
  ALL_MOCK_APPOINTMENTS.filter(apt => apt.status === status);

export const getAppointmentsByDate = (date: string) => 
  ALL_MOCK_APPOINTMENTS.filter(apt => apt.date === date);

export const getAppointmentsByDateRange = (startDate: string, endDate: string) => 
  ALL_MOCK_APPOINTMENTS.filter(apt => apt.date >= startDate && apt.date <= endDate);

export const getTodayAppointments = () => {
  const today = new Date().toISOString().split('T')[0];
  return getAppointmentsByDate(today);
};

export const getUpcomingAppointments = () => {
  const today = new Date().toISOString().split('T')[0];
  return ALL_MOCK_APPOINTMENTS.filter(apt => apt.date >= today && apt.status !== 'cancelled');
}; 