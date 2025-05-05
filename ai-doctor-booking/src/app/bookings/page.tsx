"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserBookingsStore } from '@/store/userBookingsStore';
import Image from 'next/image';
import Link from 'next/link';

export default function BookingsPage() {
  const router = useRouter();
  const { bookings, isLoading, error, fetchUserBookings } = useUserBookingsStore();
  
  useEffect(() => {
    fetchUserBookings();
  }, [fetchUserBookings]);
  
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
  
  const upcomingBookings = bookings.filter(booking => 
    isFutureDate(booking.date) && booking.status !== 'cancelled'
  );
  
  const pastBookings = bookings.filter(booking => 
    !isFutureDate(booking.date) || booking.status === 'cancelled'
  );
  
  const handleBookingClick = (id: string) => {
    router.push(`/bookings/${id}`);
  };
  
  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-screen">
        <p className="text-medium-grey">Loading bookings...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-center min-h-screen">
        <p className="text-accent-orange">{error}</p>
        <button 
          className="mt-4 text-primary font-medium"
          onClick={() => fetchUserBookings()}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-4 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-dark-grey">My Bookings</h1>
      </div>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
        {upcomingBookings.length === 0 ? (
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-medium-grey">No upcoming appointments</p>
            <Link href="/booking/specialty" className="text-primary font-medium mt-2 inline-block">
              Book an Appointment
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingBookings.map(booking => (
              <div 
                key={booking.id} 
                className="bg-dark-grey text-white rounded-xl overflow-hidden shadow-sm cursor-pointer"
                onClick={() => handleBookingClick(booking.id)}
              >
                <div className="relative">
                  <div className="absolute top-3 right-3 left-3 h-8 z-10">
                    <svg viewBox="0 0 200 20" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      <path d="M0,10 Q20,20 40,10 T80,10 T120,10 T160,10 T200,10" stroke="rgba(255,255,255,0.2)" fill="none" strokeWidth="2"/>
                    </svg>
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-lg font-semibold mb-2">
                    {formatDate(booking.date)}, {booking.slotTime}
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-light-grey rounded-full overflow-hidden flex-shrink-0">
                      {booking.doctorAvatar ? (
                        <Image 
                          src={booking.doctorAvatar} 
                          alt={booking.doctorName} 
                          width={40} 
                          height={40} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-dark-grey">
                          {booking.doctorName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{booking.doctorName}</div>
                      <div className="text-sm opacity-80">{booking.specialtyName}</div>
                    </div>
                  </div>
                  <div className="text-sm opacity-80 mb-4">{booking.location}</div>
                  <div className="bg-primary text-white py-2 px-4 rounded-lg inline-flex items-center font-medium text-sm">
                    Pay now • {booking.price}$ <span className="ml-2">›</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">Past Appointments</h2>
        {pastBookings.length === 0 ? (
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-medium-grey">No past appointments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pastBookings.map(booking => (
              <div 
                key={booking.id} 
                className="bg-white rounded-xl p-4 shadow-sm cursor-pointer"
                onClick={() => handleBookingClick(booking.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-light-grey rounded-full overflow-hidden flex-shrink-0">
                      {booking.doctorAvatar ? (
                        <Image 
                          src={booking.doctorAvatar} 
                          alt={booking.doctorName} 
                          width={40} 
                          height={40} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-medium-grey">
                          {booking.doctorName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-dark-grey">{booking.doctorName}</div>
                      <div className="text-sm text-medium-grey">{booking.specialtyName}</div>
                    </div>
                  </div>
                  <div className="text-sm text-medium-grey">
                    {formatDate(booking.date)}
                  </div>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <div className="text-sm text-medium-grey">{booking.location}</div>
                  <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                    booking.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
} 