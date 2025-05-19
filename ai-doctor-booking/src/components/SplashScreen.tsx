'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export const SplashScreen: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to intro after 1 second
    const timer = setTimeout(() => {
      router.push('/intro');
    }, 1000);

    // Cleanup the timer
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen" style={{ backgroundColor: '#F0F4F9' }}>
      <div className="w-64 h-64 relative mb-6">
        <Image
          src="/images/ChatGPT Image 6. Mai 2025, 23_19_44.png"
          alt="MedAI Logo"
          fill
          priority
          sizes="(max-width: 768px) 256px, 256px"
          style={{ objectFit: 'contain' }}
        />
      </div>
      <p className="text-medium-grey text-center px-6">Su salud, nuestra prioridad</p>
    </div>
  );
}; 