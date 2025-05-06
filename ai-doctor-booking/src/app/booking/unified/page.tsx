'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useBookingStore } from '../../../store/bookingStore';
import { Doctor, Specialty, TimeSlot } from '../../../types/booking';

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
    avatarUrl: '/profile/avatar.jpg',
    notificationCount: 3
  });
  
  const [specialties, setSpecialties] = useState<Specialty[]>([
    { id: '1', name: 'Oculist', imageUrl: '/specialties/oculist.jpg' },
    { id: '2', name: 'Dentist', imageUrl: '/specialties/dentist.jpg' },
    { id: '3', name: 'GP', imageUrl: '/specialties/gp.jpg' },
    { id: '4', name: 'Cardiologist', imageUrl: '/specialties/cardiology.jpg' },
    { id: '5', name: 'Neurologist', imageUrl: '/specialties/neurology.jpg' },
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
                  // Fallback to placeholder on error
                  const target = e.target as HTMLImageElement;
                  target.src = '/profile/placeholder.jpg';
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
      
        {/* Specialty Selection Card */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Specialty</h2>
            <span className="text-primary text-sm font-medium">See all</span>
          </div>
          
          <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4">
            {specialties.map((specialty) => (
              <div 
                key={specialty.id} 
                className={`flex-shrink-0 w-24 h-24 bg-light-grey rounded-lg overflow-hidden relative cursor-pointer ${
                  selectedSpecialty?.id === specialty.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleSpecialtySelect(specialty)}
              >
                {selectedSpecialty?.id === specialty.id && (
                  <div className="absolute top-2 right-2 bg-primary w-5 h-5 rounded-full flex items-center justify-center text-white text-xs">
                    ✓
                  </div>
                )}
                <div className="bg-black bg-opacity-30 text-white p-2 w-full absolute bottom-0 text-sm font-medium">
                  {specialty.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Date Selection Card */}
        <div className="mb-6">
          <h2 className="font-semibold mb-4">Date</h2>
          
          <div className="flex overflow-x-auto gap-3 pb-4 -mx-4 px-4">
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Doctors</h2>
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
            <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4">
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