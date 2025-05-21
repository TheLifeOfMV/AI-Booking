'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '../../../store/bookingStore';
import Image from 'next/image';

const BookingConfirmationView = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
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
      
      // Show success modal instead of redirecting
      setIsSubmitting(false);
      setShowSuccessModal(true);
      
      // In a real app, we'd reset the store after a successful navigation
      // setTimeout(() => reset(), 1000);
    } catch (err) {
      setError('Hubo un error al confirmar tu reserva. Por favor, inténtalo de nuevo.');
      setIsSubmitting(false);
    }
  };

  const handleViewBookings = () => {
    router.push('/bookings');
  };

  const handleBookAnother = () => {
    reset();
    router.push('/booking/specialty');
  };

  // Format date to display
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (!draftBooking || !selectedDoctor || !selectedSlot || !selectedSpecialty) {
    return null; // Prevent rendering while redirecting
  }

  // Success Modal Component
  const SuccessModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden">
        <div className="px-4 py-6" style={{ backgroundColor: '#F0F4F9' }}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12L10 17L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-dark-grey mb-2">Reserva Confirmada</h1>
            <p className="text-medium-grey">Tu cita ha sido reservada con éxito</p>
          </div>
          
          <div className="bg-dark-grey text-white p-6 rounded-xl mb-6 relative overflow-hidden">
            
            <div className="text-xl font-semibold mb-4">
              {selectedDate?.toLocaleDateString('es-ES', { 
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
            
            <div className="text-sm opacity-80">Centro Médico California, Sala 234</div>
          </div>
          
          <div className="flex flex-col gap-4">
            <button
              className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium flex items-center justify-center"
              onClick={handleViewBookings}
            >
              Ver Mis Reservas <span className="ml-2">›</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="px-4 py-6" style={{ backgroundColor: '#F0F4F9' }}>
      {/* <h1 className="text-xl font-semibold text-dark-grey mb-6 text-center">Confirmar Reserva</h1> */}
      
      {/* Success Modal */}
      {showSuccessModal && <SuccessModal />}
      
      {/* Summary Card with Dark Background */}
      <div className="bg-dark-grey text-white rounded-xl overflow-hidden mb-8">
        <div className="p-6 flex flex-col items-center text-center">
          
          {/* 1. Doctor Avatar (square, centered, larger) */}
          <div className="w-28 h-28 bg-light-grey rounded-lg overflow-hidden mb-2">
            {selectedDoctor.avatarUrl ? (
              <Image 
                src={selectedDoctor.avatarUrl} 
                alt={selectedDoctor.name}
                width={112}
                height={112}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-dark-grey text-5xl font-semibold">
                {selectedDoctor.name ? selectedDoctor.name.charAt(0).toUpperCase() : '?'}
              </div>
            )}
          </div>
          
          {/* 2. Doctor Name (centered) */}
          <h3 className="text-lg font-semibold mt-0">{selectedDoctor.name}</h3>
          
          {/* 3. Specialty (centered) */}
          <p className="text-base opacity-80 mb-0">{selectedSpecialty.name}</p>
          
          {/* 4. Location (centered) */}
          <p className="text-sm opacity-80 mb-1">Centro Médico California, Sala 234</p>
          
          {/* 5. Date, Time (centered) */}
          <p className="text-lg font-medium mb-4">{formatDate(selectedDate)}, {selectedSlot.time}</p>
          
          {/* 6. Confirm Button */}
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
                Procesando...
              </div>
            ) : (
              <>Confirmar Reserva<span className="ml-2">›</span></>
            )}
          </button>
        </div>
      </div>
      
      <div className="border border-light-grey rounded-lg p-4 mb-4">
        <h3 className="font-medium mb-2">Detalles de la Reserva</h3>
        <div className="text-sm text-medium-grey mb-1">
          <span className="font-medium text-dark-grey">Fecha:</span> {formatDate(selectedDate)}
        </div>
        <div className="text-sm text-medium-grey mb-1">
          <span className="font-medium text-dark-grey">Hora:</span> {selectedSlot.time}
        </div>
        <div className="text-sm text-medium-grey mb-1">
          <span className="font-medium text-dark-grey">Doctor:</span> {selectedDoctor.name}
        </div>
        <div className="text-sm text-medium-grey">
          <span className="font-medium text-dark-grey">Especialidad:</span> {selectedSpecialty.name}
        </div>
      </div>
      
      <div className="text-sm text-medium-grey">
        <p className="mb-2">Al confirmar esta reserva, aceptas nuestros Términos de Servicio y Política de Cancelación.</p>
        <p>Puedes cancelar o reprogramar esta cita hasta 24 horas antes de la hora programada sin ninguna penalización.</p>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default BookingConfirmationView; 