"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNavigation() {
  const pathname = usePathname();
  
  // Check if the current path is one of the pre-app pages where navigation should be hidden
  const shouldHideNavigation = 
    !pathname || // Handle initial loading state
    pathname === '/' || // Hide on root path (initial landing)
    pathname.startsWith('/intro') || 
    pathname.startsWith('/channel') || 
    pathname.startsWith('/login') ||
    pathname.startsWith('/splash') ||
    pathname.startsWith('/auth');
  
  // If we're on a pre-app page, don't render the navigation bar
  if (shouldHideNavigation) {
    return null;
  }
  
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };
  
  // Determine if we're in the booking section to decide where Home button should lead
  const isInBookingSection = pathname?.startsWith('/booking');
  const homeHref = isInBookingSection ? '/booking/unified' : '/';
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-light-grey py-2 px-4 flex justify-around z-20">
      <Link 
        href={homeHref}
        className={`flex flex-col items-center ${isActive('/') || (isInBookingSection && pathname === '/booking/unified') ? 'text-primary' : 'text-medium-grey'}`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12H15V22" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-xs mt-1">Home</span>
      </Link>
      
      <Link 
        href="/booking/specialty" 
        className={`flex flex-col items-center ${isActive('/booking') && pathname !== '/booking/unified' ? 'text-primary' : 'text-medium-grey'}`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-xs mt-1">Categories</span>
      </Link>
      
      <Link 
        href="/bookings" 
        className={`flex flex-col items-center ${isActive('/bookings') ? 'text-primary' : 'text-medium-grey'}`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-xs mt-1">Appointments</span>
      </Link>
      
      <Link 
        href="/profile" 
        className={`flex flex-col items-center ${isActive('/profile') ? 'text-primary' : 'text-medium-grey'}`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-xs mt-1">Profile</span>
      </Link>
    </div>
  );
} 