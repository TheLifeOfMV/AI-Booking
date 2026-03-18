import type { ExtendedAppointment } from '../types/appointment';

/** API booking shape from GET /api/doctors/me/appointments */
export interface ApiBooking {
  id: number;
  patient_user_id: string;
  doctor_user_id: string;
  specialty_id: number | null;
  appointment_time: string;
  duration_minutes: number;
  status: string;
  channel: string;
  created_at: string | null;
  updated_at: string | null;
  profiles?: {
    full_name: string | null;
    phone_number: string | null;
    avatar_url: string | null;
  } | null;
  specialties?: {
    id: number;
    name: string;
  } | null;
}

function calculateEndTime(appointmentTime: string, durationMinutes: number): string {
  const start = new Date(appointmentTime);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  return end.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function mapStatus(apiStatus: string): ExtendedAppointment['status'] {
  if (apiStatus === 'cancelled_by_patient' || apiStatus === 'cancelled_by_doctor') {
    return 'cancelled';
  }
  if (['confirmed', 'pending', 'completed', 'cancelled', 'no-show'].includes(apiStatus)) {
    return apiStatus as ExtendedAppointment['status'];
  }
  return 'pending';
}

/**
 * Transforms an API booking response into ExtendedAppointment format
 */
export function apiBookingToExtendedAppointment(booking: ApiBooking): ExtendedAppointment {
  const appointmentTime = booking.appointment_time;
  const datePart = appointmentTime?.split('T')[0] || '';
  const timePart = appointmentTime
    ? new Date(appointmentTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })
    : '';
  const endTime = calculateEndTime(appointmentTime, booking.duration_minutes);

  const isVirtual = booking.channel?.toLowerCase() === 'virtual' || booking.channel?.toLowerCase() === 'video';

  return {
    id: String(booking.id),
    patientName: booking.profiles?.full_name || 'Paciente',
    patientAvatar: booking.profiles?.avatar_url || 'https://via.placeholder.com/60',
    patientPhone: booking.profiles?.phone_number || '',
    patientEmail: '',
    date: datePart,
    time: timePart,
    endTime,
    status: mapStatus(booking.status),
    duration: booking.duration_minutes ?? 30,
    appointmentType: 'consultation',
    reason: booking.specialties?.name ? `Consulta - ${booking.specialties.name}` : 'Consulta general',
    consultationType: isVirtual ? 'virtual' : 'presencial',
    fees: 0,
    urgency: 'medium',
    location: isVirtual ? 'Consulta virtual' : 'Consultorio',
    createdAt: booking.created_at || new Date().toISOString(),
    updatedAt: booking.updated_at || new Date().toISOString(),
  };
}
