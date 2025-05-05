'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '../../../store/bookingStore';
import Image from 'next/image';
import { Doctor, TimeSlot } from '../../../types/booking';

const DoctorListView = () => {
  const router = useRouter();
  const { 
    selectedSpecialty, 
    selectedDate, 
    selectedDoctor,
    doctors,
    setSelectedDoctor,
    fetchDoctorsBySpecialtyAndDate,
    isLoading,
    error,
    clearError
  } = useBookingStore();

  useEffect(() => {
    // If no specialty or date is selected, redirect back
    if (!selectedSpecialty || !selectedDate) {
      router.push('/booking/date');
      return;
    }

    // Fetch doctors based on specialty and date
    fetchDoctorsBySpecialtyAndDate(selectedSpecialty.id, selectedDate);
  }, [selectedSpecialty, selectedDate, router, fetchDoctorsBySpecialtyAndDate]);

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    router.push('/booking/slot');
  };

  // Error handling
  if (error) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          className="px-4 py-2 bg-primary text-white rounded-lg"
          onClick={clearError}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-dark-grey">Select Doctor</h1>
        {selectedSpecialty && (
          <span className="px-3 py-1 bg-light-grey text-dark-grey rounded-full text-sm">
            {selectedSpecialty.name}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {doctors.map((doctor) => (
            <div 
              key={doctor.id} 
              className={`p-4 bg-white rounded-xl shadow-sm transition-transform ${
                selectedDoctor?.id === doctor.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleDoctorSelect(doctor)}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-light-grey rounded-full flex-shrink-0 overflow-hidden">
                  {doctor.avatarUrl && (
                    <Image 
                      src={doctor.avatarUrl} 
                      alt={doctor.name}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-dark-grey">{doctor.name}</h3>
                  <div className="flex items-center text-sm text-medium-grey">
                    <span className="text-amber-400 mr-1">★</span>
                    <span>{doctor.rating}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-medium-grey mb-3">{doctor.experience}</p>
              
              <div className="flex flex-wrap gap-2">
                {doctor.availableSlots.map((slot: TimeSlot) => (
                  <div 
                    key={slot.id}
                    className="bg-light-grey text-dark-grey px-3 py-1 rounded-lg text-sm font-medium"
                  >
                    {slot.time}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {selectedDoctor && (
        <button 
          className="w-full mt-8 bg-primary text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center"
          onClick={() => router.push('/booking/slot')}
        >
          Continue <span className="ml-2">›</span>
        </button>
      )}
    </div>
  );
};

export default DoctorListView; 