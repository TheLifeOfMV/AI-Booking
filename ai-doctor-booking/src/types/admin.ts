// Admin types for bookings management
export interface AdminBooking {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  doctorId: string;
  specialty: string;
  date: string;
  time: string;
  status: BookingStatus;
  amount: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export type BookingStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show';
export type PaymentStatus = 'paid' | 'refunded' | 'pending';

export interface BookingFilters {
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  status?: BookingStatus[];
  doctorId?: string;
  patientId?: string;
  searchTerm?: string;
}

export interface BulkActionResult {
  success: boolean;
  affectedIds: string[];
  failedIds: string[];
  message: string;
} 