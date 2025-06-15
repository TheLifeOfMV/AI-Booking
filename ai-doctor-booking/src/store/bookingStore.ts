import { create } from 'zustand';
import { Doctor, Specialty, TimeSlot, DraftBooking } from '../types/booking';

interface BookingState {
  selectedSpecialty: Specialty | null;
  selectedDate: Date | null;
  selectedDoctor: Doctor | null;
  selectedSlot: TimeSlot | null;
  draftBooking: DraftBooking | null;
  doctors: Doctor[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSelectedSpecialty: (specialty: Specialty) => void;
  setSelectedDate: (date: Date) => void;
  setSelectedDoctor: (doctor: Doctor) => void;
  setSelectedSlot: (slot: TimeSlot) => void;
  createDraftBooking: () => void;
  fetchDoctorsBySpecialtyAndDate: (specialtyId: string, date: Date) => Promise<void>;
  reset: () => void;
  clearError: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedSpecialty: null,
  selectedDate: null,
  selectedDoctor: null,
  selectedSlot: null,
  draftBooking: null,
  doctors: [],
  isLoading: false,
  error: null,
  
  setSelectedSpecialty: (specialty) => set({ selectedSpecialty: specialty }),
  
  setSelectedDate: (date) => set({ selectedDate: date }),
  
  setSelectedDoctor: (doctor) => set({ selectedDoctor: doctor }),
  
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),
  
  createDraftBooking: () => {
    const { selectedSpecialty, selectedDoctor, selectedDate, selectedSlot } = get();
    
    if (selectedSpecialty && selectedDoctor && selectedDate && selectedSlot) {
      const draftBooking: DraftBooking = {
        specialtyId: selectedSpecialty.id,
        doctorId: selectedDoctor.id,
        date: selectedDate,
        slotId: selectedSlot.id
      };
      
      set({ draftBooking });
    }
  },
  
  fetchDoctorsBySpecialtyAndDate: async (specialtyId, date) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would fetch from an API
      // For demo purposes, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data
      const doctors: Doctor[] = [
        {
          id: '1',
          name: 'Dr. Vinny Vang',
          specialtyId: specialtyId,
          avatarUrl: '/doctors/doctor1.jpg',
          rating: 4.8,
          experience: '10+ years experienced',
          availableSlots: [
            { id: '101', time: '8:00', isAvailable: true },
            { id: '102', time: '9:00', isAvailable: true },
            { id: '103', time: '10:00', isAvailable: true },
          ]
        },
        {
          id: '2',
          name: 'Dr. Eleanor Padilla',
          specialtyId: specialtyId,
          avatarUrl: '/doctors/doctor2.jpg',
          rating: 4.9,
          experience: '15+ years experienced',
          availableSlots: [
            { id: '201', time: '11:00', isAvailable: true },
            { id: '202', time: '13:00', isAvailable: true },
            { id: '203', time: '14:00', isAvailable: true },
          ]
        },
        {
          id: '3',
          name: 'Dr. James Rodriguez',
          specialtyId: specialtyId,
          avatarUrl: '/doctors/doctor3.jpg',
          rating: 4.7,
          experience: '8+ years experienced',
          availableSlots: [
            { id: '301', time: '15:00', isAvailable: true },
            { id: '302', time: '16:00', isAvailable: true },
            { id: '303', time: '17:00', isAvailable: true },
          ]
        }
      ];
      
      set({ doctors, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch doctors', isLoading: false });
    }
  },
  
  reset: () => set({
    selectedSpecialty: null,
    selectedDate: null,
    selectedDoctor: null,
    selectedSlot: null,
    draftBooking: null,
    doctors: []
  }),
  
  clearError: () => set({ error: null }),
})); 