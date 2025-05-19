'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '../../../store/bookingStore';

const BookingSuccessView = () => {
  const router = useRouter();
  const { 
    selectedSpecialty, 
    selectedDate, 
    selectedDoctor, 
    selectedSlot,
    reset
  } = useBookingStore();

  const handleViewBookings = () => {
    router.push('/bookings');
  };

  const handleAddToCalendar = () => {
    // In a real app, this would integrate with the device calendar
    alert('La integración con el calendario ocurriría aquí');
  };

  const handleBookAnother = () => {
    reset();
    router.push('/booking/specialty');
  };

  if (!selectedDoctor || !selectedSpecialty || !selectedDate || !selectedSlot) {
    return (
      <div className="p-6 text-center" style={{ backgroundColor: '#F0F4F9' }}>
        <h1 className="text-xl font-semibold text-dark-grey mb-4">Reserva Confirmada</h1>
        <p className="text-medium-grey mb-6">¡Tu reserva ha sido confirmada con éxito!</p>
        <button
          className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium flex items-center justify-center mb-4"
          onClick={handleViewBookings}
        >
          Ver Mis Reservas <span className="ml-2">›</span>
        </button>
      </div>
    );
  }

  return (
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
        <div className="absolute top-0 right-0 left-0 h-8">
          <svg viewBox="0 0 200 20" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M0,10 Q20,20 40,10 T80,10 T120,10 T160,10 T200,10" stroke="rgba(255,255,255,0.2)" fill="none" strokeWidth="2"/>
          </svg>
        </div>
        
        <div className="text-xl font-semibold mb-4">
          {selectedDate.toLocaleDateString('es-ES', { 
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
      
      <div className="flex flex-col gap-4 mb-6">
        <button
          className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium flex items-center justify-center"
          onClick={handleAddToCalendar}
        >
          Añadir al Calendario
        </button>
        
        <button
          className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium flex items-center justify-center"
          onClick={handleViewBookings}
        >
          Ver Mis Reservas <span className="ml-2">›</span>
        </button>
      </div>
      
      <button
        className="w-full py-3 px-4 bg-light-grey text-dark-grey rounded-lg font-medium"
        onClick={handleBookAnother}
      >
        Reservar Otra Cita
      </button>
    </div>
  );
};

export default BookingSuccessView; 