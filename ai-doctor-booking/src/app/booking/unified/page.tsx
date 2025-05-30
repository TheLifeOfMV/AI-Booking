'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useBookingStore } from '../../../store/bookingStore';
import { Doctor, Specialty, TimeSlot } from '../../../types/booking';

// Estilo global para ocultar barras de desplazamiento en secciones de scroll horizontal
const scrollbarHideStyle = "flex scrollbar-hide overflow-x-auto";

// Estilo CSS en línea para ocultar barras de desplazamiento en diferentes navegadores
const hideScrollbarCSS = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  
  /* Ocultar líneas divisorias y bordes en los carousels */
  .carousel-container {
    -webkit-overflow-scrolling: touch;
    overflow-x: auto;
    scrollbar-width: none;
    scroll-behavior: smooth;
    border: none;
    outline: none;
  }
  .carousel-container::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
  .carousel-container * {
    -webkit-tap-highlight-color: transparent;
  }
  .no-scrollbar-line {
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
  }
  
  /* Solución definitiva para eliminar espacio en blanco durante scroll */
  html {
    background-color: #F0F4F9 !important;
    margin: 0 !important;
    padding: 0 !important;
    height: 100% !important;
  }
  
  body {
    background-color: #F0F4F9 !important;
    margin: 0 !important;
    padding: 0 !important;
    min-height: 100vh !important;
    height: 100% !important;
    overflow-x: hidden;
  }
  
  #__next {
    background-color: #F0F4F9 !important;
    min-height: 100vh !important;
  }
  
  /* Asegurar que el contenedor principal mantenga el fondo durante scroll */
  .min-h-screen {
    background-color: #F0F4F9 !important;
    position: relative;
  }
  
  /* Prevenir cualquier espacio en blanco en ios safari */
  @supports (-webkit-touch-callout: none) {
    html, body {
      height: -webkit-fill-available !important;
    }
    
    .min-h-screen {
      min-height: -webkit-fill-available !important;
    }
  }
