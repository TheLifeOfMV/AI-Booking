'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '../../../store/bookingStore';
import { TimeSlot } from '../../../types/booking';
import Image from 'next/image';

const TimeSlotPickerView = () => {
  const router = useRouter();
  const { 
    selectedSpecialty, 
    selectedDate, 
    selectedDoctor,
    selectedSlot,
    setSelectedSlot,
    createDraftBooking
  } = useBookingStore();

  useEffect(() => {
    // If no doctor is selected, redirect back
    if (!selectedDoctor || !selectedDate || !selectedSpecialty) {
      router.push('/booking/doctor');
      return;
    }
  }, [selectedDoctor, selectedDate, selectedSpecialty, router]);

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleContinue = () => {
    if (selectedSlot) {
      createDraftBooking();
      router.push('/booking/confirm');
    }
  };

  // Format date to display
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (!selectedDoctor) {
    return null; // This prevents rendering while redirecting
  }

  return (
    <div className="px-4 py-6" style={{ backgroundColor: '#F0F4F9' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-dark-grey">Select Time</h1>
        {selectedSpecialty && (
          <span className="px-3 py-1 bg-light-grey text-dark-grey rounded-full text-sm">
            {selectedSpecialty.name}
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-light-grey rounded-full flex-shrink-0 overflow-hidden">
            {selectedDoctor.avatarUrl && (
              <Image 
                src={selectedDoctor.avatarUrl} 
                alt={selectedDoctor.name}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-dark-grey">{selectedDoctor.name}</h3>
            <div className="flex items-center text-sm text-medium-grey">
              <span className="text-amber-400 mr-1">★</span>
              <span>{selectedDoctor.rating}</span>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-medium-grey mb-2">{selectedDoctor.experience}</p>
        <p className="text-sm text-medium-grey">{formatDate(selectedDate)}</p>
      </div>
      
      <h2 className="font-semibold mb-4">Available Time Slots</h2>
      
      <div className="grid grid-cols-3 gap-3 mb-8">
        {selectedDoctor.availableSlots.map((slot: TimeSlot) => (
          <div 
            key={slot.id}
            className={`text-center py-2 rounded-lg cursor-pointer transition-colors ${
              selectedSlot?.id === slot.id 
                ? 'bg-primary text-white' 
                : 'bg-light-grey text-dark-grey'
            }`}
            onClick={() => handleSlotSelect(slot)}
          >
            <span className="font-medium text-sm">{slot.time}</span>
          </div>
        ))}
      </div>
      
      <button 
        className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center ${
          selectedSlot
            ? 'bg-primary text-white' 
            : 'bg-light-grey text-medium-grey cursor-not-allowed'
        }`}
        onClick={handleContinue}
        disabled={!selectedSlot}
      >
        Continue <span className="ml-2">›</span>
      </button>
    </div>
  );
};

export default TimeSlotPickerView; 