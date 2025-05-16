"use client";

import React, { useState } from 'react';
import { Doctor } from '@/types/doctor';

interface ApprovalToggleProps {
  doctor: Doctor;
  onToggle: (doctor: Doctor, newStatus: boolean) => Promise<void>;
}

/**
 * Componente de interruptor para el estado de aprobación del doctor
 * con estados de carga y error
 */
const ApprovalToggle: React.FC<ApprovalToggleProps> = ({ doctor, onToggle }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Estado local para seguir el estado visual del interruptor
  const [isApproved, setIsApproved] = useState(doctor.approvalStatus);
  
  const handleToggleClick = () => {
    // Si ya está cargando, no hacer nada
    if (isLoading) return;
    
    // Si esto está desactivando la aprobación, mostrar diálogo de confirmación
    if (isApproved) {
      setShowConfirm(true);
    } else {
      // De lo contrario, proceder directamente
      handleConfirmedToggle();
    }
  };
  
  const handleConfirmedToggle = async () => {
    setShowConfirm(false);
    setIsLoading(true);
    setHasError(false);
    
    const newStatus = !isApproved;
    
    try {
      // Actualizar el estado local de forma optimista
      setIsApproved(newStatus);
      
      // Llamar a la función real de cambio
      await onToggle(doctor, newStatus);
      
    } catch (error) {
      // Revertir en caso de error
      setIsApproved(isApproved);
      setHasError(true);
      
      // Auto-borrar estado de error después de 3 segundos
      setTimeout(() => {
        setHasError(false);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelToggle = () => {
    setShowConfirm(false);
  };
  
  return (
    <div className="flex items-center">
      {/* Interruptor de cambio */}
      <button
        onClick={handleToggleClick}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full 
          transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          ${isApproved ? 'bg-primary' : 'bg-gray-300'}
          ${hasError ? 'border-2 border-red-500' : ''}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        disabled={isLoading}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${isApproved ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
      
      {/* Texto de estado */}
      <span className={`ml-2 text-sm ${isApproved ? 'text-green-600' : 'text-medium-grey'}`}>
        {isLoading ? 'Actualizando...' : isApproved ? 'Aprobado' : 'No Aprobado'}
      </span>
      
      {/* Mensaje de error */}
      {hasError && (
        <div className="ml-2 text-xs text-red-500">
          Error al actualizar
        </div>
      )}
      
      {/* Diálogo de confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <h3 className="text-lg font-medium text-dark-grey mb-4">Confirmar Desaprobación</h3>
            <p className="text-medium-grey mb-6">
              ¿Estás seguro de que quieres desaprobar a {doctor.name}? 
              Esto lo eliminará del sistema de reservas y los pacientes no podrán reservar citas.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancelToggle}
                className="px-4 py-2 bg-gray-200 text-dark-grey rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmedToggle}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Desaprobar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalToggle; 