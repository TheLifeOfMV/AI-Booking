// Admin types for bookings management
export type BookingStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show';

export interface AdminBooking {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: BookingStatus;
}

export interface DashboardStats {
  totalBookings: number;
  todayBookings: number;
  totalDoctors: number;
  totalPatients: number;
  recentBookings: AdminBooking[];
}

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