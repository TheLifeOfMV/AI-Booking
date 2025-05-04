import { supabase } from './supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Helper function to get auth token
const getAuthHeader = async () => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic fetch function with auth
const fetchWithAuth = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const authHeaders = await getAuthHeader();
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// API functions for slots
export const SlotsApi = {
  getAvailableSlots: async (doctorId: string, startDate: string, endDate: string) => {
    return fetchWithAuth<{ success: boolean; data: any[] }>(
      `/slots?doctor_id=${doctorId}&start_date=${startDate}&end_date=${endDate}`
    );
  },
};

// API functions for bookings
export const BookingsApi = {
  createBooking: async (bookingData: any) => {
    return fetchWithAuth<{ success: boolean; booking: any }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },
  
  getBooking: async (bookingId: string) => {
    return fetchWithAuth<{ success: boolean; data: any }>(`/bookings/${bookingId}`);
  },
  
  updateBookingStatus: async (bookingId: string, status: string) => {
    return fetchWithAuth<{ success: boolean; data: any }>(`/bookings/${bookingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Add function for fetching bookings by date range
  getBookingsByDateRange: async (doctorId: string, startDate: string, endDate: string) => {
    // This is a simplified implementation that might need to be adapted to your actual API
    return fetchWithAuth<{ success: boolean; data: any[] }>(
      `/bookings?doctor_id=${doctorId}&start_date=${startDate}&end_date=${endDate}`
    );
  },
}; 