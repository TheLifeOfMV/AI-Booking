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
    cancelBooking,
    rescheduleBooking
  } = useUserBookingsStore();
  
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  
  useEffect(() => {
    fetchBookingById(params.id);
  }, [fetchBookingById, params.id]);
  
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
    <div className="pb-24">
      {/* Header */}
      <div className="bg-dark-grey text-white p-6 relative">
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
          <span className="ml-2">Regresar</span>
        </button>
        
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
      <div className="p-4">
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <h2 className="font-semibold text-lg mb-3">Información de la Cita</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-light-grey">
              <span className="text-medium-grey">Fecha</span>
              <span className="font-medium">{formatDate(selectedBooking.date)}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-light-grey">
              <span className="text-medium-grey">Hora</span>
              <span className="font-medium">{selectedBooking.slotTime}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-light-grey">
              <span className="text-medium-grey">Doctor</span>
              <span className="font-medium">{selectedBooking.doctorName}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-light-grey">
              <span className="text-medium-grey">Especialidad</span>
              <span className="font-medium">{selectedBooking.specialtyName}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-light-grey">
              <span className="text-medium-grey">Ubicación</span>
              <span className="font-medium">{selectedBooking.location}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-light-grey">
              <span className="text-medium-grey">Precio</span>
              <span className="font-medium">${selectedBooking.price}</span>
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
          <h2 className="font-semibold text-lg mb-3">Contactar al Doctor</h2>
          <p className="text-medium-grey mb-3">
            ¿Necesitas hacer una pregunta antes de tu cita? Puedes contactar a tu doctor directamente.
          </p>
          
          <div className="flex flex-col space-y-3">
            <a 
              href={`tel:+123456789`} 
              className="bg-light-grey text-dark-grey py-3 px-4 rounded-lg font-medium flex items-center justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                <path d="M22 16.92V19.92C22 20.4704 21.7893 20.9996 21.4142 21.3746C21.0391 21.7497 20.5099 21.9604 19.9595 21.96C16.4275 21.6886 13.0149 20.346 10.0905 18.08C7.37456 16.0001 5.13092 13.7565 3.051 11.04C0.780377 8.1055 -0.562316 4.6805 0.0395304 1.14C0.0390863 0.589939 0.249685 0.061002 0.624749 -0.314058C0.999813 -0.689118 1.52902 -0.899891 2.08 -0.9H5.08C6.08866 -0.913677 6.9167 0.249001 7.08 1.23C7.23842 2.25478 7.52283 3.25824 7.931 4.22C8.24627 5.01723 8.08471 5.91214 7.59 6.51L6.39 7.71C8.33361 10.5381 10.6619 12.8664 13.49 14.81L14.69 13.61C15.2879 13.1153 16.1828 12.9537 16.98 13.27C17.9417 13.6782 18.9452 13.9626 19.97 14.12C20.9582 14.2851 21.5791 15.1132 21.565 16.12L22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Llamar al Doctor
            </a>
            
            <a 
              href={`mailto:doctor@example.com`} 
              className="bg-light-grey text-dark-grey py-3 px-4 rounded-lg font-medium flex items-center justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Enviar Email
            </a>

            <a 
              href={`https://wa.me/123456789`} 
              className="bg-light-grey text-dark-grey py-3 px-4 rounded-lg font-medium flex items-center justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                <path d="M20.572 3.429C19.272 2.112 17.704 1.061 15.971 0.334C14.238 -0.392 12.378 -0.781 10.5 -0.81C8.623 -0.781 6.762 -0.392 5.029 0.334C3.296 1.061 1.728 2.112 0.428 3.429C-0.143 4.047 -0.143 4.954 0.428 5.572C0.997 6.141 1.903 6.141 2.472 5.572C3.467 4.577 4.639 3.789 5.927 3.252C7.215 2.715 8.591 2.44 9.979 2.443C11.366 2.44 12.742 2.715 14.03 3.252C15.318 3.789 16.49 4.577 17.485 5.572C17.77 5.857 18.148 6 18.52 6C18.888 6 19.256 5.863 19.537 5.586C20.143 4.968 20.143 4.047 19.572 3.429H20.572Z" fill="currentColor"/>
                <path d="M16.76 6.53C15.55 5.35 13.93 4.69 12.23 4.69C10.13 4.69 8.21 5.66 6.94 7.31C5.66 8.95 5.27 11.04 5.93 13.01L4 18.04L9.15 16.15C10.01 16.45 10.9 16.6 11.81 16.6C15.28 16.6 18.08 13.8 18.08 10.33C18.07 8.64 17.41 7.05 16.23 5.87L16.76 6.53Z" fill="currentColor"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="space-y-4">
          {canReschedule(selectedBooking) && (
            <button 
              onClick={handleRescheduleClick}
              className="bg-primary text-white w-full py-3 rounded-lg font-medium flex items-center justify-center"
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
              className="border border-red-500 text-red-500 w-full py-3 rounded-lg font-medium flex items-center justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Cancelar Cita
            </button>
          )}
          
          <Link 
            href="/bookings"
            className="border border-dark-grey text-dark-grey w-full py-3 rounded-lg font-medium flex items-center justify-center"
          >
            Ver Todas las Citas
          </Link>
        </div>
      </div>
      
      {/* Add to Calendar Button */}
      {selectedBooking.status === 'confirmed' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-light-grey">
          <button 
            className="bg-primary text-white w-full py-3 rounded-lg font-medium flex items-center justify-center"
            onClick={() => {
              // In a real app, this would generate a calendar event file
              alert('This would add the appointment to your calendar');
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
              <rect x="4" y="5" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 11H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Añadir al Calendario
          </button>
        </div>
      )}
      
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