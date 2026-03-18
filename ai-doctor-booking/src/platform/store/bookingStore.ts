import { create } from 'zustand';
import { Doctor, Specialty, TimeSlot, DraftBooking } from '@/domains/shared/types/booking';

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
  createDraftBooking: (appointmentReason?: 'primera' | 'control', consultationReason?: string) => void;
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
  
  createDraftBooking: (appointmentReason?: 'primera' | 'control', consultationReason?: string) => {
    const { selectedSpecialty, selectedDoctor, selectedDate, selectedSlot } = get();
    
    if (selectedSpecialty && selectedDoctor && selectedDate && selectedSlot) {
      const draftBooking: DraftBooking = {
        specialtyId: selectedSpecialty.id,
        doctorId: selectedDoctor.id,
        date: selectedDate,
        slotId: selectedSlot.id,
        appointmentReason,
        consultationReason
      };
      
      set({ draftBooking });
    }
  },
  
  fetchDoctorsBySpecialtyAndDate: async (specialtyId, date) => {
    set({ isLoading: true, error: null });
    try {
      const dateStr = date.toISOString().split('T')[0];
      const res = await fetch(`/api/doctors?specialtyId=${specialtyId}&date=${dateStr}`);
      const json = await res.json();

      if (!json.success || !json.data?.doctors) {
        set({ doctors: [], isLoading: false });
        return;
      }

      const doctorsWithSlots: Doctor[] = await Promise.all(
        json.data.doctors.map(async (doc: any) => {
          const slotsRes = await fetch(`/api/doctors/${doc.user_id}/slots?date=${dateStr}`);
          const slotsJson = await slotsRes.json();
          const slots = (slotsJson.success && slotsJson.data) ? slotsJson.data : [];

          const availableSlots: TimeSlot[] = slots
            .filter((s: any) => s.available)
            .map((s: any, idx: number) => ({
              id: `${doc.user_id}-${s.time}-${idx}`,
              time: s.time,
              isAvailable: true,
            }));

          const expYears = doc.experience_years;
          return {
            id: doc.user_id,
            name: doc.profile?.full_name || doc.profiles?.full_name || 'Doctor',
            specialtyId,
            avatarUrl: doc.profile?.avatar_url || doc.profiles?.avatar_url || undefined,
            rating: parseFloat(doc.rating) || 0,
            experience: expYears ? `${expYears}+ años de experiencia` : 'Experiencia no especificada',
            availableSlots,
            consultationFee: doc.consultation_fee || undefined,
          } as Doctor;
        })
      );

      set({ doctors: doctorsWithSlots, isLoading: false });
    } catch (error) {
      set({ error: 'Error al cargar doctores', isLoading: false });
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