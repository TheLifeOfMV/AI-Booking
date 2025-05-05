"use client";

import React from 'react';
import Button from '@/components/Button';
import { useRouter } from 'next/navigation';

export default function BookingPage() {
  const router = useRouter();
  
  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Main Content Area - Split into Two Sections */}
      <div className="flex-1 flex flex-col">
        {/* Doctor Image Placeholder Section */}
        <div className="flex-1 relative bg-white rounded-b-[2rem] overflow-hidden">
          {/* Doctor Image Placeholder */}
          <div className="w-full h-full flex items-center justify-center">
            <div className="relative w-[85%] h-[90%] rounded-3xl overflow-hidden bg-light-grey/50 flex items-center justify-center shadow-card">
              <div className="text-medium-grey flex flex-col items-center gap-3">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="48" 
                  height="48" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                  <path d="M20.96 11.22a9 9 0 1 0-9.18 9.18" />
                  <path d="M12 12v.01" />
                </svg>
                <span>Doctor Image</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Text Content Section (Dark background) */}
        <div className="bg-dark-grey rounded-t-[2rem] -mt-6 text-white p-8 pb-6 z-10">
          {/* JUST TWO CLICKS */}
          <div className="uppercase text-xs tracking-wider mb-2 opacity-60 flex items-center">
            Just two clicks
            <div className="flex ml-4 items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-white opacity-60"></span>
              <span className="inline-block w-1 h-1 rounded-full bg-white opacity-60"></span>
              <span className="inline-block w-8 h-1 rounded-full bg-white"></span>
            </div>
          </div>
          
          {/* Main Text */}
          <h2 className="text-3xl font-bold mb-10">
            Book your<br />
            Doctor any<br />
            Time, <span className="text-primary">anywhere</span>.
          </h2>
          
          <Button 
            type="primary" 
            fullWidth 
            onClick={() => router.push('/auth/register')}
            className="py-4 rounded-xl flex items-center justify-center font-medium"
          >
            Get Started <span className="ml-2">›</span>
          </Button>
        </div>
      </div>
    </div>
  );
} 