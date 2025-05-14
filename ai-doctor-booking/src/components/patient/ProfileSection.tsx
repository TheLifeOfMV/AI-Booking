"use client";

import React, { ReactNode } from 'react';
import { FiEdit } from 'react-icons/fi';

interface ProfileSectionProps {
  title: string;
  children: ReactNode;
  onEdit?: () => void;
  isEditable?: boolean;
}

/**
 * Componente que muestra una sección del perfil del paciente con título y contenido
 */
const ProfileSection: React.FC<ProfileSectionProps> = ({
  title,
  children,
  onEdit,
  isEditable = true
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
      <div className="flex justify-between items-center px-4 py-3 border-b border-light-grey">
        <h3 className="font-semibold text-lg text-dark-grey">{title}</h3>
        {isEditable && onEdit && (
          <button 
            onClick={onEdit}
            className="flex items-center text-primary text-sm font-medium"
          >
            <FiEdit className="mr-1" /> Editar
          </button>
        )}
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default ProfileSection; 