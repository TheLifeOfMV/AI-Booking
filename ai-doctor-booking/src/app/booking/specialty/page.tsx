'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '../../../store/bookingStore';
import { Specialty } from '../../../types/booking';

const SpecialtySelectionView = () => {
  const router = useRouter();
  const { selectedSpecialty, setSelectedSpecialty } = useBookingStore();
  const [specialties, setSpecialties] = useState<Specialty[]>([
    { id: '1', name: 'Cardiology', imageUrl: '/specialties/cardiology.jpg' },
    { id: '2', name: 'Dermatology', imageUrl: '/specialties/dermatology.jpg' },
    { id: '3', name: 'Pediatrics', imageUrl: '/specialties/pediatrics.jpg' },
    { id: '4', name: 'Ophthalmology', imageUrl: '/specialties/ophthalmology.jpg' },
    { id: '5', name: 'Neurology', imageUrl: '/specialties/neurology.jpg' },
  ]);

  const handleSpecialtySelect = (specialty: Specialty) => {
    setSelectedSpecialty(specialty);
    router.push('/booking/date');
  };

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-semibold text-dark-grey mb-6">Select Specialty</h1>
      
      <div className="flex overflow-x-auto pb-4 gap-4 -mx-4 px-4">
        {specialties.map((specialty) => (
          <div 
            key={specialty.id} 
            className={`flex-shrink-0 w-28 h-28 rounded-lg overflow-hidden relative cursor-pointer ${
              selectedSpecialty?.id === specialty.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleSpecialtySelect(specialty)}
          >
            <div className="w-full h-full bg-light-grey flex items-end">
              {selectedSpecialty?.id === specialty.id && (
                <div className="absolute top-2 right-2 bg-primary w-5 h-5 rounded-full flex items-center justify-center text-white text-xs">
                  ✓
                </div>
              )}
              <div className="bg-black bg-opacity-30 text-white p-2 w-full text-sm font-medium">
                {specialty.name}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpecialtySelectionView; 