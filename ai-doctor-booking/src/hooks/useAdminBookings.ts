import { useState, useEffect, useCallback } from 'react';
import { AdminBooking, BookingFilters, BulkActionResult } from '@/types/admin';

// Mock data function to simulate API calls
const generateMockBookings = (filters?: BookingFilters): AdminBooking[] => {
  // Mock data for bookings
  const mockBookings: AdminBooking[] = Array(25).fill(null).map((_, index) => {
    const id = `booking-${index + 1}`;
    const isEven = index % 2 === 0;
    const isThird = index % 3 === 0;
    
    // Create some variation in the data
    const statuses: AdminBooking['status'][] = ['scheduled', 'completed', 'cancelled', 'no-show'];
    const paymentStatuses: AdminBooking['paymentStatus'][] = ['paid', 'refunded', 'pending'];
    
    // Generate a date between now and 30 days in the future or past
    const today = new Date();
    const daysOffset = (index % 60) - 30; // Range from -30 to +30 days
    const bookingDate = new Date(today);
    bookingDate.setDate(today.getDate() + daysOffset);
    
    const booking: AdminBooking = {
      id,
      patientName: isEven ? 'John Doe' : 'Jane Smith',
      patientId: isEven ? 'patient-1' : 'patient-2',
      doctorName: isThird ? 'Dr. Eleanor Padilla' : (isEven ? 'Dr. Vinny Vang' : 'Dr. James Rodriguez'),
      doctorId: isThird ? '2' : (isEven ? '1' : '3'),
      specialty: isThird ? 'Cardiology' : (isEven ? 'Oculist' : 'Dermatology'),
      date: bookingDate.toISOString().split('T')[0],
      time: isEven ? '09:00' : (isThird ? '14:00' : '11:30'),
      status: statuses[index % statuses.length],
      amount: isEven ? 35 : (isThird ? 50 : 40),
      paymentStatus: paymentStatuses[index % paymentStatuses.length],
      createdAt: new Date(today.getTime() - (index * 86400000)).toISOString(),
    };
    
    return booking;
  });
  
  // Apply filters if provided
  let filteredBookings = [...mockBookings];
  
  if (filters) {
    // Filter by date range
    if (filters.dateRange) {
      const { startDate, endDate } = filters.dateRange;
      filteredBookings = filteredBookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= startDate && bookingDate <= endDate;
      });
    }
    
    // Filter by status
    if (filters.status && filters.status.length > 0) {
      filteredBookings = filteredBookings.filter(booking => 
        filters.status?.includes(booking.status)
      );
    }
    
    // Filter by doctor
    if (filters.doctorId) {
      filteredBookings = filteredBookings.filter(booking => 
        booking.doctorId === filters.doctorId
      );
    }
    
    // Filter by patient
    if (filters.patientId) {
      filteredBookings = filteredBookings.filter(booking => 
        booking.patientId === filters.patientId
      );
    }
    
    // Filter by search term (name, id, etc.)
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filteredBookings = filteredBookings.filter(booking => 
        booking.patientName.toLowerCase().includes(term) ||
        booking.doctorName.toLowerCase().includes(term) ||
        booking.id.toLowerCase().includes(term)
      );
    }
  }
  
  return filteredBookings;
};

