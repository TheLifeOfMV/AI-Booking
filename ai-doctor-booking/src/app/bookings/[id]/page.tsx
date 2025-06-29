"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserBookingsStore } from '@/store/userBookingsStore';
import Image from 'next/image';
import Link from 'next/link';
import DoctorAttachedFiles, { DoctorAttachedFile } from '@/components/patient/DoctorAttachedFiles';
import { getDoctorAttachedFiles } from '@/services/doctorFilesService';
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
  const [attachedFiles, setAttachedFiles] = useState<DoctorAttachedFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  
  // Swipe navigation state
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  
  useEffect(() => {
    fetchBookingById(params.id);
  }, [fetchBookingById, params.id]);

  // Fetch attached files for completed appointments
  useEffect(() => {
    const loadAttachedFiles = async () => {
      if (selectedBooking && !isFutureDate(selectedBooking.date) && selectedBooking.status === 'completed') {
        setFilesLoading(true);
        try {
          const files = await getDoctorAttachedFiles(selectedBooking.id);
          setAttachedFiles(files);
        } catch (error) {
          console.error('Error loading attached files:', error);
          // Graceful fallback: keep empty array
        } finally {
          setFilesLoading(false);
        }
      }
    };

    loadAttachedFiles();
  }, [selectedBooking]);


  
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
    <div className="pb-24" style={{ backgroundColor: '#E6F0FA' }}>
      {/* Header */}
      <div className="bg-dark-grey text-white p-6 relative">
        {/* Close button */}
        <button 
          onClick={() => router.push('/bookings')}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
          aria-label="Cerrar detalles"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
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
      <div className="p-4" style={{ backgroundColor: '#E6F0FA' }}>
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
        
        {/* Doctor's Attached Files - Only show for past appointments */}
        {!isFutureDate(selectedBooking.date) && selectedBooking.status === 'completed' && (
          <>
            {filesLoading ? (
              <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                  <span className="text-medium-grey">Cargando archivos del doctor...</span>
                </div>
              </div>
            ) : attachedFiles.length > 0 ? (
              <DoctorAttachedFiles 
                files={attachedFiles}
                appointmentId={selectedBooking.id}
                className="mb-6"
              />
            ) : null}
          </>
        )}
        
        {/* Appointment Recommendations - Only show for future appointments */}
        {isFutureDate(selectedBooking.date) && (
          <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
            <h2 className="font-semibold text-lg mb-3">Recomendaciones para tu Cita</h2>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#3B82F6" strokeWidth="2"/>
                    <path d="M12 6v6l4 2" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-dark-grey text-sm">Llega 10 minutos antes</h3>
                  <p className="text-medium-grey text-xs">Esto te permitirá completar cualquier documentación necesaria.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="14,2 14,8 20,8" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="16" y1="13" x2="8" y2="13" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="16" y1="17" x2="8" y2="17" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-dark-grey text-sm">Lleva exámenes previos</h3>
                  <p className="text-medium-grey text-xs">Trae resultados de laboratorio, radiografías o estudios anteriores.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="9" cy="7" r="4" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-dark-grey text-sm">Documento de identidad</h3>
                  <p className="text-medium-grey text-xs">Asegúrate de llevar tu cédula o documento oficial vigente.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3h18v18H3zM9 9h6v6H9z" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 1v4M15 1v4M1 9h4M19 9h4" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-dark-grey text-sm">Confirma tu asistencia</h3>
                  <p className="text-medium-grey text-xs">Si no puedes asistir, cancela con 24h de anticipación.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Contact doctor / Testimonial section - Different content based on appointment date */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          {isFutureDate(selectedBooking.date) ? (
            // Future appointments - Show rescheduling options
            <>
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
            </>
          ) : (
            // Past appointments - Show testimonial/feedback section
            <>
              <h2 className="font-semibold text-lg mb-3">¿Cómo fue tu experiencia?</h2>
              <p className="text-medium-grey mb-4">
                Tu opinión nos ayuda a mejorar el servicio y ayuda a otros pacientes a tener una mejor experiencia.
              </p>
              
              <div className="flex flex-col space-y-3">
                <button className="bg-amber-50 border border-amber-200 text-amber-800 py-3 px-4 rounded-lg font-medium flex items-center justify-center hover:bg-amber-100 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/>
                  </svg>
                  Calificar al Doctor
                </button>
                
                <button className="bg-blue-50 border border-blue-200 text-blue-800 py-3 px-4 rounded-lg font-medium flex items-center justify-center hover:bg-blue-100 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13 7l-3 3 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Escribir Testimonio
                </button>
                
                <button className="bg-green-50 border border-green-200 text-green-800 py-3 px-4 rounded-lg font-medium flex items-center justify-center hover:bg-green-100 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.17 0 2.29.23 3.31.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Recomendar Doctor
                </button>
              </div>
            </>
          )}
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