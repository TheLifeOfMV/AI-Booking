'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '../../../store/bookingStore';
import Image from 'next/image';

const BookingConfirmationView = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    selectedSpecialty, 
    selectedDate, 
    selectedDoctor,
    selectedSlot,
    draftBooking,
    createDraftBooking,
    reset
  } = useBookingStore();

  useEffect(() => {
    // Ensure we have all required data, otherwise redirect back
    if (!selectedSpecialty || !selectedDate || !selectedDoctor || !selectedSlot) {
      router.push('/booking/slot');
      return;
    }

    // Create draft booking if not already created
    if (!draftBooking) {
      createDraftBooking();
    }
  }, [selectedSpecialty, selectedDate, selectedDoctor, selectedSlot, draftBooking, createDraftBooking, router]);

  const handleConfirmBooking = async () => {
    if (!draftBooking) return;

    setIsSubmitting(true);
    setError(null);
    
    try {
      // Simulate API call - in a real app this would be a fetch to the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to success page
      router.push('/booking/success');
      
      // In a real app, we'd reset the store after a successful navigation
      // setTimeout(() => reset(), 1000);
    } catch (err) {
      setError('There was an error confirming your booking. Please try again.');
      setIsSubmitting(false);
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

  if (!draftBooking || !selectedDoctor || !selectedSlot || !selectedSpecialty) {
    return null; // Prevent rendering while redirecting
  }

  return (
    <div className="px-4 py-6 bg-gray-50">
      <h1 className="text-xl font-semibold text-dark-grey mb-6">Confirm Booking</h1>
      
      {/* Summary Card with Dark Background */}
      <div className="bg-dark-grey text-white rounded-xl overflow-hidden mb-8">
        <div className="p-5 relative">
          {/* Decorative wavy line */}
          <div className="absolute top-3 right-3 left-3 h-6 opacity-20">
            <svg viewBox="0 0 200 20" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M0,10 Q20,20 40,10 T80,10 T120,10 T160,10 T200,10" stroke="currentColor" fill="none" strokeWidth="2"/>
            </svg>
          </div>
          
          <h2 className="text-xl font-semibold mb-4 mt-2">{formatDate(selectedDate)}, {selectedSlot.time}</h2>
          
          <div className="flex items-center gap-4 mb-4">
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
              <h3 className="font-medium">{selectedDoctor.name}</h3>
              <p className="text-sm opacity-80">{selectedSpecialty.name}</p>
            </div>
          </div>
          
          <p className="text-sm opacity-80 mb-6">California Medical Center, Room 234</p>
          
          <button 
            className={`w-full bg-primary text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            onClick={handleConfirmBooking}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                Processing...
              </div>
            ) : (
              <>Confirm Booking<span className="ml-2">›</span></>
            )}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <div className="border border-light-grey rounded-lg p-4 mb-4">
        <h3 className="font-medium mb-2">Booking Details</h3>
        <div className="text-sm text-medium-grey mb-1">
          <span className="font-medium text-dark-grey">Date:</span> {formatDate(selectedDate)}
        </div>
        <div className="text-sm text-medium-grey mb-1">
          <span className="font-medium text-dark-grey">Time:</span> {selectedSlot.time}
        </div>
        <div className="text-sm text-medium-grey mb-1">
          <span className="font-medium text-dark-grey">Doctor:</span> {selectedDoctor.name}
        </div>
        <div className="text-sm text-medium-grey">
          <span className="font-medium text-dark-grey">Specialty:</span> {selectedSpecialty.name}
        </div>
      </div>
      
      <div className="text-sm text-medium-grey">
        <p className="mb-2">By confirming this booking, you agree to our Terms of Service and Cancellation Policy.</p>
        <p>You can cancel or reschedule this appointment up to 24 hours before the scheduled time without any penalty.</p>
      </div>
    </div>
  );
};

export default BookingConfirmationView; 