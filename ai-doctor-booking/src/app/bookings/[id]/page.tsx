"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserBookingsStore } from '@/store/userBookingsStore';
import Image from 'next/image';
import Link from 'next/link';

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { 
    selectedBooking, 
    isLoading, 
    error, 
    fetchBookingById, 
    cancelBooking 
  } = useUserBookingsStore();
  
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  
  useEffect(() => {
    fetchBookingById(params.id);
  }, [fetchBookingById, params.id]);
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date));
  };
  
  const isFutureDate = (date: Date) => {
    return new Date(date) > new Date();
  };
  
  const canCancel = (booking: typeof selectedBooking) => {
    if (!booking) return false;
    
    // Can cancel if it's a future booking and is confirmed
    return isFutureDate(booking.date) && booking.status === 'confirmed';
  };
  
  const canReschedule = (booking: typeof selectedBooking) => {
    if (!booking) return false;
    
    // Can reschedule if it's a future booking and is confirmed
    return isFutureDate(booking.date) && booking.status === 'confirmed';
  };
  
  const handleBack = () => {
    router.back();
  };
  
  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    setCancelling(true);
    await cancelBooking(selectedBooking.id);
    setCancelling(false);
    setShowCancelConfirm(false);
  };
  
  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-screen">
        <p className="text-medium-grey">Loading booking details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-center min-h-screen">
        <p className="text-accent-orange">{error}</p>
        <button 
          className="mt-4 text-primary font-medium"
          onClick={() => fetchBookingById(params.id)}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  if (!selectedBooking) {
    return (
      <div className="p-4 text-center min-h-screen">
        <p className="text-medium-grey">Booking not found</p>
        <button 
          className="mt-4 text-primary font-medium"
          onClick={handleBack}
        >
          Go Back
        </button>
      </div>
    );
  }
  
  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-dark-grey text-white p-4 relative">
        <div className="absolute top-3 right-3 left-3 h-8 z-10">
          <svg viewBox="0 0 200 20" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M0,10 Q20,20 40,10 T80,10 T120,10 T160,10 T200,10" stroke="rgba(255,255,255,0.2)" fill="none" strokeWidth="2"/>
          </svg>
        </div>
        <button 
          onClick={handleBack}
          className="flex items-center text-white mb-4"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="ml-2">Back</span>
        </button>
        
        <h1 className="text-xl font-semibold mb-4">Appointment Details</h1>
        
        <div className="text-lg font-semibold mb-3">
          {formatDate(selectedBooking.date)}, {selectedBooking.slotTime}
        </div>
        
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-light-grey rounded-full overflow-hidden flex-shrink-0">
            {selectedBooking.doctorAvatar ? (
              <Image 
                src={selectedBooking.doctorAvatar} 
                alt={selectedBooking.doctorName} 
                width={48} 
                height={48} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-dark-grey">
                {selectedBooking.doctorName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <div className="font-medium">{selectedBooking.doctorName}</div>
            <div className="text-sm opacity-80">{selectedBooking.specialtyName}</div>
          </div>
        </div>
        
        <div className="text-sm opacity-80 mb-4">
          {selectedBooking.location}
        </div>
        
        <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
          selectedBooking.status === 'confirmed' 
            ? 'bg-green-500' 
            : selectedBooking.status === 'cancelled' 
              ? 'bg-red-500' 
              : selectedBooking.status === 'completed' 
                ? 'bg-blue-500' 
                : 'bg-yellow-500'
        }`}>
          {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
        </div>
      </div>
      
      {/* Booking information */}
      <div className="p-4">
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <h2 className="font-semibold text-lg mb-3">Appointment Information</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-light-grey">
              <span className="text-medium-grey">Date</span>
              <span className="font-medium">{formatDate(selectedBooking.date)}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-light-grey">
              <span className="text-medium-grey">Time</span>
              <span className="font-medium">{selectedBooking.slotTime}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-light-grey">
              <span className="text-medium-grey">Doctor</span>
              <span className="font-medium">{selectedBooking.doctorName}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-light-grey">
              <span className="text-medium-grey">Specialty</span>
              <span className="font-medium">{selectedBooking.specialtyName}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-light-grey">
              <span className="text-medium-grey">Location</span>
              <span className="font-medium">{selectedBooking.location}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-light-grey">
              <span className="text-medium-grey">Price</span>
              <span className="font-medium">${selectedBooking.price}</span>
            </div>
            
            <div className="flex justify-between py-2">
              <span className="text-medium-grey">Status</span>
              <span className={`font-medium ${
                selectedBooking.status === 'confirmed' 
                  ? 'text-green-600' 
                  : selectedBooking.status === 'cancelled' 
                    ? 'text-red-600' 
                    : selectedBooking.status === 'completed' 
                      ? 'text-blue-600' 
                      : 'text-yellow-600'
              }`}>
                {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Contact doctor */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <h2 className="font-semibold text-lg mb-3">Contact Doctor</h2>
          <p className="text-medium-grey mb-3">
            Need to ask a question before your appointment? You can contact your doctor directly.
          </p>
          
          <div className="flex flex-col space-y-3">
            <a 
              href={`tel:+123456789`} 
              className="bg-light-grey text-dark-grey py-3 px-4 rounded-lg font-medium flex items-center justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                <path d="M22 16.92V19.92C22 20.4704 21.7893 20.9996 21.4142 21.3746C21.0391 21.7497 20.5099 21.9604 19.9595 21.96C16.4275 21.6886 13.0149 20.346 10.0905 18.08C7.37456 16.0001 5.13092 13.7565 3.051 11.04C0.780377 8.1055 -0.562316 4.6805 0.0395304 1.14C0.0390863 0.589939 0.249685 0.061002 0.624749 -0.314058C0.999813 -0.689118 1.52902 -0.899891 2.08 -0.9H5.08C6.08866 -0.913677 6.9167 0.249001 7.08 1.23C7.23842 2.25478 7.52283 3.25824 7.931 4.22C8.24627 5.01723 8.08471 5.91214 7.59 6.51L6.39 7.71C8.33361 10.5381 10.6619 12.8664 13.49 14.81L14.69 13.61C15.2879 13.1153 16.1828 12.9537 16.98 13.27C17.9417 13.6782 18.9452 13.9626 19.97 14.12C20.9582 14.2851 21.5791 15.1132 21.565 16.12L22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Call Doctor
            </a>
            
            <a 
              href={`mailto:doctor@example.com`} 
              className="bg-light-grey text-dark-grey py-3 px-4 rounded-lg font-medium flex items-center justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Email Doctor
            </a>
          </div>
        </div>
        
        {/* Action buttons */}
        {(canReschedule(selectedBooking) || canCancel(selectedBooking)) && (
          <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
            <h2 className="font-semibold text-lg mb-3">Manage Appointment</h2>
            
            <div className="flex flex-col space-y-3">
              {canReschedule(selectedBooking) && (
                <Link 
                  href="/booking/specialty"
                  className="bg-primary text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                    <path d="M23 4V10H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M1 20V14H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3.51 9.00001C4.01717 7.56602 4.87913 6.28092 6.01547 5.27727C7.1518 4.27362 8.52547 3.58555 10.0083 3.27791C11.4911 2.97026 13.0348 3.05425 14.4761 3.52186C15.9175 3.98947 17.2064 4.82217 18.2 5.93001L23 10M1 14L5.8 18.07C6.79357 19.178 8.08249 20.0106 9.52384 20.4782C10.9652 20.9458 12.5089 21.0298 13.9917 20.7222C15.4745 20.4145 16.8482 19.7264 17.9845 18.7228C19.1209 17.7191 19.9828 16.434 20.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Reschedule
                </Link>
              )}
              
              {canCancel(selectedBooking) && (
                <>
                  {!showCancelConfirm ? (
                    <button 
                      onClick={() => setShowCancelConfirm(true)}
                      className="bg-light-grey text-dark-grey py-3 px-4 rounded-lg font-medium flex items-center justify-center"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                        <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Cancel Appointment
                    </button>
                  ) : (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <p className="text-red-800 mb-3">Are you sure you want to cancel this appointment?</p>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleCancelBooking}
                          disabled={cancelling}
                          className="bg-red-600 text-white py-2 px-4 rounded font-medium flex-1 flex items-center justify-center"
                        >
                          {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                        </button>
                        <button
                          onClick={() => setShowCancelConfirm(false)}
                          disabled={cancelling}
                          className="bg-light-grey text-dark-grey py-2 px-4 rounded font-medium flex-1"
                        >
                          No, Keep
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
        
        {selectedBooking.status === 'cancelled' && (
          <div className="bg-red-50 p-4 rounded-xl border border-red-200 mb-6">
            <div className="flex items-start">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 text-red-600 flex-shrink-0">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <h3 className="font-medium text-red-800">Appointment Cancelled</h3>
                <p className="text-red-700 text-sm">This appointment has been cancelled and can't be reinstated. Please book a new appointment if needed.</p>
              </div>
            </div>
          </div>
        )}
        
        {selectedBooking.status === 'completed' && (
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-6">
            <div className="flex items-start">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 text-blue-600 flex-shrink-0">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <h3 className="font-medium text-blue-800">Appointment Completed</h3>
                <p className="text-blue-700 text-sm">This appointment has been completed. Thank you for using our service.</p>
              </div>
            </div>
          </div>
        )}
        
        <Link 
          href="/bookings"
          className="w-full bg-dark-grey text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center"
        >
          Back to My Bookings
        </Link>
      </div>
    </div>
  );
} 