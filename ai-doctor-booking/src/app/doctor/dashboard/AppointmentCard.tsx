'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiClock, FiCheck, FiX, FiEye, FiCalendar } from 'react-icons/fi';

interface AppointmentCardProps {
  appointment: {
    id: string;
    patientName: string;
    patientAvatar: string;
    date: string;
    time: string;
    status: 'confirmed' | 'pending' | 'cancelled';
  };
  onConfirm?: (id: string) => void;
  onCancel?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  showActions?: boolean;
  href?: string;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ 
  appointment, 
  onConfirm, 
  onCancel, 
  onViewDetails,
  showActions = false,
  href = `/doctor/appointments/${appointment.id}`
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-800 bg-green-100 border-green-200';
      case 'pending': return 'text-yellow-800 bg-yellow-100 border-yellow-200';
      case 'cancelled': return 'text-red-800 bg-red-100 border-red-200';
      default: return 'text-gray-800 bg-gray-100 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  // If we have action buttons, don't make the card clickable
  if (showActions || onViewDetails) {
    return (
      <div 
        className="bg-white rounded-xl border border-light-grey hover:shadow-lg transition-all duration-300 overflow-hidden group mb-4"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <div className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-light-grey mr-4 flex-shrink-0 ring-2 ring-blue-50">
                <Image 
                  src={appointment.patientAvatar} 
                  alt={appointment.patientName}
                  width={56}
                  height={56}
                  className="object-cover"
                />
              </div>
              
              <div className="min-w-0">
                <h3 className="font-bold text-dark-grey text-xl mb-2">{appointment.patientName}</h3>
                
                {/* Date and Time Info */}
                <div className="flex items-center gap-4 text-medium-grey">
                  <div className="flex items-center">
                    <FiCalendar className="mr-2 flex-shrink-0" size={16} />
                    <span className="font-medium text-sm">{formatDate(appointment.date)}</span>
                  </div>
                  <div className="flex items-center">
                    <FiClock className="mr-2 flex-shrink-0" size={16} />
                    <span className="font-semibold text-lg">{appointment.time}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm border ${getStatusColor(appointment.status)}`}>
                {getStatusText(appointment.status)}
              </span>
              
              {onViewDetails && (
                <button
                  onClick={() => onViewDetails(appointment.id)}
                  className="p-3 text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 group-hover:scale-110"
                  title="Ver detalles"
                >
                  <FiEye size={18} />
                </button>
              )}
              
              {showActions && appointment.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onConfirm?.(appointment.id)}
                    className="p-3 text-green-600 hover:bg-green-50 rounded-full transition-all duration-200 group-hover:scale-110"
                    title="Confirmar cita"
                  >
                    <FiCheck size={18} />
                  </button>
                  <button
                    onClick={() => onCancel?.(appointment.id)}
                    className="p-3 text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 group-hover:scale-110"
                    title="Cancelar cita"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, make the entire card clickable
  return (
    <Link href={href} className="block mb-4">
      <div 
        className="bg-white rounded-xl border border-light-grey hover:shadow-lg hover:border-blue-200 transition-all duration-300 overflow-hidden group cursor-pointer transform hover:scale-[1.02]"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <div className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-light-grey mr-4 flex-shrink-0 ring-2 ring-blue-50 group-hover:ring-blue-200 transition-all duration-300">
                <Image 
                  src={appointment.patientAvatar} 
                  alt={appointment.patientName}
                  width={56}
                  height={56}
                  className="object-cover"
                />
              </div>
              
              <div className="min-w-0">
                <h3 className="font-bold text-dark-grey text-xl mb-2 group-hover:text-blue-700 transition-colors duration-300">{appointment.patientName}</h3>
                
                {/* Date and Time Info */}
                <div className="flex items-center gap-4 text-medium-grey">
                  <div className="flex items-center">
                    <FiCalendar className="mr-2 flex-shrink-0" size={16} />
                    <span className="font-medium text-sm">{formatDate(appointment.date)}</span>
                  </div>
                  <div className="flex items-center">
                    <FiClock className="mr-2 flex-shrink-0" size={16} />
                    <span className="font-semibold text-lg">{appointment.time}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm border ${getStatusColor(appointment.status)}`}>
                {getStatusText(appointment.status)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AppointmentCard; 