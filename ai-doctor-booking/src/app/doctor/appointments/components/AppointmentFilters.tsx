"use client";

import React from 'react';
import { FiFilter, FiCalendar, FiClock, FiUsers } from 'react-icons/fi';

export interface FilterState {
  timeRange: 'today' | 'tomorrow' | 'week' | 'month' | 'all';
  status: 'all' | 'confirmed' | 'pending' | 'completed' | 'cancelled';
  consultationType: 'all' | 'presencial' | 'virtual';
  urgency: 'all' | 'low' | 'medium' | 'high';
}

interface AppointmentFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  appointmentCounts: {
    total: number;
    confirmed: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
}

const AppointmentFilters: React.FC<AppointmentFiltersProps> = ({
  filters,
  onFiltersChange,
  appointmentCounts
}) => {
  const updateFilter = <K extends keyof FilterState>(
    key: K, 
    value: FilterState[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const timeRangeOptions = [
    { value: 'today' as const, label: 'Hoy', icon: FiClock },
    { value: 'tomorrow' as const, label: 'Mañana', icon: FiClock },
    { value: 'week' as const, label: 'Esta Semana', icon: FiCalendar },
    { value: 'month' as const, label: 'Este Mes', icon: FiCalendar },
    { value: 'all' as const, label: 'Todas', icon: FiUsers }
  ];

  const statusOptions = [
    { 
      value: 'all' as const, 
      label: 'Todas', 
      count: appointmentCounts.total,
      color: 'bg-gray-100 text-gray-700'
    },
    { 
      value: 'confirmed' as const, 
      label: 'Confirmadas', 
      count: appointmentCounts.confirmed,
      color: 'bg-green-100 text-green-700'
    },
    { 
      value: 'pending' as const, 
      label: 'Pendientes', 
      count: appointmentCounts.pending,
      color: 'bg-yellow-100 text-yellow-700'
    },
    { 
      value: 'completed' as const, 
      label: 'Completadas', 
      count: appointmentCounts.completed,
      color: 'bg-blue-100 text-blue-700'
    },
    { 
      value: 'cancelled' as const, 
      label: 'Canceladas', 
      count: appointmentCounts.cancelled,
      color: 'bg-red-100 text-red-700'
    }
  ];

  const consultationTypeOptions = [
    { value: 'all' as const, label: 'Todos los tipos' },
    { value: 'presencial' as const, label: 'Presencial' },
    { value: 'virtual' as const, label: 'Virtual' }
  ];

  const urgencyOptions = [
    { value: 'all' as const, label: 'Todas las urgencias' },
    { value: 'low' as const, label: 'Baja', color: 'text-green-600' },
    { value: 'medium' as const, label: 'Media', color: 'text-yellow-600' },
    { value: 'high' as const, label: 'Alta', color: 'text-red-600' }
  ];

  const resetFilters = () => {
    onFiltersChange({
      timeRange: 'all',
      status: 'all',
      consultationType: 'all',
      urgency: 'all'
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== 'all');

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
      {/* Header */}
      <div className="p-6 border-b border-light-grey">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FiFilter className="mr-3 text-primary" size={20} />
            <h3 className="text-lg font-semibold text-dark-grey">Filtros</h3>
          </div>
          
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-sm text-primary hover:text-blue-600 font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Time Range Filter */}
        <div>
          <label className="block text-sm font-medium text-dark-grey mb-3">
            Período de tiempo
          </label>
          <div className="flex flex-wrap gap-2">
            {timeRangeOptions.map(option => {
              const Icon = option.icon;
              const isSelected = filters.timeRange === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => updateFilter('timeRange', option.value)}
                  className={`
                    flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200
                    ${isSelected 
                      ? 'text-white shadow-md' 
                      : 'bg-light-grey text-medium-grey hover:bg-gray-200'
                    }
                  `}
                  style={{ 
                    backgroundColor: isSelected ? '#007AFF' : undefined 
                  }}
                >
                  <Icon className="mr-2" size={16} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-dark-grey mb-3">
            Estado de la cita
          </label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map(option => {
              const isSelected = filters.status === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => updateFilter('status', option.value)}
                  className={`
                    flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 border-2
                    ${isSelected 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-transparent bg-light-grey text-medium-grey hover:border-gray-300'
                    }
                  `}
                >
                  {option.label}
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${option.color}`}>
                    {option.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Consultation Type Filter */}
        <div>
          <label className="block text-sm font-medium text-dark-grey mb-3">
            Tipo de consulta
          </label>
          <div className="flex flex-wrap gap-2">
            {consultationTypeOptions.map(option => {
              const isSelected = filters.consultationType === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => updateFilter('consultationType', option.value)}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-all duration-200
                    ${isSelected 
                      ? 'text-white' 
                      : 'bg-light-grey text-medium-grey hover:bg-gray-200'
                    }
                  `}
                  style={{ 
                    backgroundColor: isSelected ? '#007AFF' : undefined 
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Urgency Filter */}
        <div>
          <label className="block text-sm font-medium text-dark-grey mb-3">
            Nivel de urgencia
          </label>
          <div className="flex flex-wrap gap-2">
            {urgencyOptions.map(option => {
              const isSelected = filters.urgency === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => updateFilter('urgency', option.value)}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-all duration-200
                    ${isSelected 
                      ? 'text-white' 
                      : 'bg-light-grey hover:bg-gray-200'
                    }
                    ${option.color || 'text-medium-grey'}
                  `}
                  style={{ 
                    backgroundColor: isSelected ? '#007AFF' : undefined 
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t border-light-grey">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateFilter('timeRange', 'today')}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
            >
              Solo hoy
            </button>
            <button
              onClick={() => updateFilter('status', 'pending')}
              className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors"
            >
              Solo pendientes
            </button>
            <button
              onClick={() => updateFilter('consultationType', 'virtual')}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              Solo virtuales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentFilters; 