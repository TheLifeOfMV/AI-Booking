import { create } from 'zustand';
import { Booking } from '../types/booking';

interface UserBookingsState {
  bookings: Booking[];
  selectedBooking: Booking | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchUserBookings: () => Promise<void>;
  fetchBookingById: (id: string) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  rescheduleBooking: (id: string, newDate: Date, newSlotId: string) => Promise<void>;
  clearSelectedBooking: () => void;
  clearError: () => void;
}

export const useUserBookingsStore = create<UserBookingsState>((set, get) => ({
  bookings: [],
  selectedBooking: null,
  isLoading: false,
  error: null,
  
  fetchUserBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would fetch from an API
      // For demo purposes, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data
      const bookings: Booking[] = [
        {
          id: '1',
          userId: 'user123',
          specialtyId: 'specialty1',
          doctorId: '1',
          date: new Date(Date.now() + 86400000 * 2), // 2 days from now
          slotId: '101',
          status: 'confirmed' as const,
          createdAt: new Date(),
          doctorName: 'Dr. Vinny Vang',
          doctorAvatar: '/doctors/doctor1.jpg',
          specialtyName: 'Oftalmólogo',
          slotTime: '8:00',
          location: 'Centro Médico California, Sala 234',
          price: 35
        },
        {
          id: '2',
          userId: 'user123',
          specialtyId: 'specialty2',
          doctorId: '2',
          date: new Date(Date.now() + 86400000 * 7), // 7 days from now
          slotId: '202',
          status: 'confirmed' as const,
          createdAt: new Date(),
          doctorName: 'Dr. Eleanor Padilla',
          doctorAvatar: '/doctors/doctor2.jpg',
          specialtyName: 'Dentista',
          slotTime: '13:00',
          location: 'Clínica Downtown, Sala 101',
          price: 45
        },
        {
          id: '3',
          userId: 'user123',
          specialtyId: 'specialty3',
          doctorId: '3',
          date: new Date(Date.now() - 86400000 * 5), // 5 days ago
          slotId: '303',
          status: 'completed' as const,
          createdAt: new Date(Date.now() - 86400000 * 10),
          doctorName: 'Dr. James Rodriguez',
          doctorAvatar: '/doctors/doctor3.jpg',
          specialtyName: 'Cardiólogo',
          slotTime: '17:00',
          location: 'Centro Cardiológico, Piso 3',
          price: 55
        }
      ];
      
      set({ bookings, isLoading: false });
    } catch (error) {
      set({ error: 'Error al cargar las citas', isLoading: false });
    }
  },
  
  fetchBookingById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would fetch from an API
      // For demo purposes, we'll find it from our mock data or create one
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const { bookings } = get();
      let booking = bookings.find(b => b.id === id);
      
      if (!booking) {
        // If not in store, use mock data
        booking = {
          id,
          userId: 'user123',
          specialtyId: 'specialty1',
          doctorId: '1',
          date: new Date(Date.now() + 86400000 * 2), // 2 days from now
          slotId: '101',
          status: 'confirmed' as const,
          createdAt: new Date(),
          doctorName: 'Dr. Vinny Vang',
          doctorAvatar: '/doctors/doctor1.jpg',
          specialtyName: 'Oftalmólogo',
          slotTime: '8:00',
          location: 'Centro Médico California, Sala 234',
          price: 35
        };
      }
      
      set({ selectedBooking: booking, isLoading: false });
    } catch (error) {
      set({ error: `Error al cargar la cita con ID: ${id}`, isLoading: false });
    }
  },
  
  cancelBooking: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would call an API
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const { bookings } = get();
      const updatedBookings = bookings.map(booking => 
        booking.id === id ? { ...booking, status: 'cancelled' as const } : booking
      );
      
      const updatedSelectedBooking = get().selectedBooking?.id === id
        ? { ...get().selectedBooking!, status: 'cancelled' as const }
        : get().selectedBooking;
      
      set({ 
        bookings: updatedBookings, 
        selectedBooking: updatedSelectedBooking,
        isLoading: false 
      });
    } catch (error) {
      set({ error: 'Error al cancelar la cita', isLoading: false });
    }
  },
  
  rescheduleBooking: async (id: string, newDate: Date, newSlotId: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would call an API
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const { bookings } = get();
      const updatedBookings = bookings.map(booking => 
        booking.id === id ? { ...booking, date: newDate, slotId: newSlotId } : booking
      );
      
      const updatedSelectedBooking = get().selectedBooking?.id === id
        ? { ...get().selectedBooking!, date: newDate, slotId: newSlotId }
        : get().selectedBooking;
      
      set({ 
        bookings: updatedBookings, 
        selectedBooking: updatedSelectedBooking,
        isLoading: false 
      });
    } catch (error) {
      set({ error: 'Error al reprogramar la cita', isLoading: false });
    }
  },
  
  clearSelectedBooking: () => set({ selectedBooking: null }),
  
  clearError: () => set({ error: null }),
})); 