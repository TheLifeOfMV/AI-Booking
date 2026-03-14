"use client";

import React from 'react';
import dynamic from 'next/dynamic';

// Usar importación dinámica para mejorar la carga inicial de la página
const DoctorsTable = dynamic(
  () => import('@/domains/adminservice/components/Doctors/DoctorsTable'),
  { 
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-pulse text-medium-grey">Cargando tabla de doctores...</div>
      </div>
    ),
    ssr: false // Deshabilitar SSR para evitar problemas de hidratación con el estado complejo de la tabla
  }
);

const DoctorsTableWrapper: React.FC = () => {
  return <DoctorsTable />;
};

export default DoctorsTableWrapper; 