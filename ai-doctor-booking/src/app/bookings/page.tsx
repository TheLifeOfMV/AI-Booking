"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserBookingsStore } from '@/store/userBookingsStore';
import Image from 'next/image';
import Link from 'next/link';

export default function BookingsPage() {
  const router = useRouter();
  const { bookings, isLoading, error, fetchUserBookings } = useUserBookingsStore();
  const [activeTab, setActiveTab] = React.useState<'upcoming' | 'past'>('upcoming');
  
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
      
      {/* Tab Buttons */}
      <div className="bg-white rounded-xl p-1 shadow-sm mb-6">
        <div className="flex">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'upcoming'
                ? 'bg-primary text-white shadow-sm'
                : 'text-medium-grey hover:text-dark-grey'
            }`}
          >
            Próximas ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'past'
                ? 'bg-primary text-white shadow-sm'
                : 'text-medium-grey hover:text-dark-grey'
            }`}
          >
            Pasadas ({pastBookings.length})
          </button>
        </div>
      </div>
      
      {/* Content based on active tab */}
      {activeTab === 'upcoming' ? (
        <section>
          {upcomingBookings.length === 0 ? (
            <div className="bg-white rounded-xl p-8 shadow-sm text-center">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-light-grey" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-medium-grey mb-4">No hay citas próximas</p>
              <Link 
                href="/booking/specialty" 
                className="inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors text-white"
                style={{ backgroundColor: '#007AFF' }}
              >
                Agendar una Cita
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map(booking => (
                <div 
                  key={booking.id} 
                  className="bg-dark-grey text-white rounded-xl overflow-hidden shadow-sm cursor-pointer transform transition-all duration-200 hover:scale-[1.02]"
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
                    <div className="text-sm opacity-80">{booking.location}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section>
          {pastBookings.length === 0 ? (
            <div className="bg-white rounded-xl p-8 shadow-sm text-center">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-light-grey" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-medium-grey">No hay citas pasadas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pastBookings.map(booking => (
                <div 
                  key={booking.id} 
                  className="bg-white rounded-xl p-4 shadow-sm cursor-pointer transform transition-all duration-200 hover:scale-[1.01] hover:shadow-md"
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
      )}
    </div>
  );
} 