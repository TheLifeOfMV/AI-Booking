"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FiCheck, FiX, FiEye, FiEdit, FiPhone, FiVideo, FiMoreVertical, FiClock } from 'react-icons/fi';
import { ExtendedAppointment } from '../mockAppointments';

interface AppointmentActionsProps {
  appointment: ExtendedAppointment;
  onConfirm?: (appointmentId: string) => Promise<void>;
  onCancel?: (appointmentId: string) => Promise<void>;
  onReschedule?: (appointmentId: string) => void;
  onViewDetails?: (appointmentId: string) => void;
  isLoading?: boolean;
  compact?: boolean;
}

const AppointmentActions: React.FC<AppointmentActionsProps> = ({
  appointment,
  onConfirm,
  onCancel,
  onReschedule,
  onViewDetails,
  isLoading = false,
  compact = false
}) => {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMoreActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAction = async (action: string, callback?: () => Promise<void> | void) => {
    if (!callback) return;
    
    setActionLoading(action);
    try {
      await callback();
    } catch (error) {
      console.error(`Error executing ${action}:`, error);
      // Here you would typically show a toast notification
    } finally {
      setActionLoading(null);
    }
  };

  const canConfirm = appointment.status === 'pending';
  const canCancel = ['pending', 'confirmed'].includes(appointment.status);
  const canReschedule = ['pending', 'confirmed'].includes(appointment.status);
  const canStartConsultation = appointment.status === 'confirmed' && isAppointmentTimeNow(appointment);

  // Check if appointment time is now (within 15 minutes)
  function isAppointmentTimeNow(apt: ExtendedAppointment): boolean {
    const now = new Date();
    const aptDateTime = new Date(`${apt.date}T${apt.time}`);
    const timeDiff = Math.abs(now.getTime() - aptDateTime.getTime());
    return timeDiff <= 15 * 60 * 1000; // 15 minutes
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {canConfirm && (
          <button
            onClick={() => handleAction('confirm', () => onConfirm?.(appointment.id))}
            disabled={isLoading || actionLoading === 'confirm'}
            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
            title="Confirmar cita"
          >
            <FiCheck size={14} />
          </button>
        )}
        
        {canCancel && (
          <button
            onClick={() => handleAction('cancel', () => onCancel?.(appointment.id))}
            disabled={isLoading || actionLoading === 'cancel'}
            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
            title="Cancelar cita"
          >
            <FiX size={14} />
          </button>
        )}

        <button
          onClick={() => onViewDetails?.(appointment.id)}
          className="p-2 rounded-lg transition-colors"
          style={{ 
            color: '#007AFF',
            backgroundColor: 'rgba(0, 122, 255, 0.1)'
          }}
          title="Ver detalles"
        >
          <FiEye size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Primary Actions */}
      <div className="flex items-center gap-2">
        
        {/* Confirm Action */}
        {canConfirm && (
          <button
            onClick={() => handleAction('confirm', () => onConfirm?.(appointment.id))}
            disabled={isLoading || actionLoading === 'confirm'}
            className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {actionLoading === 'confirm' ? (
              <div className="w-4 h-4 border-2 border-green-700 border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <FiCheck size={16} className="mr-2" />
            )}
            Confirmar
          </button>
        )}

        {/* Start Consultation */}
        {canStartConsultation && (
          <button
            onClick={() => handleAction('start', () => console.log('Starting consultation'))}
            disabled={isLoading}
            className="flex items-center px-3 py-2 rounded-lg transition-colors text-sm font-medium text-white"
            style={{ backgroundColor: '#007AFF' }}
          >
            {appointment.consultationType === 'virtual' ? (
              <FiVideo size={16} className="mr-2" />
            ) : (
              <FiPhone size={16} className="mr-2" />
            )}
            Iniciar Consulta
          </button>
        )}

        {/* View Details */}
        <button
          onClick={() => onViewDetails?.(appointment.id)}
          className="flex items-center px-3 py-2 rounded-lg transition-colors text-sm font-medium"
          style={{ 
            color: '#007AFF',
            backgroundColor: 'rgba(0, 122, 255, 0.1)'
          }}
        >
          <FiEye size={16} className="mr-2" />
          Ver Detalles
        </button>

        {/* More Actions Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowMoreActions(!showMoreActions)}
            className="p-2 hover:bg-light-grey rounded-lg transition-colors"
          >
            <FiMoreVertical size={16} className="text-medium-grey" />
          </button>

          {showMoreActions && (
            <div className="absolute right-0 bottom-full mb-2 bg-white rounded-lg shadow-xl border border-light-grey min-w-[180px] z-50" style={{ 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
              
              {canReschedule && (
                <button
                  onClick={() => {
                    setShowMoreActions(false);
                    onReschedule?.(appointment.id);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-light-grey transition-colors flex items-center text-sm"
                >
                  <FiClock size={16} className="mr-3 text-medium-grey" />
                  Reprogramar
                </button>
              )}



              {canCancel && (
                <div className="border-t border-light-grey">
                  <button
                    onClick={() => {
                      setShowMoreActions(false);
                      handleAction('cancel', () => onCancel?.(appointment.id));
                    }}
                    disabled={isLoading || actionLoading === 'cancel'}
                    className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors flex items-center text-sm text-red-600 disabled:opacity-50"
                  >
                    {actionLoading === 'cancel' ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-3" />
                    ) : (
                      <FiX size={16} className="mr-3" />
                    )}
                    Cancelar Cita
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Indicator */}
      <div className="text-xs text-medium-grey">
        {actionLoading && (
          <span className="flex items-center">
            <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin mr-2" />
            Procesando...
          </span>
        )}
      </div>
    </div>
  );
};

export default AppointmentActions; 