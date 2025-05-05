'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DoctorCard from '../../../components/DoctorCard';
import { useBookingStore } from '../../../store/bookingStore';
import { Doctor, TimeSlot } from '../../../types/booking';

const DoctorListView = () => {
  const router = useRouter();
  const { 
    doctors, 
    selectedSpecialty,
    selectedDate,
    selectedDoctor,
    selectedSlot,
    isLoading,
    error,
    fetchDoctorsBySpecialtyAndDate,
    setSelectedDoctor,
    setSelectedSlot,
  } = useBookingStore();

  useEffect(() => {
    if (!selectedSpecialty || !selectedDate) {
      // If specialty or date is not selected, redirect back to specialty selection
      router.push('/booking/specialty');
      return;
    }

    // Fetch doctors based on selected specialty and date
    fetchDoctorsBySpecialtyAndDate(selectedSpecialty.id, selectedDate);
  }, [selectedSpecialty, selectedDate, fetchDoctorsBySpecialtyAndDate, router]);

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    // Navigate to slot selection page
    router.push('/booking/slot');
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-pulse text-primary">Loading doctors...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            className="bg-primary text-white py-2 px-4 rounded-lg"
            onClick={() => fetchDoctorsBySpecialtyAndDate(selectedSpecialty!.id, selectedDate!)}
          >
            Try Again
          </button>
        </div>
      );
    }

    if (doctors.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-medium-grey">No doctors available for this specialty and date.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4">
        {doctors.map((doctor) => (
          <DoctorCard
            key={doctor.id}
            doctor={doctor}
            isSelected={selectedDoctor?.id === doctor.id}
            onSelect={handleDoctorSelect}
            onSlotSelect={handleSlotSelect}
            selectedSlotId={selectedSlot?.id}
          />
        ))}
      </div>
    );
  };

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
      
      {selectedDate && (
        <div className="mb-6">
          <p className="text-medium-grey text-sm mb-1">Selected Date</p>
          <p className="font-medium">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      )}
      
      {renderContent()}
    </div>
  );
};

export default DoctorListView; 