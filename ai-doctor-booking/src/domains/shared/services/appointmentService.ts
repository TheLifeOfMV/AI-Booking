import { DraftBooking, Booking } from '../types/booking';
import { ExtendedAppointment } from '../types/appointment';
import { apiBookingToExtendedAppointment } from '../utils/appointmentTransform';

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
 * Creates a new appointment via POST /api/bookings
 * For doctors: appointments are automatically confirmed based on availability
 */
export const createAppointment = async (request: CreateAppointmentRequest): Promise<Booking> => {
  const { draftBooking, doctorName, doctorAvatar, specialtyName, slotTime, location, price } = request;

  const isSlotAvailable = await checkDoctorAvailability(
    draftBooking.doctorId,
    draftBooking.date,
    draftBooking.slotId
  );

  if (!isSlotAvailable) {
    throw new Error('El horario seleccionado ya no está disponible');
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (!token) {
    throw new Error('Debes iniciar sesión para crear una cita');
  }

  const dateStr =
    draftBooking.date instanceof Date
      ? draftBooking.date.toISOString().split('T')[0]
      : new Date(draftBooking.date).toISOString().split('T')[0];

  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      doctor_id: draftBooking.doctorId,
      specialty_id: draftBooking.specialtyId,
      date: dateStr,
      slot_id: draftBooking.slotId,
      appointment_reason: draftBooking.appointmentReason,
      consultation_reason: draftBooking.consultationReason,
    }),
  });

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message || 'Error al crear la cita');
  }

  const created = json.data;
  const confirmedBooking: Booking = {
    ...draftBooking,
    id: String(created.id),
    userId: 'current-user-id',
    status: 'confirmed',
    createdAt: new Date(created.created_at || Date.now()),
    doctorName,
    doctorAvatar,
    specialtyName,
    slotTime,
    location,
    price,
  };

  return confirmedBooking;
};

/**
 * Checks if a doctor is available at the specified date and time
 * Calls GET /api/doctors/:id/slots?date=YYYY-MM-DD
 */
export const checkDoctorAvailability = async (
  doctorId: string,
  date: Date,
  slotId: string
): Promise<boolean> => {
  const dateStr =
    date instanceof Date ? date.toISOString().split('T')[0] : new Date(date).toISOString().split('T')[0];

  const res = await fetch(`/api/doctors/${doctorId}/slots?date=${dateStr}`);
  const json = await res.json();

  if (!json.success || !json.data) {
    return false;
  }

  const slots = Array.isArray(json.data) ? json.data : json.data.slots || [];
  const slot = slots.find((s: { id?: string; time?: string; available?: boolean }) => s.id === slotId || s.time === slotId);
  return !!slot?.available;
};

/**
 * Converts a Booking to ExtendedAppointment format for doctor views
 */
export const bookingToExtendedAppointment = (booking: Booking): ExtendedAppointment => {
  return {
    id: booking.id,
    patientName: 'Paciente',
    patientAvatar: 'https://via.placeholder.com/60',
    patientPhone: '+34 600 000 000',
    patientEmail: 'paciente@email.com',
    date: booking.date instanceof Date ? booking.date.toISOString().split('T')[0] : String(booking.date).split('T')[0],
    time: booking.slotTime,
    endTime: calculateEndTime(booking.slotTime, 30),
    status: booking.status as ExtendedAppointment['status'],
    duration: 30,
    appointmentType: booking.appointmentReason === 'primera' ? 'consultation' : 'follow-up',
    reason: booking.consultationReason || 'Consulta general',
    consultationType: 'presencial',
    fees: booking.price,
    urgency: 'medium',
    location: booking.location,
    roomNumber: '201',
    createdAt: booking.createdAt instanceof Date ? booking.createdAt.toISOString() : String(booking.createdAt),
    updatedAt: booking.createdAt instanceof Date ? booking.createdAt.toISOString() : String(booking.createdAt),
  };
};

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
}

export const APPOINTMENT_AUTO_CONFIRMATION_ENABLED = true;

export { apiBookingToExtendedAppointment };

export default {
  createAppointment,
  checkDoctorAvailability,
  bookingToExtendedAppointment,
  apiBookingToExtendedAppointment,
  APPOINTMENT_AUTO_CONFIRMATION_ENABLED,
};