`;

// Función auxiliar para convertir un color hex a rgba con transparencia
const hexToRgba = (hex: string, alpha: number = 0.1) => {
  let r = 0, g = 0, b = 0;
  
  // Eliminar el # si existe
  if (hex.startsWith('#')) {
    hex = hex.slice(1);
  }
  
  // Convertir hex a rgb
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  }
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const UnifiedBookingView = () => {
  const router = useRouter();
  const { 
    selectedSpecialty, 
    setSelectedSpecialty,
    selectedDate, 
    setSelectedDate,
    selectedDoctor,
    setSelectedDoctor,
    selectedSlot,
    setSelectedSlot,
    doctors,
    fetchDoctorsBySpecialtyAndDate,
    isLoading,
    error,
    clearError,
    createDraftBooking
  } = useBookingStore();
  
  // User profile data
  const [user, setUser] = useState({
    name: 'María',
    notificationCount: 3
  });
  
  // Swipe navigation state
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  
  // Paso 1 y 8: Actualizar el estado para manejar la ubicación y búsqueda
  const [location, setLocation] = useState('Ibagué');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [availableLocations, setAvailableLocations] = useState([
    'Bogotá', 'Cali', 'Medellín', 'Pereira', 'Ibagué'
  ]);
  
  // Estado para el modal de todos los doctores
  const [showAllDoctors, setShowAllDoctors] = useState(false);
  const [doctorSearchQuery, setDoctorSearchQuery] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  
  // Add this state for the doctor details modal and check URL for showDoctorModal param
  const [showDoctorDetails, setShowDoctorDetails] = useState(false);
  const [selectedDoctorDetails, setSelectedDoctorDetails] = useState<Doctor | null>(null);
  // Add state for appointment reason selection
  const [appointmentReason, setAppointmentReason] = useState<string | null>(null);

  // Check URL params when component mounts to see if we should show doctor modal
  useEffect(() => {
    // Check if the URL has a showDoctorModal query param
    const urlParams = new URLSearchParams(window.location.search);
    const shouldShowModal = urlParams.get('showDoctorModal') === 'true';
    
    // If we have the param and a selected doctor, show the modal
    if (shouldShowModal && selectedDoctor) {
      setSelectedDoctorDetails(selectedDoctor);
      setShowDoctorDetails(true);
      
      // Clean up the URL by removing the query param
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [selectedDoctor]);

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
  
  // Paso 1: Modificar el estado inicial de las especialidades
  const [specialties, setSpecialties] = useState<Specialty[]>([
    { id: '1', name: 'Neurología', imageUrl: '/doctors/neurologist.jpg', icon: 'brain', color: '#E53E3E' },
    { id: '2', name: 'Cardiología', imageUrl: '/doctors/cardiologist.jpg', icon: 'heart', color: '#DD6B20' },
    { id: '3', name: 'Ortopedia', imageUrl: '/doctors/orthopedist.jpg', icon: 'bone', color: '#38A169' },
    { id: '4', name: 'Neumología', imageUrl: '/doctors/pulmonologist.jpg', icon: 'lungs', color: '#3182CE' },
    { id: '5', name: 'Odontología', imageUrl: '/doctors/dentist.jpg', icon: 'tooth', color: '#00B5D8' },
    { id: '6', name: 'Dermatología', imageUrl: '/doctors/dermatologist.jpg', icon: 'skin', color: '#D53F8C' },
    { id: '7', name: 'Oftalmología', imageUrl: '/doctors/ophthalmologist.jpg', icon: 'eye', color: '#805AD5' },
    { id: '8', name: 'Pediatría', imageUrl: '/doctors/pediatrician.jpg', icon: 'baby', color: '#4FD1C5' },
    { id: '9', name: 'Psiquiatría', imageUrl: '/doctors/psychiatrist.jpg', icon: 'mind', color: '#F6AD55' },
    // Nuevas especialidades
    { id: '10', name: 'Urología', imageUrl: '/doctors/urologist.jpg', icon: 'kidney', color: '#4299E1' },
    { id: '11', name: 'Psicología', imageUrl: '/doctors/psychologist.jpg', icon: 'psychology', color: '#9F7AEA' },
    { id: '12', name: 'Hematología', imageUrl: '/doctors/hematologist.jpg', icon: 'blood', color: '#E53E3E' },
    { id: '13', name: 'Ginecología', imageUrl: '/doctors/gynecologist.jpg', icon: 'female', color: '#ED64A6' },
    { id: '14', name: 'Cirugía Plástica', imageUrl: '/doctors/plastic-surgeon.jpg', icon: 'scalpel', color: '#667EEA' },
    { id: '15', name: 'Cirugía General', imageUrl: '/doctors/surgeon.jpg', icon: 'surgery', color: '#48BB78' },
    { id: '16', name: 'Fisioterapia', imageUrl: '/doctors/physiotherapist.jpg', icon: 'physio', color: '#38B2AC' },
    { id: '17', name: 'Oncología', imageUrl: '/doctors/oncologist.jpg', icon: 'cell', color: '#9B2C2C' },
  ]);
  
  const [dates, setDates] = useState<Date[]>([]);
  const [defaultDoctors, setDefaultDoctors] = useState<Doctor[]>([
    {
      id: '1',
      name: 'Dr. Vinny Vang',
      specialtyId: '1',
      avatarUrl: '/doctors/doctor1.jpg',
      rating: 4.8,
      experience: '10+ años de experiencia',
      availableSlots: [
        { id: '101', time: '8:00', isAvailable: true },
        { id: '102', time: '9:00', isAvailable: true },
        { id: '103', time: '10:00', isAvailable: true },
      ]
    },
    {
      id: '2',
      name: 'Dr. Eleanor Padilla',
      specialtyId: '2',
      avatarUrl: '/doctors/doctor2.jpg',
      rating: 4.9,
      experience: '15+ años de experiencia',
      availableSlots: [
        { id: '201', time: '11:00', isAvailable: true },
        { id: '202', time: '13:00', isAvailable: true },
        { id: '203', time: '14:00', isAvailable: true },
      ]
    },
    {
      id: '3',
      name: 'Dr. James Rodriguez',
      specialtyId: '1',
      avatarUrl: '/doctors/doctor3.jpg',
      rating: 4.7,
      experience: '8+ años de experiencia',
      availableSlots: [
        { id: '301', time: '9:00', isAvailable: true },
        { id: '302', time: '10:00', isAvailable: true },
        { id: '303', time: '15:00', isAvailable: true },
      ]
    },
    {
      id: '4',
      name: 'Dra. Sofia Chen',
      specialtyId: '3',
      avatarUrl: '/doctors/doctor4.jpg',
      rating: 4.9,
      experience: '12+ años de experiencia',
      availableSlots: [
        { id: '401', time: '8:30', isAvailable: true },
        { id: '402', time: '14:30', isAvailable: true },
      ]
    },
    {
      id: '5',
      name: 'Dr. Michael Patel',
      specialtyId: '4',
      avatarUrl: '/doctors/doctor5.jpg',
      rating: 4.6,
      experience: '7+ años de experiencia',
      availableSlots: [
        { id: '501', time: '11:30', isAvailable: true },
        { id: '502', time: '16:00', isAvailable: true },
      ]
    },
    {
      id: '6',
      name: 'Dra. Camila Rojas',
      specialtyId: '5',
      avatarUrl: '/doctors/doctor6.jpg',
      rating: 4.8,
      experience: '9+ años de experiencia',
      availableSlots: [
        { id: '601', time: '10:30', isAvailable: true },
        { id: '602', time: '15:30', isAvailable: true },
      ]
    },
    {
      id: '7',
      name: 'Dr. David Kim',
      specialtyId: '6',
      avatarUrl: '/doctors/doctor7.jpg',
      rating: 4.7,
      experience: '11+ años de experiencia',
      availableSlots: [
        { id: '701', time: '9:30', isAvailable: true },
        { id: '702', time: '13:30', isAvailable: true },
      ]
    },
    {
      id: '8',
      name: 'Dra. Lucia Martinez',
      specialtyId: '7',
      avatarUrl: '/doctors/doctor8.jpg',
      rating: 4.9,
      experience: '14+ años de experiencia',
      availableSlots: [
        { id: '801', time: '8:15', isAvailable: true },
        { id: '802', time: '12:00', isAvailable: true },
      ]
    }
  ]);

  // Paso 3: Crear componente de icono médico
  const renderSpecialtyIcon = (icon: string | undefined, isSelected: boolean = false, size: number = 36) => {
    const specialty = specialties.find(s => s.icon === icon);
    const color = specialty?.color || '#777777';
    const strokeWidth = isSelected ? "2" : "1.5";
    
    switch (icon) {
      case 'brain':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 19a2 2 0 0 1-2-2v-4l-1-1a2 2 0 0 1 0-3l1-1V6a2 2 0 0 1 2-2h3.93a2 2 0 0 1 1.66.9l.41.59a2 2 0 0 0 1.66.9H16a2 2 0 0 1 2 2v1.5"></path>
            <path d="M12 19v-2.5a2.5 2.5 0 0 1 2.5-2.5A2.5 2.5 0 0 0 17 11.5v-3a2.5 2.5 0 0 1 2.5-2.5h1a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5h-1a2.5 2.5 0 0 0-2.5 2.5v3.5a2 2 0 0 1-2 2Z"></path>
            <path d="M12 13a4 4 0 0 1 0-8"></path>
            <path d="M10 9.5a2.5 2.5 0 0 0 0 5"></path>
          </svg>
        );
      case 'heart':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
            <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.82 2.95 0l1.9-1.9c.2-.2.51-.2.71 0v0c.2.2.2.51 0 .71L12 12.34"></path>
          </svg>
        );
      case 'bone':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6.42v-.06a2.97 2.97 0 0 0-2.97-2.97h-.05a2.97 2.97 0 0 0-2.84 3.75L12 8"></path>
            <path d="M12 16.01V16l.12.87a2.96 2.96 0 0 0 2.86 2.48 2.97 2.97 0 0 0 2.97-2.97v-.11A2.97 2.97 0 0 0 14.9 13.4L12 12l-2.8-1.4a2.97 2.97 0 0 0-3.06-.04 2.97 2.97 0 0 0-.03 5.05l1.4.86"></path>
            <path d="M12 8.02v-.04A2.97 2.97 0 0 0 9.03 5h-.08a2.97 2.97 0 0 0-2.97 2.97v.05a2.97 2.97 0 0 0 1.84 2.76L12 12"></path>
          </svg>
        );
      case 'lungs':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.5 6a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0Z"></path>
            <path d="M18.5 7c0-1-1-2-3-2s-2.9 1-2.9 2c.1 2 .9 3 1.9 3 .9 0 1.6-.8 1.9-2"></path>
            <path d="M10.5 7c0-1-1-2-3-2s-3 1-3 2c.1 2 .9 3 1.9 3 1 0 1.6-.8 1.9-2"></path>
            <path d="M12 12V4"></path>
            <path d="M8 21c-4-1-4-4-4-10"></path>
            <path d="M16 21c4-1 4-4 4-10"></path>
          </svg>
        );
      case 'tooth':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5.5c-1.5-2-3-2.5-4-2.5-3 0-5 2.5-5 5 0 1.5.5 2 1 3 .2.2.2.5 0 1-1 2 1 3 1 3 1 1 3 1 3-1 0-1 .5-1 1-1s1 0 1 1c0 2 2 2 3 1 0 0 2-1 1-3-.2-.5-.2-.8 0-1 .5-1 1-1.5 1-3 0-2.5-2-5-5-5-1 0-2.5.5-4 2.5Z"></path>
            <path d="M15.5 12.5c-.7 1-1.5 2.3-3.5 2.5-2-.2-2.8-1.5-3.5-2.5"></path>
          </svg>
        );
      case 'skin':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5Z"></path>
            <path d="m8 9 3 3 5-5"></path>
            <path d="M16 14v2.5"></path>
            <path d="M14 17.5v-1"></path>
            <path d="M10 13v-2.5"></path>
            <path d="M7 10.5v1"></path>
          </svg>
        );
      case 'eye':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 9v0"></path>
            <path d="M12 15v0"></path>
            <path d="M9 12h0"></path>
            <path d="M15 12h0"></path>
          </svg>
        );
      case 'baby':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12h0"></path>
            <path d="M15 12h0"></path>
            <path d="M10 16c0 1.1.9 2 2 2s2-.9 2-2"></path>
            <path d="M17 9a5 5 0 0 0-10 0"></path>
            <path d="M12 3c.6 0 1.1.2 1.5.5"></path>
            <path d="M12 3v2"></path>
            <path d="m8 18-2 3"></path>
            <path d="m16 18 2 3"></path>
            <path d="M12 20v-6"></path>
          </svg>
        );
      case 'mind':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.3 16a4.8 4.8 0 0 0 5.4 0"></path>
            <path d="M7 10c0-1.7 1.3-3 3-3h4c1.7 0 3 1.3 3 3v2c0 1.7-1.3 3-3 3h-4c-1.7 0-3-1.3-3-3v-2z"></path>
            <circle cx="8" cy="12" r="1"></circle>
            <circle cx="16" cy="12" r="1"></circle>
            <path d="M16 7h3a2 2 0 0 1 2 2v1.5"></path>
            <path d="M3 11v-1a2 2 0 0 1 2-2h3"></path>
          </svg>
        );
      case 'kidney':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 12c-2-3-3-4.5-3-6.5a3 3 0 0 1 6 0c0 2-1 3.5-3 6.5z"/>
            <path d="M12 12c2-3 3-4.5 3-6.5a3 3 0 0 0-6 0c0 2 1 3.5 3 6.5z"/>
          </svg>
        );
      case 'psychology':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a5 5 0 0 1 5 5v2a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z"/>
            <path d="M8 14h8"/>
            <path d="M8 17h8"/>
            <path d="M12 14v7"/>
          </svg>
        );
      case 'blood':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            <path d="M12 8v8"/>
            <path d="M8 12h8"/>
          </svg>
        );
      case 'female':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="6"/>
            <path d="M12 14v7"/>
            <path d="M9 18h6"/>
          </svg>
        );
      case 'scalpel':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 4L8.5 15.5"/>
            <path d="M4 20l3.5-3.5"/>
            <path d="M8.5 15.5L4 20"/>
            <path d="M16 8l-4 4"/>
          </svg>
        );
      case 'surgery':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2"/>
            <path d="M9 8h6"/>
            <path d="M12 8v6"/>
            <path d="M8 16h8"/>
          </svg>
        );
      case 'physio':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 6a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2a2 2 0 0 1 2 2z"/>
            <path d="M12 8v8"/>
            <path d="M8 12l4 4 4-4"/>
          </svg>
        );
      case 'cell':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="8"/>
            <path d="M12 4v16"/>
            <path d="M4 12h16"/>
            <path d="M7 7l10 10"/>
            <path d="M7 17L17 7"/>
          </svg>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    // Generate dates for the calendar view
    const generateDates = () => {
      const today = new Date();
      const nextTwoWeeks = Array.from({ length: 14 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        return date;
      });
      setDates(nextTwoWeeks);
      
      // Generate all dates for the year for the modal
      const allYearDates = generateDatesForYear();
      setYearDates(allYearDates);
    };

    generateDates();
  }, []);

  // When specialty and date are selected, fetch doctors
  useEffect(() => {
    if (selectedSpecialty && selectedDate) {
      fetchDoctorsBySpecialtyAndDate(selectedSpecialty.id, selectedDate);
    }
  }, [selectedSpecialty, selectedDate, fetchDoctorsBySpecialtyAndDate]);

  const handleSpecialtySelect = (specialty: Specialty) => {
    setSelectedSpecialty(specialty);
    // Reset doctor and slot selection when specialty changes
    if (selectedSpecialty?.id !== specialty.id) {
      setSelectedDoctor(null as any);
      setSelectedSlot(null as any);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Reset doctor and slot selection when date changes
    setSelectedDoctor(null as any);
    setSelectedSlot(null as any);
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedSlot(null as any);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleBookAppointment = () => {
    if (selectedSpecialty && selectedDate && selectedDoctor && selectedSlot) {
      createDraftBooking();
      router.push('/booking/confirm');
    }
  };

  // Paso 3: Implementar la lógica para el selector de ubicación
  const handleLocationSelect = (loc: string) => {
    setLocation(loc);
    setShowLocationDropdown(false);
  };

  // Paso 5: Implementar la lógica de búsqueda
  const handleSearch = () => {
    // Aquí iría la lógica para filtrar médicos y especialidades según searchQuery
    console.log(`Buscando: ${searchQuery} en ${location}`);
    // Implementación futura: Filtrar médicos basados en la búsqueda y ubicación
  };

  // Paso 7: Agregar funcionalidad para búsqueda con Enter
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDay = (date: Date) => {
    return date.toLocaleDateString('es-ES', { weekday: 'short' }).charAt(0);
  };

  const isSameDay = (date1: Date | null, date2: Date) => {
    if (!date1) return false;
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  };

  // Add this near other useState declarations
  const [showAllSpecialties, setShowAllSpecialties] = useState(false);

  // Add this near other useEffect declarations
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showAllSpecialties) {
        setShowAllSpecialties(false);
      }
    };

    if (showAllSpecialties) {
      document.body.classList.add('modal-open');
      document.addEventListener('keydown', handleEscapeKey);
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showAllSpecialties]);

  // Add these states near other useState declarations
  const [showAllDates, setShowAllDates] = useState(false);
  const [yearDates, setYearDates] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Add these helper functions
  const generateDatesForYear = () => {
    const dateList: Date[] = [];
    const today = new Date();
    const endOfYear = new Date(today.getFullYear(), 11, 31); // December 31st

    for (let d = new Date(today); d <= endOfYear; d.setDate(d.getDate() + 1)) {
      dateList.push(new Date(d));
    }
    
    return dateList;
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleString('es-ES', { month: 'long' });
  };

  const groupDatesByMonth = (dates: Date[]) => {
    const groups: { [key: string]: Date[] } = {};
    
    dates.forEach(date => {
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(date);
    });
    
    return groups;
  };

  // Add this useEffect for handling escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showAllDates) {
        setShowAllDates(false);
      }
    };

    if (showAllDates) {
      document.body.classList.add('modal-open');
      document.addEventListener('keydown', handleEscapeKey);
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showAllDates]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days: Date[] = [];
    
    // Add days from previous month
    for (let i = startingDay - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push(prevDate);
    }
    
    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    // Add days from next month
    const remainingDays = 42 - days.length; // 6 rows * 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      const prevMonth = new Date(prev);
      prevMonth.setMonth(prev.getMonth() - 1);
      return prevMonth;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const nextMonth = new Date(prev);
      nextMonth.setMonth(prev.getMonth() + 1);
      return nextMonth;
    });
  };

  // Add this function to handle opening the doctor details modal
  const handleDoctorCardClick = (doctor: Doctor) => {
    setSelectedDoctorDetails(doctor);
    setShowDoctorDetails(true);
    // Reset appointment reason when opening a new doctor modal
    setAppointmentReason(null);
  };

  // Inicializar doctores al cargar
  useEffect(() => {
    // Crear una lista completa de doctores de todas las especialidades
    const completeList = [...defaultDoctors];
    if (doctors.length > 0) {
      // Agregar doctores que no estén en la lista por defecto
      doctors.forEach(doctor => {
        if (!completeList.some(d => d.id === doctor.id)) {
          completeList.push(doctor);
        }
      });
    }
    setAllDoctors(completeList);
  }, [doctors, defaultDoctors]);

  // Función para filtrar doctores basado en la búsqueda
  const filterDoctors = (query: string) => {
    if (!query.trim()) {
      setFilteredDoctors(allDoctors);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = allDoctors.filter(doctor => {
      const matchesName = doctor.name.toLowerCase().includes(lowerQuery);
      const specialty = specialties.find(s => s.id === doctor.specialtyId);
      const matchesSpecialty = specialty ? specialty.name.toLowerCase().includes(lowerQuery) : false;
      return matchesName || matchesSpecialty;
    });
    
    setFilteredDoctors(filtered);
  };

  // Efectos para manejar el escape key y filtrar doctores
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showAllDoctors) {
        setShowAllDoctors(false);
      }
    };

    if (showAllDoctors) {
      document.body.classList.add('modal-open');
      document.addEventListener('keydown', handleEscapeKey);
      // Inicializar la lista filtrada con todos los doctores
      setFilteredDoctors(allDoctors);
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showAllDoctors, allDoctors]);

  // Efecto para filtrar doctores cuando cambia la búsqueda
  useEffect(() => {
    filterDoctors(doctorSearchQuery);
  }, [doctorSearchQuery, allDoctors]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F0F4F9' }}>
      {/* Aplicar estilos CSS para ocultar barras de desplazamiento */}
      <style jsx global>{hideScrollbarCSS}</style>
      
      {/* Conversational Header */}
      <header className="p-5 shadow-sm" style={{ backgroundColor: '#F0F4F9' }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-black text-base mb-1">Hola, {user.name} 👋</h3>
            <p className="text-xl font-semibold text-gray-800">¿Cómo te sientes hoy?</p>
          </div>
          <div className="relative">
            <button className="w-11 h-11 flex items-center justify-center bg-white hover:bg-gray-50 rounded-full shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-gray-200">
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-600 hover:text-primary transition-colors duration-200"
              >
                {/* Bell body */}
                <path 
                  d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" 
                  stroke="currentColor" 
                  strokeWidth="1.8" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  fill="none"
                />
                {/* Bell clapper */}
                <path 
                  d="M13.73 21a2 2 0 0 1-3.46 0" 
                  stroke="currentColor" 
                  strokeWidth="1.8" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </button>
            {user.notificationCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-[#007AFF] to-[#0056CC] text-white rounded-full text-xs flex items-center justify-center font-semibold shadow-lg border-2 border-white" style={{fontSize: '0.7rem'}}>
                {user.notificationCount}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-4 pb-4" style={{ backgroundColor: '#F0F4F9' }}>
        {/* Paso 2 y 6: Crear el componente de barra de búsqueda y ajustar el estilo del contenedor */}
        <div className="search-bar-container mb-4 mt-1">
          <div className="flex items-center bg-white rounded-full p-1 shadow-sm">
            <div className="location-selector flex items-center relative">
              {/* Modern Pill-Shaped Location Button */}
              <button 
                className="flex items-center bg-white hover:bg-gray-50 text-dark-grey text-sm font-medium px-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 transition-all duration-200 ease-in-out transform hover:scale-105 shadow-sm hover:shadow-md"
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-1.5 text-primary"
                >
                  <path 
                    d="M12 12.75C13.6569 12.75 15 11.4069 15 9.75C15 8.09315 13.6569 6.75 12 6.75C10.3431 6.75 9 8.09315 9 9.75C9 11.4069 10.3431 12.75 12 12.75Z" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M19.5 9.75C19.5 16.5 12 21.75 12 21.75C12 21.75 4.5 16.5 4.5 9.75C4.5 7.76088 5.29018 5.85322 6.6967 4.4467C8.10322 3.04018 10.0109 2.25 12 2.25C13.9891 2.25 15.8968 3.04018 17.3033 4.4467C18.7098 5.85322 19.5 7.76088 19.5 9.75Z" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="mr-1.5">{location}</span>
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className={`transition-transform duration-200 ${showLocationDropdown ? 'rotate-180' : ''}`}
                >
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              
              {/* Paso 4: Agregar el dropdown de ubicaciones */}
              {showLocationDropdown && (
                <div className="location-dropdown absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 z-10 w-48 overflow-hidden backdrop-blur-sm">
                  {availableLocations.map((loc, index) => (
                    <button 
                      key={index}
                      onClick={() => handleLocationSelect(loc)}
                      className="block w-full text-left px-4 py-3 text-sm text-dark-grey hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-primary transition-all duration-150 border-b border-gray-50 last:border-b-0"
                    >
                      <div className="flex items-center">
                        <svg 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="1.5" 
                          className="mr-3 text-gray-400"
                        >
                          <path d="M12 12.75C13.6569 12.75 15 11.4069 15 9.75C15 8.09315 13.6569 6.75 12 6.75C10.3431 6.75 9 8.09315 9 9.75C9 11.4069 10.3431 12.75 12 12.75Z"/>
                          <path d="M19.5 9.75C19.5 16.5 12 21.75 12 21.75C12 21.75 4.5 16.5 4.5 9.75C4.5 7.76088 5.29018 5.85322 6.6967 4.4467C8.10322 3.04018 10.0109 2.25 12 2.25C13.9891 2.25 15.8968 3.04018 17.3033 4.4467C18.7098 5.85322 19.5 7.76088 19.5 9.75Z"/>
                        </svg>
                        {loc}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Modern Separator - Subtle Dot Instead of Line */}
            <div className="flex items-center justify-center px-3">
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full opacity-40"></div>
            </div>
            
            <div className="search-input flex items-center flex-1 pl-2 pr-3">
              <input 
                type="text" 
                placeholder="Buscar"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-transparent w-full text-dark-grey text-sm focus:outline-none placeholder-gray-400"
              />
              <button className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors duration-150" onClick={handleSearch}>
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-500 hover:text-primary transition-colors"
                >
                  <circle 
                    cx="11" 
                    cy="11" 
                    r="8" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M21 21L16.65 16.65" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      
        {/* Specialty Selection Card */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-base">Categorías</h2>
            <span 
              className="text-primary text-sm font-medium cursor-pointer hover:text-primary/80 transition-colors" 
              onClick={() => setShowAllSpecialties(true)}
            >
              Ver todas
            </span>
          </div>
          
          {/* Specialty Cards */}
          <div className={`${scrollbarHideStyle} gap-4 pb-3 -mx-4 px-4 carousel-container no-scrollbar-line`}>
            {specialties.map((specialty) => (
              <div 
                key={specialty.id} 
                className={`flex-shrink-0 flex flex-col items-center w-28 h-28 rounded-xl p-3 transition-all duration-200 cursor-pointer`}
                style={{
                  backgroundColor: selectedSpecialty?.id === specialty.id && specialty.color
                    ? hexToRgba(specialty.color, 0.05)
                    : 'white',
                  borderColor: selectedSpecialty?.id === specialty.id && specialty.color 
                    ? specialty.color 
                    : 'transparent',
                  borderWidth: selectedSpecialty?.id === specialty.id ? '2px' : '1px',
                  borderStyle: 'solid',
                  boxShadow: selectedSpecialty?.id === specialty.id 
                    ? 'none' 
                    : '0 1px 2px rgba(0, 0, 0, 0.05)'
                }}
                onClick={() => handleSpecialtySelect(specialty)}
              >
                <div 
                  className="flex items-center justify-center mb-2 w-14 h-14 rounded-full overflow-hidden"
                  style={{
                    backgroundColor: 'white' // Fondo siempre blanco para todas las tarjetas
                  }}
                >
                  {specialty.id === '1' ? (
                    // Para Neurología (ID 1), usar la imagen específica de cerebro
                    <div className="scale-125">
                      <Image 
                        src="/specialties/cerebro.png"
                        alt="Neurología"
                        width={56}
                        height={56}
                        className="object-contain"
                      />
                    </div>
                  ) : specialty.id === '2' ? (
                    // Para Cardiología (ID 2), usar la imagen específica de corazón
                    <div className="scale-125">
                      <Image 
                        src="/specialties/corazon.png"
                        alt="Cardiología"
                        width={56}
                        height={56}
                        className="object-contain"
                      />
                    </div>
                  ) : specialty.id === '3' ? (
                    // Para Ortopedia (ID 3), usar la imagen específica de hueso
                    <div className="scale-125">
                      <Image 
                        src="/specialties/ortopedia.png"
                        alt="Ortopedia"
                        width={56}
                        height={56}
                        className="object-contain"
                      />
                    </div>
                  ) : specialty.id === '4' ? (
                    // Para Neumología (ID 4), usar la imagen específica de pulmón
                    <div className="scale-125">
                      <Image 
                        src="/specialties/pulmon.png"
                        alt="Neumología"
                        width={56}
                        height={56}
                        className="object-contain"
                      />
                    </div>
                  ) : specialty.id === '5' ? (
                    // Para Odontología (ID 5), usar la imagen específica de diente
                    <div className="scale-125">
                      <Image 
                        src="/specialties/diente.png"
                        alt="Odontología"
                        width={56}
                        height={56}
                        className="object-contain"
                      />
                    </div>
                  ) : specialty.id === '6' ? (
                    // Para Dermatología (ID 6), usar la imagen específica de piel
                    <div className="scale-125">
                      <Image 
                        src="/specialties/piel.png"
                        alt="Dermatología"
                        width={56}
                        height={56}
                        className="object-contain"
                      />
                    </div>
                  ) : specialty.id === '7' ? (
                    // Para Oftalmología (ID 7), usar la imagen específica de ojo
                    <div className="scale-125">
                      <Image 
                        src="/specialties/ojo.png"
                        alt="Oftalmología"
                        width={56}
                        height={56}
                        className="object-contain"
                      />
                    </div>
                  ) : specialty.id === '8' ? (
                    // Para Pediatría (ID 8), usar la imagen específica de osito
                    <div className="scale-110">
                      <Image 
                        src="/specialties/osito.png"
                        alt="Pediatría"
                        width={52}
                        height={52}
                        className="object-contain p-0.5"
                      />
                    </div>
                  ) : specialty.id === '9' ? (
                    // Para Psiquiatría (ID 9), usar la imagen específica de cerebro con cruz
                    <div className="scale-110">
                      <Image 
                        src="/specialties/psiquiatria.png"
                        alt="Psiquiatría"
                        width={50}
                        height={50}
                        className="object-contain p-1"
                      />
                    </div>
                  ) : specialty.id === '10' ? (
                    // Para Urología (ID 10), usar la imagen específica de Urología
                    <div className="scale-125">
                      <Image 
                        src="/specialties/Urologia..png"
                        alt="Urología"
                        width={45}
                        height={50}
                        className="object-contain"
                      />
                    </div>
                  ) : specialty.id === '11' ? (
                    // Para Psicología (ID 11), usar la imagen específica de Psicología
                    <div className="scale-125">
                      <Image 
                        src="/specialties/Psicologiaa.png"
                        alt="Psicología"
                        width={45}
                        height={45}
                        className="object-contain"
                      />
                    </div>
                  ) : specialty.id === '12' ? (
                    // Para Hematología (ID 12), usar la imagen específica de Hematología
                    <div className="scale-125">
                      <Image 
                        src="/specialties/Hemato.png"
                        alt="Hematología"
                        width={45}
                        height={45}
                        className="object-contain"
                      />
                    </div>
                  ) : specialty.id === '13' ? (
                    // Para Ginecología (ID 13), usar la imagen específica de útero
                    <div className="scale-125">
                      <Image 
                        src="/specialties/utero.png"
                        alt="Ginecología"
                        width={50}
                        height={50}
                        className="object-contain p-1"
                      />
                    </div>
                  ) : specialty.id === '14' ? (
                    // Para Cirugía Plástica (ID 14), usar la imagen específica de Cirugía Plástica
                    <div className="scale-125">
                      <Image 
                        src="/specialties/C Plastica.png"
                        alt="Cirugía Plástica"
                        width={50}
                        height={50}
                        className="object-contain"
                      />
                    </div>
                  ) : specialty.id === '15' ? (
                    // Para Cirugía General (ID 15), usar la imagen específica de Cirugía General
                    <div className="scale-125">
                      <Image 
                        src="/specialties/Cirugia.png"
                        alt="Cirugía General"
                        width={50}
                        height={50}
                        className="object-contain"
                      />
                    </div>
                  ) : specialty.id === '16' ? (
                    // Para Fisioterapia (ID 16), usar la imagen específica de Fisioterapia
                    <div className="scale-125">
                      <Image 
                        src="/specialties/fisioterapia.png"
                        alt="Fisioterapia"
                        width={36}
                        height={36}
                        className="object-contain"
                      />
                    </div>
                  ) : specialty.id === '17' ? (
                    // Para Oncología (ID 17), usar la imagen específica de Oncología
                    <div className="scale-125">
                      <Image 
                        src="/specialties/oncologia.png"
                        alt="Oncología"
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                  ) : specialty.imageUrl ? (
                    <Image 
                      src={specialty.imageUrl}
                      alt={specialty.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    renderSpecialtyIcon(specialty.icon, selectedSpecialty?.id === specialty.id, 36)
                  )}
                </div>
                <div className="text-sm text-dark-grey font-medium text-center leading-tight">
                  {specialty.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Date Selection Card */}
        <div className="bg-white rounded-2xl p-3 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-base">Fecha</h2>
            <span 
              className="text-primary text-sm font-medium cursor-pointer hover:text-primary/80 transition-colors"
              onClick={() => setShowAllDates(true)}
            >
              Ver todas
            </span>
          </div>
          <div className="relative w-full overflow-hidden">
            <div 
              className={`${scrollbarHideStyle} flex gap-3 pb-2 -mx-4 px-4 snap-x snap-mandatory w-[calc(100%+32px)] carousel-container no-scrollbar-line`} 
              style={{ scrollPaddingLeft: '16px' }}
            >
              {dates.slice(0, 5).map((date, index) => {
                const selected = isSameDay(selectedDate, date);
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-1 cursor-pointer min-w-[52px] flex-shrink-0 snap-start"
                    onClick={() => handleDateSelect(date)}
                  >
                    <div className="text-xs font-medium leading-none" style={{ color: '#777777' }}>
                      {date.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase().charAt(0)}
                    </div>
                    <div
                      className={`w-12 h-[50px] flex flex-col items-center justify-center rounded-xl font-semibold transition-all
                        ${selected
                          ? 'bg-[#007AFF] text-white'
                          : 'bg-white text-[#333333] border border-[#F2F2F2] hover:border-[#007AFF]/20'}
                        shadow-sm`}
                      style={{
                        boxShadow: selected ? '0 2px 8px rgba(0,122,255,0.15)' : '0 1px 2px rgba(0,0,0,0.05)'
                      }}
                    >
                      <span className="text-base leading-none mb-1" style={{fontWeight: 600}}>{date.getDate()}</span>
                      <span className="text-[10px] leading-none opacity-80">
                        {date.toLocaleDateString('es-ES', { month: 'short' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Doctor Selection Card */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <h2 className="font-semibold text-base">Mejores Doctores</h2>
            <span 
              className="text-primary text-sm font-medium cursor-pointer" 
              onClick={() => setShowAllDoctors(true)}
            >
              Ver todos
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-500 rounded-lg">
              {error}
              <button className="ml-2 underline" onClick={clearError}>
                Intentar de nuevo
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 carousel-container no-scrollbar-line">
              <div className="flex gap-3 px-4 min-w-max">
                {(doctors.length > 0 ? doctors : defaultDoctors).map((doctor) => (
                  <div 
                    key={doctor.id} 
                    className="w-[170px] bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer transition-all hover:shadow-md" // Increased width from 130px to 170px
                    onClick={() => handleDoctorCardClick(doctor)}
                  >
                    {/* Doctor Image - Square */}
                    <div className="w-full aspect-square relative overflow-hidden border-2 border-[#E5E7EB] rounded-lg"> {/* Added delineating border */}
                      {doctor.avatarUrl ? (
                        <Image 
                          src={doctor.avatarUrl} 
                          alt={doctor.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-light-grey flex items-center justify-center text-medium-grey text-2xl font-semibold">
                          {doctor.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    
                    {/* Doctor Info */}
                    <div className="p-2 pb-1">
                      <h3 className="font-semibold text-dark-grey text-sm truncate">{doctor.name}</h3>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-primary text-xs">
                          {specialties.find(s => s.id === doctor.specialtyId)?.name || 'Especialista'}
                        </span>
                        {/* Removed rating (puntuación) from main carousel card */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add this before the closing div of the main component */}
      {showAllSpecialties && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAllSpecialties(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto modal-content">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#F2F2F2] flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-xl text-[#333333]">Todas las Especialidades</h2>
              <button 
                onClick={() => setShowAllSpecialties(false)}
                className="p-2 hover:bg-[#F2F2F2] rounded-full transition-colors"
                aria-label="Cerrar modal"
              >
                <svg 
                  width="24" 
                  height="24" 
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
            </div>
            
            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                {specialties.map((specialty) => (
                  <div 
                    key={specialty.id} 
                    className={`flex flex-col items-center p-6 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md bg-white`}
                    style={{
                      backgroundColor: selectedSpecialty?.id === specialty.id && specialty.color
                        ? hexToRgba(specialty.color, 0.05)
                        : 'white',
                      borderColor: selectedSpecialty?.id === specialty.id && specialty.color 
                        ? specialty.color 
                        : '#F2F2F2',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      boxShadow: selectedSpecialty?.id === specialty.id 
                        ? 'none' 
                        : '0 1px 3px rgba(0, 0, 0, 0.05)'
                    }}
                    onClick={() => {
                      handleSpecialtySelect(specialty);
                      setShowAllSpecialties(false);
                    }}
                  >
                    <div 
                      className="flex items-center justify-center mb-4 w-20 h-20 rounded-full overflow-hidden"
                      style={{
                        backgroundColor: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }}
                    >
                      {specialty.id === '1' ? (
                        <div className="scale-125">
                          <Image 
                            src="/specialties/cerebro.png"
                            alt="Neurología"
                            width={80}
                            height={80}
                            className="object-contain"
                          />
                        </div>
                      ) : specialty.id === '2' ? (
                        <div className="scale-125">
                          <Image 
                            src="/specialties/corazon.png"
                            alt="Cardiología"
                            width={80}
                            height={80}
                            className="object-contain"
                          />
                        </div>
                      ) : specialty.id === '3' ? (
                        <div className="scale-125">
                          <Image 
                            src="/specialties/ortopedia.png"
                            alt="Ortopedia"
                            width={80}
                            height={80}
                            className="object-contain"
                          />
                        </div>
                      ) : specialty.id === '4' ? (
                        <div className="scale-125">
                          <Image 
                            src="/specialties/pulmon.png"
                            alt="Neumología"
                            width={80}
                            height={80}
                            className="object-contain"
                          />
                        </div>
                      ) : specialty.id === '5' ? (
                        <div className="scale-125">
                          <Image 
                            src="/specialties/diente.png"
                            alt="Odontología"
                            width={80}
                            height={80}
                            className="object-contain"
                          />
                        </div>
                      ) : specialty.id === '6' ? (
                        <div className="scale-125">
                          <Image 
                            src="/specialties/piel.png"
                            alt="Dermatología"
                            width={80}
                            height={80}
                            className="object-contain"
                          />
                        </div>
                      ) : specialty.id === '7' ? (
                        <div className="scale-125">
                          <Image 
                            src="/specialties/ojo.png"
                            alt="Oftalmología"
                            width={80}
                            height={80}
                            className="object-contain"
                          />
                        </div>
                      ) : specialty.id === '8' ? (
                        <div className="scale-110">
                          <Image 
                            src="/specialties/osito.png"
                            alt="Pediatría"
                            width={74}
                            height={74}
                            className="object-contain p-0.5"
                          />
                        </div>
                      ) : specialty.id === '9' ? (
                        <div className="scale-110">
                          <Image 
                            src="/specialties/psiquiatria.png"
                            alt="Psiquiatría"
                            width={72}
                            height={72}
                            className="object-contain p-1"
                          />
                        </div>
                      ) : specialty.id === '10' ? (
                        <div className="scale-125">
                          <Image 
                            src="/specialties/Urologia..png"
                            alt="Urología"
                            width={65}
                            height={65}
                            className="object-contain"
                          />
                        </div>
                      ) : specialty.id === '11' ? (
                        <div className="scale-125">
                          <Image 
                            src="/specialties/Psicologiaa.png"
                            alt="Psicología"
                            width={70}
                            height={70}
                            className="object-contain"
                          />
                        </div>
                      ) : specialty.id === '12' ? (
                        <div className="scale-125">
                          <Image 
                            src="/specialties/Hemato.png"
                            alt="Hematología"
                            width={70}
                            height={70}
                            className="object-contain"
                          />
                        </div>
                      ) : specialty.id === '13' ? (
                        <div className="scale-125">
                          <Image 
                            src="/specialties/utero.png"
                            alt="Ginecología"
                            width={75}
                            height={75}
                            className="object-contain p-2"
                          />
                        </div>
                      ) : specialty.id === '14' ? (
                        <div className="scale-125">
                          <Image 
                            src="/specialties/C Plastica.png"
                            alt="Cirugía Plástica"
                            width={80}
                            height={80}
                            className="object-contain"
                          />
                        </div>
                      ) : specialty.id === '15' ? (
                        <div className="scale-125">
                          <Image 
                            src="/specialties/Cirugia.png"
                            alt="Cirugía General"
                            width={80}
                            height={80}
                            className="object-contain"
                          />
                        </div>
                      ) : specialty.id === '16' ? (
                        <div className="scale-125">
                          <Image 
                            src="/specialties/fisioterapia.png"
                            alt="Fisioterapia"
                            width={50}
                            height={50}
                            className="object-contain"
                          />
                        </div>
                      ) : specialty.id === '17' ? (
                        <div className="scale-125">
                          <Image 
                            src="/specialties/oncologia.png"
                            alt="Oncología"
                            width={45}
                            height={45}
                            className="object-contain"
                          />
                        </div>
                      ) : specialty.imageUrl ? (
                        <Image 
                          src={specialty.imageUrl}
                          alt={specialty.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        renderSpecialtyIcon(specialty.icon, selectedSpecialty?.id === specialty.id, 48)
                      )}
                    </div>
                    <div className="text-lg text-[#333333] font-medium text-center leading-tight">
                      {specialty.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Modal */}
      {showAllDates && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAllDates(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-md overflow-visible shadow-xl">
            {/* Modal Header */}
            <div className="p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <button 
                  className="text-lg font-semibold text-[#333333] flex items-center gap-2"
                >
                  {selectedDate ? (
                    selectedDate.toLocaleDateString('es-ES', { 
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    }).charAt(0).toUpperCase() + 
                    selectedDate.toLocaleDateString('es-ES', { 
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    }).slice(1)
                  ) : (
                    new Date().toLocaleDateString('es-ES', { 
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    }).charAt(0).toUpperCase() + 
                    new Date().toLocaleDateString('es-ES', { 
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    }).slice(1)
                  )}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button 
                  onClick={() => setShowAllDates(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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
              </div>

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-medium text-[#333333]">
                  {currentMonth.toLocaleDateString('es-ES', { 
                    month: 'long',
                    year: 'numeric'
                  }).charAt(0).toUpperCase() + 
                  currentMonth.toLocaleDateString('es-ES', { 
                    month: 'long',
                    year: 'numeric'
                  }).slice(1)}
                </h3>
                <div className="flex gap-1">
                  <button 
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <button 
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="px-4 pb-4">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 mb-2">
                {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentMonth).map((date, i) => {
                  const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                  const isSelected = selectedDate && isSameDay(date, selectedDate);
                  const isToday = isSameDay(date, new Date());
                  
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        handleDateSelect(date);
                        setShowAllDates(false);
                      }}
                      disabled={!isCurrentMonth}
                      className={`
                        aspect-square p-1 rounded-full flex items-center justify-center text-sm
                        transition-all duration-200
                        ${!isCurrentMonth ? 'text-gray-300' : 'hover:bg-gray-100'}
                        ${isSelected ? 'bg-[#007AFF] text-white hover:bg-[#007AFF]' : ''}
                        ${isToday && !isSelected ? 'border-2 border-[#007AFF] text-[#007AFF]' : ''}
                      `}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Details Modal */}
      {showDoctorDetails && selectedDoctorDetails && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDoctorDetails(false);
            }
          }}
        >
          <div className="rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto modal-content" style={{ backgroundColor: '#F0F4F9' }}>
            {/* Doctor Image Header - Light Gray Background like reference photo */}
            <div className="relative h-60 flex items-center justify-center" style={{ backgroundColor: '#D1D5DB' }}> {/* Changed from #E5E7EB to #D1D5DB for slightly darker gray */}
              {/* Close button */}
              <button 
                onClick={() => setShowDoctorDetails(false)}
                className="absolute top-4 right-4 p-1.5 bg-black/20 hover:bg-black/30 rounded-full transition-colors z-10"
                aria-label="Cerrar modal"
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="black" 
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
              
              {/* Doctor Avatar - No background, only silhouette */}
              <div className="w-48 h-48 rounded-xl overflow-hidden shadow-xl"> {/* Changed from w-40 h-40 to w-48 h-48 for larger photo space */}
                {selectedDoctorDetails.avatarUrl ? (
                  <Image 
                    src={selectedDoctorDetails.avatarUrl} 
                    alt={selectedDoctorDetails.name} 
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white text-dark-grey text-7xl font-semibold rounded-xl"> {/* Changed text-6xl to text-7xl to match larger size */}
                    {selectedDoctorDetails.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            
            {/* Doctor Details Content */}
            <div className="p-6 pt-6"> {/* Changed pt-24 back to pt-6 since avatar is no longer overlapping */}
              {/* Doctor Name and Rating */}
              <div className="text-center mb-4">
                <h2 className="font-semibold text-xl text-dark-grey">{selectedDoctorDetails.name}</h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-primary font-medium text-sm">
                    {specialties.find(s => s.id === selectedDoctorDetails.specialtyId)?.name || 'Especialista'}
                  </span>
                </div>
              </div>
              
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                {/* Experience Section */}
                <div className="bg-white p-3 rounded-lg shadow-sm"> {/* Changed bg-light-grey to bg-white, added shadow-sm */}
                  <h4 className="font-semibold text-sm mb-1">Experiencia</h4>
                  <p className="text-medium-grey text-sm">{selectedDoctorDetails.experience}</p>
                </div>
                
                {/* Address Section */}
                <div className="bg-white p-3 rounded-lg shadow-sm"> {/* Changed bg-light-grey to bg-white, added shadow-sm */}
                  <h4 className="font-semibold text-sm mb-1">Dirección</h4>
                  <p className="text-medium-grey text-sm">Centro Médico</p>
                </div>
              </div>
              
              {/* Available Times Section */}
              <div className="mb-5">
                <h4 className="font-semibold mb-2">Horarios Disponibles</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDoctorDetails.availableSlots.map((slot) => (
                    <button
                      key={slot.id}
                      className={`py-2 px-3 rounded-lg text-sm font-medium ${
                        selectedSlot?.id === slot.id 
                          ? 'bg-primary text-white' 
                          : 'bg-white text-dark-grey shadow-sm' /* Changed bg-light-grey to bg-white, added shadow-sm */
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDoctorSelect(selectedDoctorDetails);
                        handleSlotSelect(slot);
                      }}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Biography Section */}
              <div className="mb-5">
                <h4 className="font-semibold mb-2">Acerca de</h4>
                <p className="text-medium-grey text-sm">
                  Médico especialista con amplia experiencia en el diagnóstico y tratamiento de diversas condiciones. 
                  Enfocado en brindar atención de calidad y personalizada a cada paciente.
                </p>
              </div>
              
              {/* Testimonials Section */}
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Testimonios</h4>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg shadow-sm"> {/* Changed bg-light-grey to bg-white, added shadow-sm */}
                    <div className="flex items-center mb-1">
                      <span className="text-amber-400 mr-1 text-xs">★★★★★</span>
                      <span className="text-sm font-medium ml-1">María G.</span>
                    </div>
                    <p className="text-sm text-medium-grey">
                      Excelente profesional, muy atento y dedicado.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm"> {/* Changed bg-light-grey to bg-white, added shadow-sm */}
                    <div className="flex items-center mb-1">
                      <span className="text-amber-400 mr-1 text-xs">★★★★</span>
                      <span className="text-sm font-medium ml-1">Carlos P.</span>
                    </div>
                    <p className="text-sm text-medium-grey">
                      Muy buen trato y profesionalismo.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Appointment Reason Section */}
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Motivo de la Cita</h4>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    className={`px-2 py-3 rounded-lg text-sm font-medium border flex items-center justify-center ${
                      appointmentReason === 'primera' 
                        ? 'bg-primary text-white border-primary' 
                        : 'bg-white text-dark-grey border-[#F2F2F2] shadow-sm hover:border-primary/30'
                    }`}
                    onClick={() => setAppointmentReason('primera')}
                  >
                    Primera Cita
                  </button>
                  
                  <button
                    className={`px-2 py-3 rounded-lg text-sm font-medium border flex items-center justify-center ${
                      appointmentReason === 'control' 
                        ? 'bg-primary text-white border-primary' 
                        : 'bg-white text-dark-grey border-[#F2F2F2] shadow-sm hover:border-primary/30'
                    }`}
                    onClick={() => setAppointmentReason('control')}
                  >
                    Control
                  </button>
                  
                  <button
                    className={`px-2 py-3 rounded-lg text-sm font-medium border flex items-center justify-center ${
                      appointmentReason === 'urgente' 
                        ? 'bg-primary text-white border-primary' 
                        : 'bg-white text-dark-grey border-[#F2F2F2] shadow-sm hover:border-primary/30'
                    }`}
                    onClick={() => setAppointmentReason('urgente')}
                  >
                    Urgente
                  </button>
                </div>
              </div>
              
              {/* Booking Button */}
              <button 
                className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center ${
                  selectedSlot && appointmentReason
                    ? 'bg-primary text-white' 
                    : 'bg-white text-medium-grey border border-[#F2F2F2] cursor-not-allowed shadow-sm' /* Added shadow-sm */
                }`}
                onClick={() => {
                  if (selectedSlot && appointmentReason) {
                    handleBookAppointment();
                    setShowDoctorDetails(false);
                  }
                }}
                disabled={!selectedSlot || !appointmentReason}
              >
                Reservar Cita <span className="ml-2">›</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Ver Todos los Doctores */}
      {showAllDoctors && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAllDoctors(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto modal-content">
            {/* Modal Header with Search */}
            <div className="p-4 border-b border-[#F2F2F2] sticky top-0 bg-white z-10">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold text-xl text-[#333333]">Todos los Doctores</h2>
                <button 
                  onClick={() => setShowAllDoctors(false)}
                  className="p-2 hover:bg-[#F2F2F2] rounded-full transition-colors"
                  aria-label="Cerrar modal"
                >
                  <svg 
                    width="24" 
                    height="24" 
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
              </div>
              
              {/* Barra de búsqueda para doctores */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-400"
                  >
                    <circle 
                      cx="11" 
                      cy="11" 
                      r="8" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <path 
                      d="M21 21L16.65 16.65" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Buscar doctor o especialidad"
                  value={doctorSearchQuery}
                  onChange={(e) => setDoctorSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Modal Content - Grid de doctores */}
            <div className="p-6">
              {filteredDoctors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No se encontraron doctores con ese criterio de búsqueda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {filteredDoctors.map((doctor) => (
                    <div 
                      key={doctor.id} 
                      className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer transition-all hover:shadow-md border border-[#F2F2F2] flex flex-col"
                      onClick={() => {
                        handleDoctorCardClick(doctor);
                        setShowAllDoctors(false);
                      }}
                    >
                      {/* Doctor Image - Square */}
                      <div className="w-full aspect-square relative overflow-hidden border-2 border-[#E5E7EB] rounded-lg"> {/* Added delineating border */}
                        {doctor.avatarUrl ? (
                          <Image 
                            src={doctor.avatarUrl} 
                            alt={doctor.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-light-grey flex items-center justify-center text-medium-grey text-2xl font-semibold">
                            {doctor.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      
                      {/* Doctor Info */}
                      <div className="p-3 pt-2 pb-2 flex-1 flex flex-col">
                        <h3 className="font-semibold text-dark-grey text-sm truncate w-full text-center mb-1">{doctor.name}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-primary text-xs">
                            {specialties.find(s => s.id === doctor.specialtyId)?.name || 'Especialista'}
                          </span>
                          {/* Removed rating (puntuación) from modal doctor card */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedBookingView; 