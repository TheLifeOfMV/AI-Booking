"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiCalendar, 
  FiList
} from 'react-icons/fi';
import { ALL_MOCK_APPOINTMENTS, ExtendedAppointment } from '../mockAppointments';
import CalendarAppointmentView from '../components/CalendarAppointmentView';

const DoctorCalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [isLoading, setIsLoading] = useState(false);

  // Structured logging for debugging (MONOCODE principle)
  const logCalendarAction = (action: string, data?: any) => {
    console.log(`[Calendar] ${action}:`, { timestamp: new Date().toISOString(), ...data });
  };

  // Get calendar data
  const calendarData = useMemo(() => {
    logCalendarAction('Calculating calendar data', { 
      month: currentDate.getMonth(), 
      year: currentDate.getFullYear() 
    });
    
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
    
    logCalendarAction('Appointments grouped by date', { 
      datesWithAppointments: Object.keys(grouped).length,
      totalAppointments: ALL_MOCK_APPOINTMENTS.length 
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

  const navigateMonth = async (direction: 'prev' | 'next') => {
    setIsLoading(true);
    logCalendarAction('Month navigation', { direction });
    
    // Simulate loading for smooth UX
    await new Promise(resolve => setTimeout(resolve, 100));
    
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
    
    setIsLoading(false);
  };

  const goToToday = () => {
    logCalendarAction('Navigate to today');
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

  const getAppointmentCount = (date: Date): number => {
    const dateKey = formatDateKey(date);
    return appointmentsByDate[dateKey]?.length || 0;
  };

  const getDayAppointments = (date: Date): ExtendedAppointment[] => {
    const dateKey = formatDateKey(date);
    return appointmentsByDate[dateKey] || [];
  };

  const getAppointmentIndicators = (appointments: ExtendedAppointment[]): JSX.Element[] => {
    return appointments.slice(0, 3).map((apt, index) => {
      const statusColors = {
        confirmed: 'bg-emerald-400',
        pending: 'bg-amber-400',
        completed: 'bg-blue-400',
        cancelled: 'bg-gray-400',
        'no-show': 'bg-red-400'
      };

      return (
        <div
          key={index}
          className={`h-1 rounded-full ${statusColors[apt.status]}`}
          title={`${apt.time} - ${apt.patientName} (${apt.status})`}
        />
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-6xl mx-auto py-6 px-4">
        
        {/* Clean Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Calendario de Citas
            </h1>
            <p className="text-gray-600">
              Vista profesional de tu agenda médica
            </p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <Link 
              href="/doctor/appointments" 
              className="flex items-center font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md bg-white border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-600"
            >
              <FiList className="mr-2" size={16} /> 
              Vista Lista
            </Link>
            
            <button
              onClick={goToToday}
              className="flex items-center font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <FiCalendar className="mr-2" size={16} />
              Hoy
            </button>
          </div>
        </div>

        {/* Professional Calendar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          
          {/* Calendar Header */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              
              {/* Month Navigation */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigateMonth('prev')}
                  disabled={isLoading}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <FiChevronLeft size={20} className="text-gray-600" />
                </button>
                
                <h2 className="text-xl font-bold text-gray-900 min-w-[200px] text-center">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                
                <button
                  onClick={() => navigateMonth('next')}
                  disabled={isLoading}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <FiChevronRight size={20} className="text-gray-600" />
                </button>
              </div>

              {/* View Toggle */}
              <div className="flex rounded-lg overflow-hidden border border-gray-200">
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    viewMode === 'month'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Mes
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    viewMode === 'week'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Semana
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-3 mb-4">
              {dayNames.map(day => (
                <div key={day} className="text-center py-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-3">
              {calendarData.days.map((date, index) => {
                const appointmentCount = getAppointmentCount(date);
                const dayAppointments = getDayAppointments(date);
                const isSelected = selectedDate && isSameDate(date, selectedDate);
                
                return (
                  <button
                    key={index}
                    onClick={() => {
                      logCalendarAction('Date selected', { date: date.toISOString() });
                      setSelectedDate(date);
                    }}
                    className={`
                      relative p-3 text-left transition-all duration-200 rounded-xl border h-24 hover:shadow-md
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }
                      ${isCurrentMonth(date) ? 'bg-white' : 'bg-gray-50 opacity-60'}
                      ${isToday(date) ? 'ring-2 ring-blue-400 ring-opacity-30' : ''}
                    `}
                  >
                    {/* Date Number */}
                    <div className={`text-sm font-semibold mb-2 ${
                      isToday(date) 
                        ? 'text-blue-600' 
                        : isCurrentMonth(date) 
                          ? 'text-gray-900' 
                          : 'text-gray-400'
                    }`}>
                      {date.getDate()}
                    </div>

                    {/* Appointment Indicators */}
                    {appointmentCount > 0 && (
                      <div className="space-y-1">
                        {getAppointmentIndicators(dayAppointments)}
                        
                        {appointmentCount > 3 && (
                          <div className="text-xs text-gray-500 font-medium mt-1">
                            +{appointmentCount - 3}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Today indicator */}
                    {isToday(date) && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <div className="mt-6 animate-in slide-in-from-bottom-2 duration-300">
            <CalendarAppointmentView 
              date={selectedDate}
              appointments={getDayAppointments(selectedDate)}
            />
          </div>
        )}

        {/* Simple Legend */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Leyenda de Estados
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <div className="w-4 h-2 bg-emerald-400 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">Confirmadas</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-2 bg-amber-400 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">Pendientes</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-2 bg-blue-400 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">Completadas</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-2 bg-gray-400 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">Canceladas</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DoctorCalendarPage; 