"use client";

import React from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import to improve initial page load
const DoctorsTable = dynamic(
  () => import('@/components/admin/Doctors/DoctorsTable'),
  { 
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-pulse text-medium-grey">Loading doctors table...</div>
      </div>
    ),
    ssr: false // Disable SSR to prevent hydration issues with complex table state
  }
);

const DoctorsTableWrapper: React.FC = () => {
  return <DoctorsTable />;
};

export default DoctorsTableWrapper; 