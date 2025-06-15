import React from 'react';
import { redirect } from 'next/navigation';
import Image from 'next/image';

export const metadata = {
  title: 'AI Doctor Booking',
  description: 'Iniciando aplicación...',
};

// This is a server component, so we can't use useEffect or setTimeout
// In a real app, we would use a client component with useEffect
// For this demo, we'll use a simple redirect with a short delay
export default function SplashPage() {
  // In production we would have a more sophisticated splash screen logic
  // For now, we'll just show the splash and redirect to intro after page load
  redirect('/intro');
  
  // This will never be shown due to the redirect, but included for completeness
  return (
    <div className="flex flex-col items-center justify-center h-screen" style={{ backgroundColor: '#E6F0FA' }}>
      <div className="w-32 h-32 relative mb-8">
        <Image
          src="/images/logo.png"
          alt="AI Doctor Booking Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
      <h1 className="text-2xl font-bold text-primary mb-2">AI Doctor Booking</h1>
      <p className="text-medium-grey">Su salud, nuestra prioridad</p>
    </div>
  );
} 