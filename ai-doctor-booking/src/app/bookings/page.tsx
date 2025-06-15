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
    return new Intl.DateTimeFormat('es-ES', {
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
        <p className="text-medium-grey">Cargando citas...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-center min-h-screen">
        <p className="text-accent-orange">Error al cargar las citas. Por favor intenta de nuevo.</p>
        <button 
          className="mt-4 text-primary font-medium"
          onClick={() => fetchUserBookings()}
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen px-4 pb-24" style={{ backgroundColor: '#E6F0FA' }}>
      <div className="flex justify-center items-center mb-6 pt-4">
        <h1 className="text-3xl font-semibold text-dark-grey text-center">Mis Citas</h1>
      </div>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Citas Próximas</h2>
        {upcomingBookings.length === 0 ? (
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-medium-grey">No hay citas próximas</p>
            <Link href="/booking/specialty" className="text-primary font-medium mt-2 inline-block">
              Agendar una Cita
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
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">Citas Pasadas</h2>
        {pastBookings.length === 0 ? (
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-medium-grey">No hay citas pasadas</p>
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
                    {booking.status === 'completed' ? 'Completada' : 'Cancelada'}
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