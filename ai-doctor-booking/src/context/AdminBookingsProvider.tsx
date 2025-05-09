'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAdminBookings } from '@/hooks/useAdminBookings';

// Create context with the return type of useAdminBookings
const AdminBookingsContext = createContext<ReturnType<typeof useAdminBookings> | undefined>(undefined);

export function AdminBookingsProvider({ children }: { children: ReactNode }) {
  // Use the hook to get all the bookings state and functions
  const bookingsData = useAdminBookings();
  
  return (
    <AdminBookingsContext.Provider value={bookingsData}>
      {children}
    </AdminBookingsContext.Provider>
  );
}

// Custom hook to use the context
export function useAdminBookingsContext() {
  const context = useContext(AdminBookingsContext);
  
  if (context === undefined) {
    throw new Error('useAdminBookingsContext must be used within an AdminBookingsProvider');
  }
  
  return context;
} 