export function useAdminBookings() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [filters, setFilters] = useState<BookingFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([]);
  
  // Load bookings with the current filters
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 800));
      const data = generateMockBookings(filters);
      setBookings(data);
    } catch (err) {
      setError('Failed to fetch bookings. Please try again.');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);
  
  // Initial load and when filters change
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);
  
  // Update filters function
  const updateFilters = useCallback((newFilters: Partial<BookingFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);
  
  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);
  
  // Handle selection
  const toggleBookingSelection = useCallback((bookingId: string) => {
    setSelectedBookingIds(prev => {
      if (prev.includes(bookingId)) {
        return prev.filter(id => id !== bookingId);
      } else {
        return [...prev, bookingId];
      }
    });
  }, []);
  
  // Select all bookings
  const selectAllBookings = useCallback(() => {
    if (selectedBookingIds.length === bookings.length) {
      // If all are selected, deselect all
      setSelectedBookingIds([]);
    } else {
      // Otherwise select all
      setSelectedBookingIds(bookings.map(b => b.id));
    }
  }, [bookings, selectedBookingIds.length]);
  
  // Bulk cancel bookings
  const bulkCancelBookings = useCallback(async (): Promise<BulkActionResult> => {
    if (selectedBookingIds.length === 0) {
      return {
        success: false,
        affectedIds: [],
        failedIds: [],
        message: 'No bookings selected'
      };
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, we would call an API endpoint here
    // For now, we'll just update our local state
    
    // Only 'scheduled' bookings can be cancelled
    const bookingsToCancel = bookings.filter(
      b => selectedBookingIds.includes(b.id) && b.status === 'scheduled'
    );
    const cannotCancelIds = selectedBookingIds.filter(
      id => !bookingsToCancel.some(b => b.id === id)
    );
    
    if (bookingsToCancel.length === 0) {
      return {
        success: false,
        affectedIds: [],
        failedIds: selectedBookingIds,
        message: 'None of the selected bookings can be cancelled'
      };
    }
    
    // Update bookings
    setBookings(prev => prev.map(booking => {
      if (bookingsToCancel.some(b => b.id === booking.id)) {
        return {
          ...booking,
          status: 'cancelled' as const
        };
      }
      return booking;
    }));
    
    // Clear selection
    setSelectedBookingIds([]);
    
    return {
      success: true,
      affectedIds: bookingsToCancel.map(b => b.id),
      failedIds: cannotCancelIds,
      message: `Successfully cancelled ${bookingsToCancel.length} bookings${
        cannotCancelIds.length > 0 ? `. ${cannotCancelIds.length} bookings could not be cancelled.` : ''
      }`
    };
  }, [bookings, selectedBookingIds]);
  
  // Bulk refund bookings
  const bulkRefundBookings = useCallback(async (): Promise<BulkActionResult> => {
    if (selectedBookingIds.length === 0) {
      return {
        success: false,
        affectedIds: [],
        failedIds: [],
        message: 'No bookings selected'
      };
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Only 'paid' bookings can be refunded
    const bookingsToRefund = bookings.filter(
      b => selectedBookingIds.includes(b.id) && b.paymentStatus === 'paid'
    );
    const cannotRefundIds = selectedBookingIds.filter(
      id => !bookingsToRefund.some(b => b.id === id)
    );
    
    if (bookingsToRefund.length === 0) {
      return {
        success: false,
        affectedIds: [],
        failedIds: selectedBookingIds,
        message: 'None of the selected bookings can be refunded'
      };
    }
    
    // Update bookings
    setBookings(prev => prev.map(booking => {
      if (bookingsToRefund.some(b => b.id === booking.id)) {
        return {
          ...booking,
          paymentStatus: 'refunded' as const
        };
      }
      return booking;
    }));
    
    // Clear selection
    setSelectedBookingIds([]);
    
    return {
      success: true,
      affectedIds: bookingsToRefund.map(b => b.id),
      failedIds: cannotRefundIds,
      message: `Successfully refunded ${bookingsToRefund.length} bookings${
        cannotRefundIds.length > 0 ? `. ${cannotRefundIds.length} bookings could not be refunded.` : ''
      }`
    };
  }, [bookings, selectedBookingIds]);
  
  // Impersonate user
  const impersonateUser = useCallback(async (userId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real app, this would change the session to impersonate the user
    console.log(`Impersonating user: ${userId}`);
    
    // Return a mock success response
    return {
      success: true,
      message: `Now viewing as ${
        bookings.find(b => b.patientId === userId)?.patientName || 'User'
      }`
    };
  }, [bookings]);
  
  return {
    bookings,
    loading,
    error,
    filters,
    selectedBookingIds,
    updateFilters,
    resetFilters,
    toggleBookingSelection,
    selectAllBookings,
    bulkCancelBookings,
    bulkRefundBookings,
    impersonateUser,
    refreshBookings: fetchBookings
  };
} 