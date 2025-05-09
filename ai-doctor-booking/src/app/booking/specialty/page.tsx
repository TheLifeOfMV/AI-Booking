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
      
      <div className="flex overflow-x-auto pb-4 gap-6 -mx-4 px-4">
        {specialties.map((specialty) => (
          <div 
            key={specialty.id} 
            className={`flex-shrink-0 w-44 h-52 md:w-40 md:h-48 sm:w-36 sm:h-40 bg-white rounded-2xl overflow-hidden relative cursor-pointer shadow-lg border transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-primary ${
              selectedSpecialty?.id === specialty.id ? 'ring-2 ring-primary border-primary' : 'border-gray-200'
            }`}
            tabIndex={0}
            aria-label={`Select ${specialty.name}`}
            onClick={() => handleSpecialtySelect(specialty)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleSpecialtySelect(specialty); }}
          >
            <div className="w-full h-3/5 bg-light-grey flex items-center justify-center relative">
              {specialty.imageUrl && (
                <img
                  src={specialty.imageUrl}
                  alt={specialty.name}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
              )}
              {selectedSpecialty?.id === specialty.id && (
                <div className="absolute top-3 right-3 bg-primary w-7 h-7 rounded-full flex items-center justify-center text-white text-lg shadow-md">
                  ✓
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center items-center h-2/5 p-3">
              <span className="text-base md:text-md font-semibold text-dark-grey text-center break-words leading-tight">
                {specialty.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpecialtySelectionView; 