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
  duration: number;
  appointmentType: 'consultation' | 'follow-up' | 'emergency' | 'check-up';
  reason: string;
  consultationType: 'presencial' | 'virtual';
  fees: number;
  medicalNotes?: string;
  doctorNotes?: string;
  symptoms?: string[];
  urgency: 'low' | 'medium' | 'high';
  location: string;
  roomNumber?: string;
  createdAt: string;
  updatedAt: string;
  patientAge?: number;
}
