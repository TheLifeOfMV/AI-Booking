import { DraftBooking, Booking } from '../types/booking';
import { ExtendedAppointment } from '../app/doctor/appointments/mockAppointments';

/**
 * Service for handling appointment creation and management
 * Implements automatic confirmation for doctors based on availability
 */

export interface CreateAppointmentRequest {
  draftBooking: DraftBooking;
  doctorName: string;
  doctorAvatar?: string;
  specialtyName: string;
  slotTime: string;
  location: string;
  price: number;
}

/**
 * Creates a new appointment with automatic confirmation
 * For doctors: appointments are automatically confirmed based on availability
 * No manual confirmation required from doctors
 */
export const createAppointment = async (request: CreateAppointmentRequest): Promise<Booking> => {
  const { draftBooking, doctorName, doctorAvatar, specialtyName, slotTime, location, price } = request;
  
  // Simulate checking doctor availability
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For doctors, automatically confirm if slot is available
  const isSlotAvailable = await checkDoctorAvailability(draftBooking.doctorId, draftBooking.date, draftBooking.slotId);
  
  if (!isSlotAvailable) {
    throw new Error('El horario seleccionado ya no está disponible');
  }
  
  // Create confirmed appointment
  const confirmedBooking: Booking = {
    ...draftBooking,
    id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: 'current-user-id', // In real app, get from auth context
    status: 'confirmed', // Auto-confirm for doctors
    createdAt: new Date(),
    doctorName,
    doctorAvatar,
    specialtyName,
    slotTime,
    location,
    price
  };
  
  // In a real app, this would save to database
  console.log('✅ Appointment automatically confirmed:', {
    id: confirmedBooking.id,
    doctor: doctorName,
    date: confirmedBooking.date.toISOString().split('T')[0],
    time: slotTime,
    status: confirmedBooking.status
  });
  
  return confirmedBooking;
};

/**
 * Checks if a doctor is available at the specified date and time
 * In a real app, this would query the database for conflicts
 */
export const checkDoctorAvailability = async (
  doctorId: string, 
  date: Date, 
  slotId: string
): Promise<boolean> => {
  // Simulate API call to check availability
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // For demo purposes, assume 95% availability
  return Math.random() > 0.05;
};

/**
 * Converts a Booking to ExtendedAppointment format for doctor views
 */
export const bookingToExtendedAppointment = (booking: Booking): ExtendedAppointment => {
  return {
    id: booking.id,
    patientName: 'Paciente', // In real app, get from user data
    patientAvatar: 'https://via.placeholder.com/60',
    patientPhone: '+34 600 000 000',
    patientEmail: 'paciente@email.com',
    date: booking.date.toISOString().split('T')[0],
    time: booking.slotTime,
    endTime: calculateEndTime(booking.slotTime, 30), // 30 min default
    status: booking.status as ExtendedAppointment['status'],
    duration: 30,
    appointmentType: booking.appointmentReason === 'primera' ? 'consultation' : 'follow-up',
    reason: booking.consultationReason || 'Consulta general',
    consultationType: 'presencial',
    fees: booking.price,
    urgency: 'medium',
    location: booking.location,
    roomNumber: '201',
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.createdAt.toISOString()
  };
};

/**
 * Helper function to calculate end time
 */
const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  
  return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
};

/**
 * Business rule: Doctors attend to anyone and appointments are auto-confirmed
 * This eliminates the need for manual confirmation by doctors
 */
export const APPOINTMENT_AUTO_CONFIRMATION_ENABLED = true;

export default {
  createAppointment,
  checkDoctorAvailability,
  bookingToExtendedAppointment,
  APPOINTMENT_AUTO_CONFIRMATION_ENABLED
}; 