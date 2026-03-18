import { useState, useEffect, useCallback } from 'react';
import { AdminBooking, BookingFilters, BulkActionResult } from '@/domains/adminservice/types/admin';

function mapApiToAdminBooking(b: any): AdminBooking {
  const status = b.status === 'confirmed' || b.status === 'pending'
    ? 'scheduled'
    : b.status === 'completed'
    ? 'completed'
    : b.status === 'no_show'
    ? 'no-show'
    : 'cancelled';

  return {
    id: String(b.id),
    patientId: b.patient_user_id,
    patientName: b.patient?.full_name || 'Paciente',
    doctorName: '',
    specialty: b.specialties?.name || '',
    date: b.appointment_time?.split('T')[0] || '',
    time: b.appointment_time
      ? new Date(b.appointment_time).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
      : '',
    status: status as AdminBooking['status'],
  };
}

export function useAdminBookings(initialFilters?: BookingFilters) {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BookingFilters | undefined>(initialFilters);
  const [totalCount, setTotalCount] = useState(0);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('limit', '100');
      if (filters?.status && filters.status.length > 0) {
        params.set('status', filters.status[0]);
      }
      if (filters?.dateRange?.startDate) {
        params.set('startDate', filters.dateRange.startDate.toISOString());
      }
      if (filters?.dateRange?.endDate) {
        params.set('endDate', filters.dateRange.endDate.toISOString());
      }

      const res = await fetch(`/api/admin/bookings?${params}`);
      const json = await res.json();

      if (!json.success) throw new Error(json.error || 'Failed to fetch bookings');

      const raw = json.data?.bookings || [];
      const mapped = raw.map(mapApiToAdminBooking);

      let filtered = mapped;
      if (filters?.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(
          (b: AdminBooking) =>
            b.patientName.toLowerCase().includes(term) ||
            b.doctorName.toLowerCase().includes(term) ||
            b.specialty.toLowerCase().includes(term)
        );
      }

      setBookings(mapped);
      setFilteredBookings(filtered);
      setTotalCount(json.data?.total || mapped.length);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateFilters = useCallback((newFilters: BookingFilters) => {
    setFilters(newFilters);
  }, []);

  const bulkCancelBookings = useCallback(async (ids: string[]): Promise<BulkActionResult> => {
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingIds: ids.map(Number), status: 'cancelled_by_doctor' }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      await fetchBookings();
      return { success: true, affectedIds: ids, failedIds: [], message: `${ids.length} reservas canceladas` };
    } catch (err: any) {
      return { success: false, affectedIds: [], failedIds: ids, message: err.message };
    }
  }, [fetchBookings]);

  const bulkRefundBookings = useCallback(async (ids: string[]): Promise<BulkActionResult> => {
    return bulkCancelBookings(ids);
  }, [bulkCancelBookings]);

  return {
    bookings: filteredBookings,
    allBookings: bookings,
    loading,
    error,
    totalCount,
    filters,
    updateFilters,
    refetch: fetchBookings,
    bulkCancelBookings,
    bulkRefundBookings,
  };
}
