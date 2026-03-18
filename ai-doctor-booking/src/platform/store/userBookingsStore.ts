import { create } from 'zustand';
import { Booking } from '@/domains/shared/types/booking';

interface UserBookingsState {
  bookings: Booking[];
  selectedBooking: Booking | null;
  isLoading: boolean;
  error: string | null;

  fetchUserBookings: () => Promise<void>;
  fetchBookingById: (id: string) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  rescheduleBooking: (id: string, newDate: Date, newSlotId: string) => Promise<void>;
  clearSelectedBooking: () => void;
  clearError: () => void;
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

function mapApiBooking(b: any): Booking {
  return {
    id: String(b.id),
    userId: b.patient_user_id,
    specialtyId: b.specialty_id ? String(b.specialty_id) : '',
    doctorId: b.doctor_user_id,
    date: new Date(b.appointment_time),
    slotId: '',
    status: b.status === 'cancelled_by_patient' || b.status === 'cancelled_by_doctor'
      ? 'cancelled'
      : b.status,
    createdAt: new Date(b.created_at),
    doctorName: b.doctor?.full_name || b.doctors?.profiles?.full_name || '',
    doctorAvatar: b.doctor?.avatar_url || '',
    specialtyName: b.specialty?.name || b.specialties?.name || '',
    slotTime: new Date(b.appointment_time).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    location: b.doctor?.location || '',
  };
}

export const useUserBookingsStore = create<UserBookingsState>((set, get) => ({
  bookings: [],
  selectedBooking: null,
  isLoading: false,
  error: null,

  fetchUserBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = getAuthToken();
      if (!token) {
        set({ bookings: [], isLoading: false });
        return;
      }

      const res = await fetch('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (!json.success) {
        set({ error: json.message || 'Error al cargar las citas', isLoading: false });
        return;
      }

      const rawBookings = json.data?.bookings || json.data || [];
      const bookings: Booking[] = rawBookings.map(mapApiBooking);
      set({ bookings, isLoading: false });
    } catch {
      set({ error: 'Error al cargar las citas', isLoading: false });
    }
  },

  fetchBookingById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { bookings } = get();
      let booking = bookings.find(b => b.id === id);
      if (booking) {
        set({ selectedBooking: booking, isLoading: false });
        return;
      }

      const token = getAuthToken();
      if (!token) {
        set({ error: 'No autenticado', isLoading: false });
        return;
      }

      const res = await fetch(`/api/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.success || !json.data) {
        set({ error: 'Cita no encontrada', isLoading: false });
        return;
      }
      set({ selectedBooking: mapApiBooking(json.data), isLoading: false });
    } catch {
      set({ error: `Error al cargar la cita con ID: ${id}`, isLoading: false });
    }
  },

  cancelBooking: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = getAuthToken();
      if (!token) {
        set({ error: 'No autenticado', isLoading: false });
        return;
      }

      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'cancelled_by_patient' }),
      });
      const json = await res.json();
      if (!json.success) {
        set({ error: json.message || 'Error al cancelar la cita', isLoading: false });
        return;
      }

      const { bookings } = get();
      const updatedBookings = bookings.map(b =>
        b.id === id ? { ...b, status: 'cancelled' as const } : b
      );
      const updatedSelected = get().selectedBooking?.id === id
        ? { ...get().selectedBooking!, status: 'cancelled' as const }
        : get().selectedBooking;

      set({ bookings: updatedBookings, selectedBooking: updatedSelected, isLoading: false });
    } catch {
      set({ error: 'Error al cancelar la cita', isLoading: false });
    }
  },

  rescheduleBooking: async (id: string, newDate: Date, newSlotId: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = getAuthToken();
      if (!token) {
        set({ error: 'No autenticado', isLoading: false });
        return;
      }

      await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'cancelled_by_patient' }),
      });

      const { bookings } = get();
      const updatedBookings = bookings.map(b =>
        b.id === id ? { ...b, date: newDate, slotId: newSlotId } : b
      );
      const updatedSelected = get().selectedBooking?.id === id
        ? { ...get().selectedBooking!, date: newDate, slotId: newSlotId }
        : get().selectedBooking;

      set({ bookings: updatedBookings, selectedBooking: updatedSelected, isLoading: false });
    } catch {
      set({ error: 'Error al reprogramar la cita', isLoading: false });
    }
  },

  clearSelectedBooking: () => set({ selectedBooking: null }),
  clearError: () => set({ error: null }),
}));
