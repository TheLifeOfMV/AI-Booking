'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '../../../store/bookingStore';
import { TimeSlot } from '../../../types/booking';

const SlotPickerView = () => {
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
    if (!selectedSpecialty || !selectedDate || !selectedDoctor) {
      router.push('/booking/doctor');
      return;
    }
  }, [selectedSpecialty, selectedDate, selectedDoctor, router]);

  const handleSlotSelect = (slotId: string) => {
    const slot = selectedDoctor?.availableSlots.find((s: TimeSlot) => s.id === slotId);
    if (slot) {
      setSelectedSlot(slot);
    }
  };

  const handleConfirm = () => {
    createDraftBooking();
    router.push('/booking/confirm');
  };

  if (!selectedDoctor) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-dark-grey">Select Time</h1>
        {selectedSpecialty && (
          <span className="px-3 py-1 bg-light-grey text-dark-grey rounded-full text-sm">
            {selectedSpecialty.name}
          </span>
        )}
      </div>
      
      <div className="mb-6">
        <p className="text-medium-grey text-sm mb-1">Selected Doctor</p>
        <p className="font-medium">{selectedDoctor.name}</p>
      </div>
      
      <div className="mb-6">
        <p className="text-medium-grey text-sm mb-1">Selected Date</p>
        <p className="font-medium">
          {selectedDate?.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
      
      <div className="mb-8">
        <p className="text-medium-grey text-sm mb-4">Available Time Slots</p>
        <div className="grid grid-cols-3 gap-3">
          {selectedDoctor.availableSlots.map((slot: TimeSlot) => (
            <button
              key={slot.id}
              className={`py-2 px-3 rounded-lg text-sm font-medium ${
                selectedSlot?.id === slot.id 
                  ? 'bg-primary text-white' 
                  : 'bg-light-grey text-dark-grey'
              }`}
              onClick={() => handleSlotSelect(slot.id)}
            >
              {slot.time}
            </button>
          ))}
        </div>
      </div>
      
      <button
        className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center ${
          selectedSlot 
            ? 'bg-primary text-white' 
            : 'bg-light-grey text-medium-grey cursor-not-allowed'
        }`}
        onClick={handleConfirm}
        disabled={!selectedSlot}
      >
        Confirm Slot<span className="ml-2">›</span>
      </button>
    </div>
  );
};

export default SlotPickerView; 