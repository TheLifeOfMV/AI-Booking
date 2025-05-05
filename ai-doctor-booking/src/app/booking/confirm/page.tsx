'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '../../../store/bookingStore';

const BookingConfirmView = () => {
  const router = useRouter();
  const { 
    selectedSpecialty, 
    selectedDate, 
    selectedDoctor, 
    selectedSlot,
    draftBooking
  } = useBookingStore();

  useEffect(() => {
    if (!selectedSpecialty || !selectedDate || !selectedDoctor || !selectedSlot) {
      router.push('/booking/slot');
      return;
    }
  }, [selectedSpecialty, selectedDate, selectedDoctor, selectedSlot, router]);

  const handleBookingConfirm = () => {
    // In a real app, this would call an API to create the booking
    router.push('/booking/success');
  };

  if (!selectedDoctor || !selectedSpecialty || !selectedDate || !selectedSlot) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-semibold text-dark-grey mb-6">Confirm Booking</h1>
      
      <div className="bg-dark-grey text-white p-6 rounded-xl mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-8">
          <svg viewBox="0 0 200 20" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M0,10 Q20,20 40,10 T80,10 T120,10 T160,10 T200,10" stroke="rgba(255,255,255,0.2)" fill="none" strokeWidth="2"/>
          </svg>
        </div>
        
        <div className="text-xl font-semibold mb-4">
          {selectedDate.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric' 
          })}, {selectedSlot.time}
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 bg-light-grey rounded-full flex items-center justify-center text-dark-grey font-bold">
            {selectedDoctor.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium">{selectedDoctor.name}</div>
            <div className="text-sm opacity-80">{selectedSpecialty.name}</div>
          </div>
        </div>
        
        <div className="text-sm opacity-80 mb-6">California Medical Center, Room 234</div>
        
        <button
          className="bg-primary text-white py-3 px-6 rounded-lg font-medium flex items-center"
          onClick={handleBookingConfirm}
        >
          Pay now • $35 <span className="ml-2">›</span>
        </button>
      </div>
      
      <div className="bg-white p-4 rounded-xl border border-light-grey mb-6">
        <h2 className="font-semibold mb-2">Booking Details</h2>
        <ul className="space-y-2 text-sm text-medium-grey">
          <li className="flex justify-between">
            <span>Specialty</span>
            <span className="text-dark-grey">{selectedSpecialty.name}</span>
          </li>
          <li className="flex justify-between">
            <span>Doctor</span>
            <span className="text-dark-grey">{selectedDoctor.name}</span>
          </li>
          <li className="flex justify-between">
            <span>Date</span>
            <span className="text-dark-grey">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </li>
          <li className="flex justify-between">
            <span>Time</span>
            <span className="text-dark-grey">{selectedSlot.time}</span>
          </li>
          <li className="flex justify-between">
            <span>Consultation Fee</span>
            <span className="text-dark-grey">$35</span>
          </li>
        </ul>
      </div>
      
      <div className="flex gap-4">
        <button
          className="flex-1 py-3 px-4 bg-light-grey text-dark-grey rounded-lg font-medium"
          onClick={() => router.push('/booking/slot')}
        >
          Change
        </button>
        
        <button
          className="flex-1 py-3 px-4 bg-primary text-white rounded-lg font-medium flex items-center justify-center"
          onClick={handleBookingConfirm}
        >
          Confirm <span className="ml-2">›</span>
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmView; 