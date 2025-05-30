"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserBookingsStore } from '@/store/userBookingsStore';
import Image from 'next/image';
import Link from 'next/link';
import BookingsPage from '../page';

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { 
    selectedBooking, 
    isLoading, 
    error, 
    fetchBookingById, 
    cancelBooking,
    rescheduleBooking
  } = useUserBookingsStore();
  
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  
  // Swipe navigation state
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  
  useEffect(() => {
    fetchBookingById(params.id);
  }, [fetchBookingById, params.id]);
  
  // Swipe navigation for going back to previous page
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      // Only start tracking if touch starts from the left edge (within 50px)
      if (touch.clientX <= 50) {
        setTouchStart({
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now()
        });
        setIsSwipeActive(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStart || !isSwipeActive) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      
      // If user moves too much vertically, cancel the swipe
      if (Math.abs(deltaY) > 100) {
        setIsSwipeActive(false);
        setTouchStart(null);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart || !isSwipeActive) return;
      
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      const deltaTime = Date.now() - touchStart.time;
      
      // Check if it's a valid swipe gesture:
      // - Started from left edge
      // - Moved right at least 100px
      // - Vertical movement less than 100px
      // - Completed within 500ms
      if (
        deltaX > 100 && 
        Math.abs(deltaY) < 100 && 
        deltaTime < 500 &&
        touchStart.x <= 50
      ) {
        // Navigate back to previous page
        router.back();
      }
      
      // Reset swipe state
      setIsSwipeActive(false);
      setTouchStart(null);
    };

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Cleanup
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [router, touchStart, isSwipeActive]);
  
  const formatDate = (date: Date) => {
    // Format in Spanish and English
    return new Intl.DateTimeFormat('es-ES', {
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
    // And at least 24h before appointment
    const appointmentDate = new Date(booking.date);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return isFutureDate(booking.date) && 
           booking.status === 'confirmed' && 
           hoursUntilAppointment >= 24;
  };
  
  const canReschedule = (booking: typeof selectedBooking) => {
    if (!booking) return false;
    
    // Same rules as cancellation
    const appointmentDate = new Date(booking.date);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return isFutureDate(booking.date) && 
           booking.status === 'confirmed' && 
           hoursUntilAppointment >= 24;
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

  const handleRescheduleClick = () => {
    setShowRescheduleModal(true);
  };
  
  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-screen">
        <p className="text-medium-grey">Cargando detalles de la cita... </p>
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
          Intentar de nuevo
        </button>
      </div>
    );
  }
  
  if (!selectedBooking) {
    return (
      <div className="p-4 text-center min-h-screen">
        <p className="text-medium-grey">Cita no encontrada</p>
        <button 
          className="mt-4 text-primary font-medium"
          onClick={handleBack}
        >
          Regresar
        </button>
      </div>
    );
  }
  
  return (
    <div className="pb-24 bg-gray-50">
      {/* Header */}
      <div className="bg-dark-grey text-white p-6 relative">
        <h1 className="text-xl font-semibold mb-4">Detalles de la Cita</h1>
        
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
          {selectedBooking.status === 'confirmed' ? 'Confirmada' : 
           selectedBooking.status === 'cancelled' ? 'Cancelada' : 
           selectedBooking.status === 'completed' ? 'Completada' : 
           'Pendiente'}
        </div>
      </div>
      
      {/* Booking information */}
      <div className="p-4 bg-gray-50">
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <h2 className="font-semibold text-lg mb-3">Información de la Cita</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between py-2">
              <span className="text-medium-grey">Fecha</span>
              <span className="font-medium">{formatDate(selectedBooking.date)}</span>
            </div>
            
            <div className="flex justify-between py-2">
              <span className="text-medium-grey">Hora</span>
              <span className="font-medium">{selectedBooking.slotTime}</span>
            </div>
            
            <div className="flex justify-between py-2">
              <span className="text-medium-grey">Doctor</span>
              <span className="font-medium">{selectedBooking.doctorName}</span>
            </div>
            
            <div className="flex justify-between py-2">
              <span className="text-medium-grey">Especialidad</span>
              <span className="font-medium">{selectedBooking.specialtyName}</span>
            </div>
            
            <div className="flex justify-between py-2">
              <span className="text-medium-grey">Ubicación</span>
              <span className="font-medium">{selectedBooking.location}</span>
            </div>
            
            <div className="flex justify-between py-2">
              <span className="text-medium-grey">Estado</span>
              <span className={`font-medium ${
                selectedBooking.status === 'confirmed' 
                  ? 'text-green-600' 
                  : selectedBooking.status === 'cancelled' 
                    ? 'text-red-600' 
                    : selectedBooking.status === 'completed' 
                      ? 'text-blue-600' 
                      : 'text-yellow-600'
              }`}>
                {selectedBooking.status === 'confirmed' ? 'Confirmada' : 
                 selectedBooking.status === 'cancelled' ? 'Cancelada' : 
                 selectedBooking.status === 'completed' ? 'Completada' : 
                 'Pendiente'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Contact doctor */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <h2 className="font-semibold text-lg mb-3">Quieres reprogramar tu cita?</h2>
          <p className="text-medium-grey mb-3">
            Si necesitas cambiar la fecha o hora de tu cita, puedes utilizar el asistente virtual o hacerlo manualmente en la app.
          </p>
          
          <div className="flex flex-col space-y-3">
            <a 
              href={`tel:+123456789`} 
              className="bg-light-grey text-dark-grey py-3 px-4 rounded-lg font-medium flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Llamar Asistente Virtual
            </a>

            <a 
              href={`https://wa.me/123456789`} 
              className="bg-light-grey text-dark-grey py-3 px-4 rounded-lg font-medium flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
            
            {/* Reschedule and Cancel buttons */}
            {canReschedule(selectedBooking) && (
              <button 
                onClick={handleRescheduleClick}
                className="bg-primary text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                  <rect x="4" y="5" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 11H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 16L12 14V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Reprogramar Cita
              </button>
            )}
            
            {canCancel(selectedBooking) && (
              <button 
                onClick={() => setShowCancelConfirm(true)}
                className="border border-red-500 text-red-500 py-3 px-4 rounded-lg font-medium flex items-center justify-center"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Cancelar Cita
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-md">
            <h3 className="font-semibold text-lg mb-3">¿Estás seguro?</h3>
            <p className="text-medium-grey mb-5">
              Esta acción cancelará tu cita con {selectedBooking.doctorName} el {formatDate(selectedBooking.date)} a las {selectedBooking.slotTime}.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 border border-dark-grey text-dark-grey py-2 rounded-lg font-medium"
                disabled={cancelling}
              >
                No, Mantener
              </button>
              <button 
                onClick={handleCancelBooking}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg font-medium flex items-center justify-center"
                disabled={cancelling}
              >
                {cancelling ? (
                  <span>Cancelando...</span>
                ) : (
                  <span>Sí, Cancelar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Reschedule Modal (placeholder - would link to actual rescheduling flow) */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-md">
            <h3 className="font-semibold text-lg mb-3">Reprogramar Cita</h3>
            <p className="text-medium-grey mb-5">
              ¿Deseas reprogramar tu cita con {selectedBooking.doctorName}?
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowRescheduleModal(false)}
                className="flex-1 border border-dark-grey text-dark-grey py-2 rounded-lg font-medium"
              >
                Cancelar
              </button>
              <Link
                href={`/booking/reschedule/${selectedBooking.id}`}
                className="flex-1 bg-primary text-white py-2 rounded-lg font-medium flex items-center justify-center"
              >
                Continuar
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 