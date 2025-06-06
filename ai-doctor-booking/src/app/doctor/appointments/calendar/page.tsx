"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiCalendar, 
  FiList,
  FiFilter,
  FiPlus
} from 'react-icons/fi';
import { ALL_MOCK_APPOINTMENTS, ExtendedAppointment } from '../mockAppointments';
import CalendarAppointmentView from '../components/CalendarAppointmentView';

const DoctorCalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Get calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month and last day
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get first Monday of calendar (might be from previous month)
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - ((firstDay.getDay() + 6) % 7));
    
    // Get last Sunday of calendar (might be from next month)
    const endDate = new Date(lastDay);
    endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
    
    // Generate all days for calendar
    const days: Date[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return {
      days,
      firstDay,
      lastDay,
      startDate,
      endDate
    };
  }, [currentDate]);

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped: { [key: string]: ExtendedAppointment[] } = {};
    
    ALL_MOCK_APPOINTMENTS.forEach(appointment => {
      const dateKey = appointment.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(appointment);
    });
    
    // Sort appointments by time for each date
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => a.time.localeCompare(b.time));
    });
    
    return grouped;
  }, []);

  const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isSameDate = (date1: Date, date2: Date): boolean => {
    return date1.toDateString() === date2.toDateString();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  const getAppointmentCount = (date: Date): number => {
    const dateKey = formatDateKey(date);
    return appointmentsByDate[dateKey]?.length || 0;
  };

  const getDayAppointments = (date: Date): ExtendedAppointment[] => {
    const dateKey = formatDateKey(date);
    return appointmentsByDate[dateKey] || [];
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F0F4F9' }}>
      <div className="container max-w-7xl mx-auto py-8 px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-dark-grey mb-2">Calendario de Citas</h1>
            <p className="text-medium-grey text-lg">
              Vista calendario de tus citas médicas
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            <Link 
              href="/doctor/appointments" 
              className="flex items-center font-medium px-6 py-3 rounded-full transition-all duration-200 hover:shadow-md bg-white border border-light-grey"
            >
              <FiList className="mr-2" size={18} /> Vista Lista
            </Link>
            
            <button
              onClick={goToToday}
              className="flex items-center font-medium px-6 py-3 rounded-full transition-all duration-200 hover:shadow-md"
              style={{ 
                color: '#007AFF', 
                backgroundColor: 'rgba(0, 122, 255, 0.1)',
              }}
            >
              Hoy
            </button>
          </div>
        </div>

        {/* Calendar Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-light-grey">
            <div className="flex items-center justify-between">
              
              {/* Month Navigation */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-light-grey rounded-lg transition-colors"
                >
                  <FiChevronLeft size={20} className="text-dark-grey" />
                </button>
                
                <h2 className="text-2xl font-bold text-dark-grey min-w-[200px] text-center">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-light-grey rounded-lg transition-colors"
                >
                  <FiChevronRight size={20} className="text-dark-grey" />
                </button>
              </div>

              {/* View Controls */}
              <div className="flex items-center gap-4">
                <div className="flex rounded-lg overflow-hidden border border-light-grey">
                  <button
                    onClick={() => setViewMode('month')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      viewMode === 'month'
                        ? 'text-white'
                        : 'bg-white text-medium-grey hover:bg-light-grey'
                    }`}
                    style={{ backgroundColor: viewMode === 'month' ? '#007AFF' : undefined }}
                  >
                    Mes
                  </button>
                  <button
                    onClick={() => setViewMode('week')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      viewMode === 'week'
                        ? 'text-white'
                        : 'bg-white text-medium-grey hover:bg-light-grey'
                    }`}
                    style={{ backgroundColor: viewMode === 'week' ? '#007AFF' : undefined }}
                  >
                    Semana
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {dayNames.map(day => (
                <div key={day} className="text-center py-3 text-sm font-medium text-medium-grey">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarData.days.map((date, index) => {
                const appointmentCount = getAppointmentCount(date);
                const dayAppointments = getDayAppointments(date);
                const isSelected = selectedDate && isSameDate(date, selectedDate);
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      aspect-square p-2 text-left transition-all duration-200 rounded-lg border-2
                      ${isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-transparent hover:border-primary/30 hover:bg-primary/5'
                      }
                      ${isCurrentMonth(date) ? '' : 'opacity-40'}
                      ${isToday(date) ? 'bg-primary/10' : ''}
                    `}
                  >
                    {/* Date Number */}
                    <div className={`text-sm font-medium mb-1 ${
                      isToday(date) 
                        ? 'text-primary font-bold' 
                        : isCurrentMonth(date) 
                          ? 'text-dark-grey' 
                          : 'text-medium-grey'
                    }`}>
                      {date.getDate()}
                    </div>

                    {/* Appointment Indicators */}
                    {appointmentCount > 0 && (
                      <div className="space-y-1">
                        {dayAppointments.slice(0, 3).map((apt, aptIndex) => (
                          <div
                            key={aptIndex}
                            className={`h-1.5 rounded-full text-xs ${
                              apt.status === 'confirmed' ? 'bg-green-500' :
                              apt.status === 'pending' ? 'bg-yellow-500' :
                              apt.status === 'completed' ? 'bg-blue-500' :
                              'bg-gray-400'
                            }`}
                            title={`${apt.time} - ${apt.patientName}`}
                          />
                        ))}
                        
                        {appointmentCount > 3 && (
                          <div className="text-xs text-medium-grey">
                            +{appointmentCount - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <CalendarAppointmentView 
            date={selectedDate}
            appointments={getDayAppointments(selectedDate)}
          />
        )}

        {/* Calendar Legend */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-dark-grey mb-4">Leyenda</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center">
                <div className="w-4 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-dark-grey">Confirmadas</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm text-dark-grey">Pendientes</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm text-dark-grey">Completadas</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-2 bg-gray-400 rounded-full mr-3"></div>
                <span className="text-sm text-dark-grey">Canceladas</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DoctorCalendarPage; 