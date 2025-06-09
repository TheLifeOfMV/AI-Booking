'use client';

import React from 'react';
import Image from 'next/image';
import { FiClock, FiCheck, FiX, FiEye } from 'react-icons/fi';

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
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ 
  appointment, 
  onConfirm, 
  onCancel, 
  onViewDetails,
  showActions = false 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-orange-600 bg-orange-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
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

  return (
    <div className="p-4 sm:p-6 hover:bg-light-grey/30 transition-colors border-b border-light-grey last:border-b-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-light-grey mr-4 flex-shrink-0">
            <Image 
              src={appointment.patientAvatar} 
              alt={appointment.patientName}
              width={48}
              height={48}
              className="object-cover"
            />
          </div>
          
          <div className="min-w-0">
            <h3 className="font-semibold text-dark-grey text-lg">{appointment.patientName}</h3>
            <div className="flex items-center text-medium-grey mt-1">
              <FiClock className="mr-2 flex-shrink-0" size={16} />
              <span className="font-medium">{appointment.time}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
            {getStatusText(appointment.status)}
          </span>
          
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(appointment.id)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Ver detalles"
            >
              <FiEye size={16} />
            </button>
          )}
          
          {showActions && appointment.status === 'pending' && (
            <div className="flex gap-2">
              <button
                onClick={() => onConfirm?.(appointment.id)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                title="Confirmar cita"
              >
                <FiCheck size={16} />
              </button>
              <button
                onClick={() => onCancel?.(appointment.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Cancelar cita"
              >
                <FiX size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard; 