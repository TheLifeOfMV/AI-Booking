'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '../../../store/bookingStore';

const DateSelectionView = () => {
  const router = useRouter();
  const { selectedSpecialty, selectedDate, setSelectedDate } = useBookingStore();
  const [dates, setDates] = useState<Date[]>([]);

  useEffect(() => {
    // If no specialty is selected, redirect back to specialty selection
    if (!selectedSpecialty) {
      router.push('/booking/specialty');
      return;
    }

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
  }, [selectedSpecialty, router]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    router.push('/booking/doctor');
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

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-dark-grey">Select Date</h1>
        {selectedSpecialty && (
          <span className="px-3 py-1 bg-light-grey text-dark-grey rounded-full text-sm">
            {selectedSpecialty.name}
          </span>
        )}
      </div>
      
      <div className="flex overflow-x-auto pb-4 gap-3 -mx-4 px-4">
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
      
      {selectedDate && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Selected Date</h2>
          <p className="text-medium-grey">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          
          <button 
            className="w-full mt-8 bg-primary text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center"
            onClick={() => router.push('/booking/doctor')}
          >
            Continue <span className="ml-2">›</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default DateSelectionView; 