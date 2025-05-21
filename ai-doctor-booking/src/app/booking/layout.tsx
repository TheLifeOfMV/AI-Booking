'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useBookingStore } from '../../store/bookingStore';

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  
  const goBack = () => {
    // Logic to determine the previous page in the booking flow
    if (pathname === '/booking/slot') {
      router.push('/booking/doctor');
    } else if (pathname === '/booking/doctor') {
      router.push('/booking/date');
    } else if (pathname === '/booking/date') {
      router.push('/booking/specialty');
    } else if (pathname === '/booking/specialty') {
      router.push('/channel');
    } else if (pathname === '/booking/confirm') {
      // Modified to return to the unified page with the doctor modal
      router.push('/booking/unified?showDoctorModal=true');
    } else if (pathname === '/booking/success') {
      // Allow manual navigation from success screen
      router.push('/bookings');
    } else if (pathname === '/booking/unified') {
      router.push('/booking/insurance');
    } else if (pathname === '/booking/insurance') {
      router.push('/booking/insurance-selection');
    } else {
      router.back();
    }
  };

  // Only show the header if we're not on the unified booking page
  const showHeader = pathname !== '/booking/unified';

  return (
    <div className="min-h-screen bg-gray-50">
      {showHeader && (
        <header className="p-4 flex items-center justify-start h-16" style={{ backgroundColor: '#F0F4F9' }}>
          <button 
            onClick={goBack}
            className="text-dark-grey flex items-center justify-center"
            aria-label="Regresar"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </header>
      )}
      
      <main className="pb-20">
        {children}
      </main>
    </div>
  );
} 