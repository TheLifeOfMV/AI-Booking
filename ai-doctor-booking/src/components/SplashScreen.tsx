'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export const SplashScreen: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to intro after 2 seconds
    const timer = setTimeout(() => {
      router.push('/intro');
    }, 2000);

    // Cleanup the timer
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <div className="w-32 h-32 relative mb-8 animate-pulse">
        {/* We'll use a placeholder logo since we don't have a real one yet */}
        <div className="bg-primary rounded-full w-full h-full flex items-center justify-center text-white text-5xl font-bold">
          AI
        </div>
      </div>
      <h1 className="text-2xl font-bold text-primary mb-2">AI Doctor Booking</h1>
      <p className="text-medium-grey">Su salud, nuestra prioridad</p>
    </div>
  );
}; 