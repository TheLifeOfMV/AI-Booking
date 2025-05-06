export interface Specialty {
  id: string;
  name: string;
  imageUrl?: string;
  icon?: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  isAvailable: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  specialtyId: string;
  avatarUrl?: string;
  rating: number;
  experience: string;
  availableSlots: TimeSlot[];
}

export interface DraftBooking {
  specialtyId: string;
  doctorId: string;
  date: Date;
  slotId: string;
}

export interface Booking extends DraftBooking {
  id: string;
  userId: string;
  status: 'confirmed' | 'cancelled' | 'completed' | 'pending';
  createdAt: Date;
  
  // Extended properties for UI display
  doctorName: string;
  doctorAvatar?: string;
  specialtyName: string;
  slotTime: string;
  location: string;
  price: number;
} 