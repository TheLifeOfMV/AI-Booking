import React from 'react';
import { Metadata } from 'next';
import DoctorsTableWrapper from '@/components/admin/Doctors/DoctorsTableWrapper';

export const metadata: Metadata = {
  title: 'Admin - Doctors | AI Doctor Booking',
  description: 'Manage doctor profiles, approve credentials, and control doctor visibility',
};

/**
 * Admin Doctors View
 * 
 * This page displays a table of all doctors in the system with controls to:
 * - Search and filter doctors
 * - View and edit doctor details
 * - Update credential verification status
 * - Toggle doctor approval status
 */
export default function DoctorsPage() {
  return (
    <div className="w-full p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-dark-grey">Doctors</h1>
        <p className="text-medium-grey">
          Manage doctor profiles, verify credentials, and control who appears in the booking system.
        </p>
      </div>
      
      <DoctorsTableWrapper />
    </div>
  );
} 