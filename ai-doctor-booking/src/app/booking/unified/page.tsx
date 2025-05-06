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
`;

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
    name: 'Arepa Deal',
    avatarUrl: '/doctors/doctor1.jpg',
    notificationCount: 3
  });
  
  // Paso 1 y 8: Actualizar el estado para manejar la ubicación y búsqueda
  const [location, setLocation] = useState('Ibagué');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [availableLocations, setAvailableLocations] = useState([
    'Bogotá', 'Cali', 'Medellín', 'Pereira', 'Ibagué'
  ]);
  
  // Paso 1: Modificar el estado inicial de las especialidades
  const [specialties, setSpecialties] = useState<Specialty[]>([
    { id: '1', name: 'Neurologist', imageUrl: '/specialties/neurologist.jpg', icon: 'brain', color: '#E53E3E' },
    { id: '2', name: 'Cardiologist', imageUrl: '/specialties/cardiology.jpg', icon: 'heart', color: '#DD6B20' },
    { id: '3', name: 'Orthopedist', imageUrl: '/specialties/orthopedist.jpg', icon: 'bone', color: '#38A169' },
    { id: '4', name: 'Pulmonologist', imageUrl: '/specialties/pulmonologist.jpg', icon: 'lungs', color: '#3182CE' },
    { id: '5', name: 'Dentist', imageUrl: '/specialties/dentist.jpg', icon: 'tooth', color: '#00B5D8' },
    { id: '6', name: 'Dermatologist', imageUrl: '/specialties/dermatologist.jpg', icon: 'skin', color: '#D53F8C' },
    { id: '7', name: 'Ophthalmologist', imageUrl: '/specialties/ophthalmologist.jpg', icon: 'eye', color: '#805AD5' },
    { id: '8', name: 'Pediatrician', imageUrl: '/specialties/pediatrician.jpg', icon: 'baby', color: '#4FD1C5' },
    { id: '9', name: 'Psychiatrist', imageUrl: '/specialties/psychiatrist.jpg', icon: 'mind', color: '#F6AD55' },
  ]);
  
  const [dates, setDates] = useState<Date[]>([]);
  const [defaultDoctors, setDefaultDoctors] = useState<Doctor[]>([
    {
      id: '1',
      name: 'Dr. Vinny Vang',
      specialtyId: '1',
      avatarUrl: '/doctors/doctor1.jpg',
      rating: 4.8,
      experience: '10+ years experienced',
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
      experience: '15+ years experienced',
      availableSlots: [
        { id: '201', time: '11:00', isAvailable: true },
        { id: '202', time: '13:00', isAvailable: true },
        { id: '203', time: '14:00', isAvailable: true },
      ]
    }
  ]);

  // Paso 3: Crear componente de icono médico
  const renderSpecialtyIcon = (icon: string | undefined, isSelected: boolean = false) => {
    // Obtenemos el color correspondiente a la especialidad o usamos un color por defecto
    const specialty = specialties.find(s => s.icon === icon);
    // El color del borde siempre será el de la especialidad
    const color = specialty?.color || '#777777';
    const strokeWidth = isSelected ? "2" : "1.5";
    
    switch (icon) {
      case 'brain':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 19a2 2 0 0 1-2-2v-4l-1-1a2 2 0 0 1 0-3l1-1V6a2 2 0 0 1 2-2h3.93a2 2 0 0 1 1.66.9l.41.59a2 2 0 0 0 1.66.9H16a2 2 0 0 1 2 2v1.5"></path>
            <path d="M12 19v-2.5a2.5 2.5 0 0 1 2.5-2.5A2.5 2.5 0 0 0 17 11.5v-3a2.5 2.5 0 0 1 2.5-2.5h1a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5h-1a2.5 2.5 0 0 0-2.5 2.5v3.5a2 2 0 0 1-2 2Z"></path>
            <path d="M12 13a4 4 0 0 1 0-8"></path>
            <path d="M10 9.5a2.5 2.5 0 0 0 0 5"></path>
          </svg>
        );
      case 'heart':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
            <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.82 2.95 0l1.9-1.9c.2-.2.51-.2.71 0v0c.2.2.2.51 0 .71L12 12.34"></path>
          </svg>
        );
      case 'bone':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6.42v-.06a2.97 2.97 0 0 0-2.97-2.97h-.05a2.97 2.97 0 0 0-2.84 3.75L12 8"></path>
            <path d="M12 16.01V16l.12.87a2.96 2.96 0 0 0 2.86 2.48 2.97 2.97 0 0 0 2.97-2.97v-.11A2.97 2.97 0 0 0 14.9 13.4L12 12l-2.8-1.4a2.97 2.97 0 0 0-3.06-.04 2.97 2.97 0 0 0-.03 5.05l1.4.86"></path>
            <path d="M12 8.02v-.04A2.97 2.97 0 0 0 9.03 5h-.08a2.97 2.97 0 0 0-2.97 2.97v.05a2.97 2.97 0 0 0 1.84 2.76L12 12"></path>
          </svg>
        );
      case 'lungs':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
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
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5.5c-1.5-2-3-2.5-4-2.5-3 0-5 2.5-5 5 0 1.5.5 2 1 3 .2.2.2.5 0 1-1 2 1 3 1 3 1 1 3 1 3-1 0-1 .5-1 1-1s1 0 1 1c0 2 2 2 3 1 0 0 2-1 1-3-.2-.5-.2-.8 0-1 .5-1 1-1.5 1-3 0-2.5-2-5-5-5-1 0-2.5.5-4 2.5Z"></path>
            <path d="M15.5 12.5c-.7 1-1.5 2.3-3.5 2.5-2-.2-2.8-1.5-3.5-2.5"></path>
          </svg>
        );
      case 'skin':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
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
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
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
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
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
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.3 16a4.8 4.8 0 0 0 5.4 0"></path>
            <path d="M7 10c0-1.7 1.3-3 3-3h4c1.7 0 3 1.3 3 3v2c0 1.7-1.3 3-3 3h-4c-1.7 0-3-1.3-3-3v-2z"></path>
            <circle cx="8" cy="12" r="1"></circle>
            <circle cx="16" cy="12" r="1"></circle>
            <path d="M16 7h3a2 2 0 0 1 2 2v1.5"></path>
            <path d="M3 11v-1a2 2 0 0 1 2-2h3"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    // Generate the next 14 days for the date picker
    const generateDates = () => {
      const dateList: Date[] = [];
      const today = new Date();
      
      for (let i = 0; i < 14; i++) {
        const date = new Date();
        date.setDate(today.getDate() + i);
        dateList.push(date);
      }
      
      setDates(dateList);
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
    return date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
  };

  const isSameDay = (date1: Date | null, date2: Date) => {
    if (!date1) return false;
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  };

  // Get current time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      {/* Aplicar estilos CSS para ocultar barras de desplazamiento */}
      <style jsx global>{hideScrollbarCSS}</style>
      
      {/* Profile Header - Replacing the back button and title header */}
      <header className="bg-white p-4 border-b border-light-grey">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-light-grey rounded-full overflow-hidden mr-3">
              <Image 
                src={user.avatarUrl} 
                alt={user.name}
                width={40}
                height={40}
                className="object-cover w-full h-full"
                onError={(e) => {
                  // Aseguramos que no se cree un loop de errores usando una imagen que existe
                  const target = e.target as HTMLImageElement;
                  // Solo cambiamos la imagen una vez para evitar bucles
                  if (!target.src.includes('/doctors/doctor2.jpg')) {
                    target.src = '/doctors/doctor2.jpg';
                  }
                  // Si también hay error con la imagen de respaldo, evitamos más intentos
                  target.onerror = null;
                }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-dark-grey text-sm">{user.name}</h3>
              <p className="text-xs text-medium-grey">{getGreeting()}</p>
            </div>
          </div>
          <div className="relative">
            <button className="w-10 h-10 bg-light-grey rounded-full flex items-center justify-center">
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" 
                  fill="#4B5563"
                />
              </svg>
            </button>
            {user.notificationCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white rounded-full text-xs flex items-center justify-center font-medium">
                {user.notificationCount}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-6 pb-20">
        {/* Paso 2 y 6: Crear el componente de barra de búsqueda y ajustar el estilo del contenedor */}
        <div className="search-bar-container mb-6 mt-2">
          <div className="flex items-center bg-light-grey rounded-full p-1 shadow-sm">
            <div className="location-selector flex items-center pl-3 pr-2 relative">
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M12 12.75C13.6569 12.75 15 11.4069 15 9.75C15 8.09315 13.6569 6.75 12 6.75C10.3431 6.75 9 8.09315 9 9.75C9 11.4069 10.3431 12.75 12 12.75Z" 
                  stroke="#4B5563" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M19.5 9.75C19.5 16.5 12 21.75 12 21.75C12 21.75 4.5 16.5 4.5 9.75C4.5 7.76088 5.29018 5.85322 6.6967 4.4467C8.10322 3.04018 10.0109 2.25 12 2.25C13.9891 2.25 15.8968 3.04018 17.3033 4.4467C18.7098 5.85322 19.5 7.76088 19.5 9.75Z" 
                  stroke="#4B5563" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              <button 
                className="text-dark-grey text-sm font-medium ml-2 flex items-center"
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              >
                {location} <span className="ml-1">▼</span>
              </button>
              
              {/* Paso 4: Agregar el dropdown de ubicaciones */}
              {showLocationDropdown && (
                <div className="location-dropdown absolute top-full left-0 mt-2 bg-white rounded-lg shadow-md z-10 w-48">
                  {availableLocations.map((loc, index) => (
                    <button 
                      key={index}
                      onClick={() => handleLocationSelect(loc)}
                      className="block w-full text-left px-4 py-2 text-sm text-dark-grey hover:bg-light-grey"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="h-6 w-px bg-medium-grey opacity-20 mx-1"></div>
            
            <div className="search-input flex items-center flex-1 pl-2 pr-3">
              <input 
                type="text" 
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-transparent w-full text-dark-grey text-sm focus:outline-none"
              />
              <button className="ml-2" onClick={handleSearch}>
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle 
                    cx="11" 
                    cy="11" 
                    r="8" 
                    stroke="#4B5563" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M21 21L16.65 16.65" 
                    stroke="#4B5563" 
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
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-base">Specialty</h2>
            <span className="text-primary text-sm font-medium">See all</span>
          </div>
          
          {/* Paso 4 y 5: Modificar el componente de tarjeta de especialidad y ajustar los estilos específicos */}
          <div className={`${scrollbarHideStyle} gap-3 pb-4 -mx-4 px-4`}>
            {specialties.map((specialty) => (
              <div 
                key={specialty.id} 
                className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 bg-white rounded-2xl shadow-sm p-2 transition-all duration-200"
                style={{
                  backgroundColor: selectedSpecialty?.id === specialty.id 
                    ? `${specialty.color}10` 
                    : 'white',
                  border: selectedSpecialty?.id === specialty.id 
                    ? `2px solid ${specialty.color}` 
                    : '1px solid #f3f4f6',
                }}
                onClick={() => handleSpecialtySelect(specialty)}
              >
                <div className="flex items-center justify-center mb-2">
                  {renderSpecialtyIcon(specialty.icon, selectedSpecialty?.id === specialty.id)}
                </div>
                <div className="text-sm text-dark-grey font-medium text-center">
                  {specialty.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Date Selection Card */}
        <div className="mb-6">
          <h2 className="font-semibold text-base mb-3">Date</h2>
          
          <div className={`${scrollbarHideStyle} gap-3 pb-4 -mx-4 px-4`}>
            {dates.map((date, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center gap-2 cursor-pointer"
                onClick={() => handleDateSelect(date)}
              >
                <div className="text-xs text-medium-grey">
                  {formatDay(date)}
                </div>
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                    isSameDay(selectedDate, date) 
                      ? 'bg-primary text-white' 
                      : 'bg-light-grey text-dark-grey'
                  }`}
                >
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor Selection Card with Time Slots */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-base">Doctors</h2>
            <span className="text-primary text-sm font-medium">See all</span>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-500 rounded-lg mb-4">
              {error}
              <button 
                className="ml-2 underline"
                onClick={clearError}
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className={`${scrollbarHideStyle} gap-4 pb-4 -mx-4 px-4`}>
              {(doctors.length > 0 ? doctors : defaultDoctors).map((doctor) => (
                <div 
                  key={doctor.id} 
                  className={`flex-shrink-0 w-[300px] p-4 bg-white rounded-xl shadow-sm transition-transform ${
                    selectedDoctor?.id === doctor.id ? 'border-2 border-primary ring-2 ring-primary/20' : ''
                  }`}
                  onClick={() => handleDoctorSelect(doctor)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-light-grey rounded-full flex-shrink-0 overflow-hidden">
                      {doctor.avatarUrl && (
                        <Image 
                          src={doctor.avatarUrl} 
                          alt={doctor.name}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-dark-grey text-base">{doctor.name}</h3>
                      <div className="flex items-center text-sm text-medium-grey">
                        <span className="text-amber-400 mr-1">★</span>
                        <span>{doctor.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-medium-grey mb-2">{doctor.experience}</p>
                  
                  {/* Time Slots in the same card */}
                  <div className="flex flex-wrap gap-2">
                    {doctor.availableSlots.map((slot: TimeSlot) => (
                      <button
                        key={slot.id}
                        className={`py-2 px-3 rounded-lg text-sm font-medium ${
                          selectedDoctor?.id === doctor.id && selectedSlot?.id === slot.id 
                            ? 'bg-primary text-white' 
                            : 'bg-light-grey text-dark-grey'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDoctorSelect(doctor);
                          handleSlotSelect(slot);
                        }}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking Confirmation Button */}
        <button 
          className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center ${
            selectedSpecialty && selectedDate && selectedDoctor && selectedSlot
              ? 'bg-primary text-white' 
              : 'bg-light-grey text-medium-grey cursor-not-allowed'
          }`}
          onClick={handleBookAppointment}
          disabled={!selectedSpecialty || !selectedDate || !selectedDoctor || !selectedSlot}
        >
          Book Appointment <span className="ml-2">›</span>
        </button>
      </div>
    </>
  );
};

export default UnifiedBookingView; 