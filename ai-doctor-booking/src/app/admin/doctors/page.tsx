import React from 'react';
import { Metadata } from 'next';
import DoctorsTableWrapper from '@/components/admin/Doctors/DoctorsTableWrapper';

export const metadata: Metadata = {
  title: 'Admin - Doctores | AI Doctor Booking',
  description: 'Gestiona perfiles de doctores, aprueba credenciales y controla la visibilidad de doctores',
};

/**
 * Vista de Administración de Doctores
 * 
 * Esta página muestra una tabla de todos los doctores en el sistema con controles para:
 * - Buscar y filtrar doctores
 * - Ver y editar detalles de doctores
 * - Actualizar el estado de verificación de credenciales
 * - Alternar el estado de aprobación de doctores
 */
export default function DoctorsPage() {
  return (
    <div className="w-full p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-dark-grey">Doctores</h1>
        <p className="text-medium-grey">
          Gestiona perfiles de doctores, verifica credenciales y controla quién aparece en el sistema de reservas.
        </p>
      </div>
      
      <DoctorsTableWrapper />
    </div>
  );
} 