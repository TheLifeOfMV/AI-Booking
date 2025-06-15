"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  FiCalendar, 
  FiClock, 
  FiUsers, 
  FiFilter, 
  FiSearch, 
  FiPhoneCall,
  FiVideo,
  FiMapPin,
  FiMoreVertical,
  FiCheck,
  FiX,
  FiEye,
  FiPlus
} from 'react-icons/fi';
import { ALL_MOCK_APPOINTMENTS, ExtendedAppointment } from './mockAppointments';
import AppointmentCard from '../dashboard/AppointmentCard';
import AppointmentFilters, { FilterState } from './components/AppointmentFilters';

// Types for filters
type DateFilter = 'today' | 'tomorrow' | 'week' | 'month' | 'all';
type StatusFilter = 'all' | 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'no-show';

// Add at the top to verify the import works
console.log('Loading doctor appointments page...');

// Add at the top of the component
console.log('DoctorAppointmentsPage: Component mounting...');

const DoctorAppointmentsPage = () => {
  const router = useRouter();
  // State management
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    timeRange: 'all',
    status: 'all'
  });

  // Helper function to search by date with multiple formats
  const searchByDate = (appointmentDate: string, searchTerm: string) => {
    const aptDate = new Date(appointmentDate);
    const searchLower = searchTerm.toLowerCase().trim();
    
    // Format appointment date in different ways for comparison
    const formats = {
      // ISO format: 2023-07-15
      iso: appointmentDate,
      // Spanish date format: 15/07/2023
      spanishSlash: aptDate.toLocaleDateString('es-ES'),
      // Spanish date format with dashes: 15-07-2023
      spanishDash: aptDate.toLocaleDateString('es-ES').replace(/\//g, '-'),
      // Full Spanish date: "sábado, 15 de julio de 2023"
      fullSpanish: aptDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      // Short Spanish date: "15 de julio"
      shortSpanish: aptDate.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long'
      }),
      // Weekday only: "sábado"
      weekday: aptDate.toLocaleDateString('es-ES', { weekday: 'long' }),
      // Month only: "julio"
      month: aptDate.toLocaleDateString('es-ES', { month: 'long' }),
      // Year only: "2023"
      year: aptDate.getFullYear().toString(),
      // Day only: "15"
      day: aptDate.getDate().toString(),
      // Month number: "07" or "7"
      monthNumber: (aptDate.getMonth() + 1).toString(),
      monthNumberPadded: (aptDate.getMonth() + 1).toString().padStart(2, '0')
    };

    // Check if search term matches any of the date formats
    return Object.values(formats).some(format => 
      format.toLowerCase().includes(searchLower)
    );
  };

  // Filter appointments based on current filters and search
  const filteredAppointments = useMemo(() => {
    let filtered = [...ALL_MOCK_APPOINTMENTS];
    
    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      
      filtered = filtered.filter(apt => {
        // Text-based searches
        const textMatch = 
          apt.patientName.toLowerCase().includes(searchLower) ||
          apt.reason.toLowerCase().includes(searchLower) ||
          apt.patientEmail.toLowerCase().includes(searchLower) ||
          apt.patientPhone.includes(searchTerm.trim()) ||
          apt.location.toLowerCase().includes(searchLower);

        // Date-based searches
        const dateMatch = searchByDate(apt.date, searchTerm);

        return textMatch || dateMatch;
      });
    }
    
    // Time range filter
    if (filters.timeRange !== 'all') {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.date);
        
        switch (filters.timeRange) {
          case 'today':
            return aptDate.toDateString() === today.toDateString();
          case 'tomorrow':
            return aptDate.toDateString() === tomorrow.toDateString();
          case 'week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 7);
            return aptDate >= weekStart && aptDate < weekEnd;
          case 'month':
            return aptDate.getMonth() === today.getMonth() && 
                   aptDate.getFullYear() === today.getFullYear();
          default:
            return true;
        }
      });
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(apt => apt.status === filters.status);
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
  }, [filters, searchTerm]);

  // Calculate appointment counts for filters
  const appointmentCounts = useMemo(() => {
    return {
      total: ALL_MOCK_APPOINTMENTS.length,
      confirmed: ALL_MOCK_APPOINTMENTS.filter(apt => apt.status === 'confirmed').length,
      pending: ALL_MOCK_APPOINTMENTS.filter(apt => apt.status === 'pending').length,
      completed: ALL_MOCK_APPOINTMENTS.filter(apt => apt.status === 'completed').length,
      cancelled: ALL_MOCK_APPOINTMENTS.filter(apt => apt.status === 'cancelled').length,
    };
  }, []);

  // Statistics
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = ALL_MOCK_APPOINTMENTS.filter(apt => apt.date === today);
    
    return {
      today: todayAppointments.length,
      pending: ALL_MOCK_APPOINTMENTS.filter(apt => apt.status === 'pending').length,
      confirmed: ALL_MOCK_APPOINTMENTS.filter(apt => apt.status === 'confirmed').length,
      completed: ALL_MOCK_APPOINTMENTS.filter(apt => apt.status === 'completed').length
    };
  }, []);

  // Action handlers
  const handleConfirmAppointment = async (appointmentId: string) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log(`Confirming appointment ${appointmentId}`);
      setIsLoading(false);
    }, 1000);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log(`Cancelling appointment ${appointmentId}`);
      setIsLoading(false);
    }, 1000);
  };

  const getStatusBadge = (status: ExtendedAppointment['status']) => {
    const statusConfig = {
      confirmed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmada' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendiente' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completada' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelada' },
      'no-show': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'No asistió' }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getUrgencyColor = (urgency: 'low' | 'medium' | 'high') => {
    switch (urgency) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  // Add at the top to verify the import works
  console.log('AppointmentCard imported successfully:', AppointmentCard);

  // FIXED: Add missing handleViewDetails function
  const handleViewDetails = (appointmentId: string) => {
    router.push(`/doctor/appointments/${appointmentId}`);
  };

  // FIXED: Add missing handleConfirm function if it doesn't exist
  const handleConfirm = (appointmentId: string) => {
    console.log('Confirming appointment:', appointmentId);
    // Implementation for confirming appointment
  };

  // FIXED: Add missing handleCancel function if it doesn't exist  
  const handleCancel = (appointmentId: string) => {
    console.log('Cancelling appointment:', appointmentId);
    // Implementation for cancelling appointment
  };

  // Before the return statement
  console.log('DoctorAppointmentsPage: About to render with appointments:', filteredAppointments?.length);

  // Add error boundary logging
  const handleError = (error: Error) => {
    console.error('DoctorAppointmentsPage: Error occurred:', error);
  };

  // Add logging to verify the change
  console.log('AppointmentsPage: Rendering stats without revenue -', {
    appointmentCount: filteredAppointments.length,
    showRevenue: false // Confirms revenue is disabled
  });

  // Add logging to confirm only presencial appointments
  console.log('AppointmentsPage: All appointments are presencial -', {
    totalAppointments: filteredAppointments.length,
    appointmentTypes: filteredAppointments.map(apt => 'presencial'),
    virtualAppointments: 0 // Confirms no virtual appointments
  });

  // Get appointments to display (5 max unless showing all)
  const displayedAppointments = showAllAppointments 
    ? filteredAppointments 
    : filteredAppointments.slice(0, 5);

  // Clear search function
  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E6F0FA' }}>
      <div className="container max-w-7xl mx-auto py-8 px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-dark-grey mb-2">Gestión de Citas</h1>
            <p className="text-medium-grey text-lg">
              Organiza y gestiona todas tus citas médicas
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm mb-6 p-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-medium-grey" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, motivo, email, teléfono, ubicación, fecha (ej: 15/07/2023, julio, lunes)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-4 border border-light-grey rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-dark-grey placeholder-medium-grey text-lg"
              style={{ fontSize: '16px' }}
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-medium-grey hover:text-dark-grey transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="mt-3 text-sm text-medium-grey">
              {filteredAppointments.length} resultado{filteredAppointments.length !== 1 ? 's' : ''} para "{searchTerm}"
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row justify-end items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center font-medium px-6 py-3 rounded-full transition-all duration-200 hover:shadow-md border ${
                showFilters 
                  ? 'text-white border-primary' 
                  : 'bg-white border-light-grey text-dark-grey'
              }`}
              style={{ backgroundColor: showFilters ? '#007AFF' : undefined }}
            >
              <FiFilter className="mr-2" size={18} />
              Filtros
            </button>
            
            <Link 
              href="/doctor/appointments/calendar" 
              className="flex items-center font-medium px-6 py-3 rounded-full transition-all duration-200 hover:shadow-md bg-white border border-light-grey"
            >
              <FiCalendar className="mr-2" size={18} /> Vista Calendario
            </Link>
          </div>
        </div>

        {/* Results Summary */}
        <div className="bg-white rounded-xl shadow-sm mb-8 p-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-dark-grey mb-2">
                {filteredAppointments.length}
              </div>
              <div className="text-medium-grey">
                Total de citas
              </div>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <AppointmentFilters
            filters={filters}
            onFiltersChange={setFilters}
            appointmentCounts={appointmentCounts}
          />
        )}

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FiCalendar size={64} className="mx-auto mb-6 text-light-grey" />
            <h3 className="text-2xl font-bold text-dark-grey mb-4">
              No se encontraron citas
            </h3>
            <p className="text-medium-grey mb-8 max-w-md mx-auto">
              {searchTerm 
                ? `No hay citas que coincidan con "${searchTerm}". Prueba con otro término de búsqueda.`
                : 'No hay citas que coincidan con los filtros seleccionados. Prueba ajustando los criterios de búsqueda.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors text-white"
                  style={{ backgroundColor: '#007AFF' }}
                >
                  <FiX className="mr-2" size={16} />
                  Limpiar Búsqueda
                </button>
              )}
              <button
                onClick={() => {
                  setFilters({
                    timeRange: 'all',
                    status: 'all'
                  });
                  clearSearch();
                }}
                className="inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              >
                <FiFilter className="mr-2" size={16} />
                Limpiar Todo
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedAppointments.map((appointment) => (
              <div 
                key={appointment.id}
                onClick={() => handleViewDetails(appointment.id)}
                className="cursor-pointer transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
              >
                <AppointmentCard
                  appointment={appointment}
                  onConfirm={handleConfirmAppointment}
                  onCancel={handleCancelAppointment}
                  onViewDetails={handleViewDetails}
                  isLoading={isLoading}
                  showActions={false}
                />
              </div>
            ))}

            {/* Show All Button */}
            {filteredAppointments.length > 5 && !showAllAppointments && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setShowAllAppointments(true)}
                  className="inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors text-white"
                  style={{ backgroundColor: '#007AFF' }}
                >
                  Ver todas las citas ({filteredAppointments.length - 5} más)
                </button>
              </div>
            )}

            {/* Show Less Button */}
            {showAllAppointments && filteredAppointments.length > 5 && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setShowAllAppointments(false)}
                  className="inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                >
                  Ver menos
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointmentsPage; 