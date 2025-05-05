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
      router.push('/booking/slot');
    } else if (pathname === '/booking/success') {
      // Allow manual navigation from success screen
      router.push('/bookings');
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white p-4 border-b border-light-grey flex items-center">
        <button 
          onClick={goBack}
          className="mr-4 text-dark-grey"
          aria-label="Go back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-lg font-semibold">Book Appointment</h1>
      </header>
      
      <main className="pb-20">
        {children}
      </main>
    </div>
  );
} 