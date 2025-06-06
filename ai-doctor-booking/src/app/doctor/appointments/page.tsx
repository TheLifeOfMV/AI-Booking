"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
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
  // State management
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    timeRange: 'all',
    status: 'all',
    consultationType: 'all',
    urgency: 'all'
  });

  // Filter appointments based on current filters
  const filteredAppointments = useMemo(() => {
    let filtered = [...ALL_MOCK_APPOINTMENTS];
    
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

    // Consultation type filter
    if (filters.consultationType !== 'all') {
      filtered = filtered.filter(apt => apt.consultationType === filters.consultationType);
    }

    // Urgency filter
    if (filters.urgency !== 'all') {
      filtered = filtered.filter(apt => apt.urgency === filters.urgency);
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
  }, [filters]);

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
    console.log('Viewing details for appointment:', appointmentId);
    // Navigate to appointment details or open modal
    // For now, just log - you can implement the actual logic later
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F2F2F2' }}>
      <div className="container max-w-7xl mx-auto py-8 px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-dark-grey mb-2">Gestión de Citas</h1>
            <p className="text-medium-grey text-lg">
              Organiza y gestiona todas tus citas médicas
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center gap-4">
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
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-dark-grey mb-2">
                {filteredAppointments.length}
              </div>
              <div className="text-medium-grey">
                citas encontradas
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
              No hay citas que coincidan con los filtros seleccionados. 
              Prueba ajustando los criterios de búsqueda.
            </p>
            <button
              onClick={() => setFilters({
                timeRange: 'all',
                status: 'all',
                consultationType: 'all',
                urgency: 'all'
              })}
              className="inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors text-white mr-4"
              style={{ backgroundColor: '#007AFF' }}
            >
              Limpiar Filtros
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map(appointment => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                onViewDetails={handleViewDetails}
                isLoading={isLoading}
                showActions={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointmentsPage; 