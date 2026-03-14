"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { FiCheck, FiSearch } from 'react-icons/fi';

interface Specialty {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  imageUrl?: string;
}

interface SpecialtySelectorProps {
  specialties: Specialty[];
  selectedSpecialties: string[];
  onChange: (selectedIds: string[]) => void;
  maxSelections?: number;
}

// Lista completa de especialidades con el mismo diseño de page.tsx
const COMPLETE_SPECIALTIES = [
  { id: '1', name: 'Neurología', imageUrl: '/doctors/neurologist.jpg', icon: 'brain', color: '#E53E3E' },
  { id: '2', name: 'Cardiología', imageUrl: '/doctors/cardiologist.jpg', icon: 'heart', color: '#DD6B20' },
  { id: '3', name: 'Ortopedia', imageUrl: '/doctors/orthopedist.jpg', icon: 'bone', color: '#38A169' },
  { id: '4', name: 'Neumología', imageUrl: '/doctors/pulmonologist.jpg', icon: 'lungs', color: '#3182CE' },
  { id: '5', name: 'Odontología', imageUrl: '/doctors/dentist.jpg', icon: 'tooth', color: '#00B5D8' },
  { id: '6', name: 'Dermatología', imageUrl: '/doctors/dermatologist.jpg', icon: 'skin', color: '#D53F8C' },
  { id: '7', name: 'Oftalmología', imageUrl: '/doctors/ophthalmologist.jpg', icon: 'eye', color: '#805AD5' },
  { id: '8', name: 'Pediatría', imageUrl: '/doctors/pediatrician.jpg', icon: 'baby', color: '#4FD1C5' },
  { id: '9', name: 'Psiquiatría', imageUrl: '/doctors/psychiatrist.jpg', icon: 'mind', color: '#F6AD55' },
  { id: '10', name: 'Urología', imageUrl: '/doctors/urologist.jpg', icon: 'kidney', color: '#4299E1' },
  { id: '11', name: 'Psicología', imageUrl: '/doctors/psychologist.jpg', icon: 'psychology', color: '#9F7AEA' },
  { id: '12', name: 'Hematología', imageUrl: '/doctors/hematologist.jpg', icon: 'blood', color: '#E53E3E' },
  { id: '13', name: 'Ginecología', imageUrl: '/doctors/gynecologist.jpg', icon: 'female', color: '#ED64A6' },
  { id: '14', name: 'Cirugía Plástica', imageUrl: '/doctors/plastic-surgeon.jpg', icon: 'scalpel', color: '#667EEA' },
  { id: '15', name: 'Cirugía General', imageUrl: '/doctors/surgeon.jpg', icon: 'surgery', color: '#48BB78' },
  { id: '16', name: 'Fisioterapia', imageUrl: '/doctors/physiotherapist.jpg', icon: 'physio', color: '#38B2AC' },
  { id: '17', name: 'Oncología', imageUrl: '/doctors/oncologist.jpg', icon: 'cell', color: '#9B2C2C' },
];

// Función auxiliar para convertir un color hex a rgba con transparencia
const hexToRgba = (hex: string, alpha: number = 0.1) => {
  let r = 0, g = 0, b = 0;
  
  if (hex.startsWith('#')) {
    hex = hex.slice(1);
  }
  
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  }
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Componente de icono médico
const renderSpecialtyIcon = (icon: string | undefined, isSelected: boolean = false, size: number = 36) => {
  const specialty = COMPLETE_SPECIALTIES.find(s => s.icon === icon);
  const color = specialty?.color || '#777777';
  const strokeWidth = isSelected ? "2" : "1.5";
  
  switch (icon) {
    case 'brain':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 19a2 2 0 0 1-2-2v-4l-1-1a2 2 0 0 1 0-3l1-1V6a2 2 0 0 1 2-2h3.93a2 2 0 0 1 1.66.9l.41.59a2 2 0 0 0 1.66.9H16a2 2 0 0 1 2 2v1.5"></path>
          <path d="M12 19v-2.5a2.5 2.5 0 0 1 2.5-2.5A2.5 2.5 0 0 0 17 11.5v-3a2.5 2.5 0 0 1 2.5-2.5h1a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5h-1a2.5 2.5 0 0 0-2.5 2.5v3.5a2 2 0 0 1-2 2Z"></path>
          <path d="M12 13a4 4 0 0 1 0-8"></path>
          <path d="M10 9.5a2.5 2.5 0 0 0 0 5"></path>
        </svg>
      );
    case 'heart':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
          <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.82 2.95 0l1.9-1.9c.2-.2.51-.2.71 0v0c.2.2.2.51 0 .71L12 12.34"></path>
        </svg>
      );
    case 'bone':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6.42v-.06a2.97 2.97 0 0 0-2.97-2.97h-.05a2.97 2.97 0 0 0-2.84 3.75L12 8"></path>
          <path d="M12 16.01V16l.12.87a2.96 2.96 0 0 0 2.86 2.48 2.97 2.97 0 0 0 2.97-2.97v-.11A2.97 2.97 0 0 0 14.9 13.4L12 12l-2.8-1.4a2.97 2.97 0 0 0-3.06-.04 2.97 2.97 0 0 0-.03 5.05l1.4.86"></path>
          <path d="M12 8.02v-.04A2.97 2.97 0 0 0 9.03 5h-.08a2.97 2.97 0 0 0-2.97 2.97v.05a2.97 2.97 0 0 0 1.84 2.76L12 12"></path>
        </svg>
      );
    case 'lungs':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 6a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0Z"></path>
          <path d="M18.5 7c0-1-1-2-3-2s-2.9 1-2.9 2c.1 2 .9 3 1.9 3 .9 0 1.6-.8 1.9-2"></path>
          <path d="M10.5 7c0-1-1-2-3-2s-3 1-3 2c.1 2 .9 3 1.9 3 1 0 1.6-.8 1.9-2"></path>
          <path d="M12 12V4"></path>
          <path d="M8 21c-4-1-4-4-4-10"></path>
          <path d="M16 21c4-1 4-4 4-10"></path>
        </svg>
      );
    case 'tooth':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5.5c-1.5-2-3-2.5-4-2.5-3 0-5 2.5-5 5 0 1.5.5 2 1 3 .2.2.2.5 0 1-1 2 1 3 1 3 1 1 3 1 3-1 0-1 .5-1 1-1s1 0 1 1c0 2 2 2 3 1 0 0 2-1 1-3-.2-.5-.2-.8 0-1 .5-1 1-1.5 1-3 0-2.5-2-5-5-5-1 0-2.5.5-4 2.5Z"></path>
          <path d="M15.5 12.5c-.7 1-1.5 2.3-3.5 2.5-2-.2-2.8-1.5-3.5-2.5"></path>
        </svg>
      );
    case 'skin':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5Z"></path>
          <path d="m8 9 3 3 5-5"></path>
          <path d="M16 14v2.5"></path>
          <path d="M14 17.5v-1"></path>
          <path d="M10 13v-2.5"></path>
          <path d="M7 10.5v1"></path>
        </svg>
      );
    case 'eye':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 9v0"></path>
          <path d="M12 15v0"></path>
          <path d="M9 12h0"></path>
          <path d="M15 12h0"></path>
        </svg>
      );
    case 'baby':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12h0"></path>
          <path d="M15 12h0"></path>
          <path d="M10 16c0 1.1.9 2 2 2s2-.9 2-2"></path>
          <path d="M17 9a5 5 0 0 0-10 0"></path>
          <path d="M12 3c.6 0 1.1.2 1.5.5"></path>
          <path d="M12 3v2"></path>
          <path d="m8 18-2 3"></path>
          <path d="m16 18 2 3"></path>
          <path d="M12 20v-6"></path>
        </svg>
      );
    case 'mind':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.3 16a4.8 4.8 0 0 0 5.4 0"></path>
          <path d="M7 10c0-1.7 1.3-3 3-3h4c1.7 0 3 1.3 3 3v2c0 1.7-1.3 3-3 3h-4c-1.7 0-3-1.3-3-3v-2z"></path>
          <circle cx="8" cy="12" r="1"></circle>
          <circle cx="16" cy="12" r="1"></circle>
          <path d="M16 7h3a2 2 0 0 1 2 2v1.5"></path>
          <path d="M3 11v-1a2 2 0 0 1 2-2h3"></path>
        </svg>
      );
    case 'kidney':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 12c-2-3-3-4.5-3-6.5a3 3 0 0 1 6 0c0 2-1 3.5-3 6.5z"/>
          <path d="M12 12c2-3 3-4.5 3-6.5a3 3 0 0 0-6 0c0 2 1 3.5 3 6.5z"/>
        </svg>
      );
    case 'psychology':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a5 5 0 0 1 5 5v2a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z"/>
          <path d="M8 14h8"/>
          <path d="M8 17h8"/>
          <path d="M12 14v7"/>
        </svg>
      );
    case 'blood':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          <path d="M12 8v8"/>
          <path d="M8 12h8"/>
        </svg>
      );
    case 'female':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="6"/>
          <path d="M12 14v7"/>
          <path d="M9 18h6"/>
        </svg>
      );
    case 'scalpel':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 4L8.5 15.5"/>
          <path d="M4 20l3.5-3.5"/>
          <path d="M8.5 15.5L4 20"/>
          <path d="M16 8l-4 4"/>
        </svg>
      );
    case 'surgery':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="2"/>
          <path d="M9 8h6"/>
          <path d="M12 8v6"/>
          <path d="M8 16h8"/>
        </svg>
      );
    case 'physio':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 6a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2a2 2 0 0 1 2 2z"/>
          <path d="M12 8v8"/>
          <path d="M8 12l4 4 4-4"/>
        </svg>
      );
    case 'cell':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="8"/>
          <path d="M12 4v16"/>
          <path d="M4 12h16"/>
          <path d="M7 7l10 10"/>
          <path d="M7 17L17 7"/>
        </svg>
      );
    default:
      return null;
  }
};

const SpecialtySelector: React.FC<SpecialtySelectorProps> = ({
  selectedSpecialties,
  onChange,
  maxSelections = 3
}) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Mostrar las primeras 8 especialidades
  const mainSpecialties = COMPLETE_SPECIALTIES.slice(0, 8);
  const additionalSpecialties = COMPLETE_SPECIALTIES.slice(8);

  const filteredAdditionalSpecialties = additionalSpecialties.filter(specialty =>
    specialty.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSpecialtyClick = (id: string) => {
    let updatedSelections;
    
    if (selectedSpecialties.includes(id)) {
      updatedSelections = selectedSpecialties.filter(specId => specId !== id);
    } else {
      if (selectedSpecialties.length < maxSelections) {
        updatedSelections = [...selectedSpecialties, id];
      } else {
        alert(`Puedes seleccionar un máximo de ${maxSelections} especialidades.`);
        return;
      }
    }
    
    onChange(updatedSelections);
  };

  return (
    <div className="w-full">
      {/* Grid de especialidades principales (8 tarjetas) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {mainSpecialties.map((specialty) => {
          const isSelected = selectedSpecialties.includes(specialty.id);
          return (
            <div 
              key={specialty.id} 
              className={`flex flex-col items-center w-full h-28 rounded-xl p-3 transition-all duration-200 cursor-pointer`}
              style={{
                backgroundColor: isSelected && specialty.color
                  ? hexToRgba(specialty.color, 0.05)
                  : 'white',
                borderColor: isSelected && specialty.color 
                  ? specialty.color 
                  : 'transparent',
                borderWidth: isSelected ? '2px' : '1px',
                borderStyle: 'solid',
                boxShadow: isSelected 
                  ? 'none' 
                  : '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
              onClick={() => handleSpecialtyClick(specialty.id)}
            >
              <div 
                className="flex items-center justify-center mb-2 w-14 h-14 rounded-full overflow-hidden relative"
                style={{ backgroundColor: 'white' }}
              >
                {specialty.id === '1' ? (
                  <div className="scale-125">
                    <Image 
                      src="/specialties/cerebro.png"
                      alt="Neurología"
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                  </div>
                ) : specialty.id === '2' ? (
                  <div className="scale-125">
                    <Image 
                      src="/specialties/corazon.png"
                      alt="Cardiología"
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                  </div>
                ) : specialty.id === '3' ? (
                  <div className="scale-125">
                    <Image 
                      src="/specialties/ortopedia.png"
                      alt="Ortopedia"
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                  </div>
                ) : specialty.id === '4' ? (
                  <div className="scale-125">
                    <Image 
                      src="/specialties/pulmon.png"
                      alt="Neumología"
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                  </div>
                ) : specialty.id === '5' ? (
                  <div className="scale-125">
                    <Image 
                      src="/specialties/diente.png"
                      alt="Odontología"
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                  </div>
                ) : specialty.id === '6' ? (
                  <div className="scale-125">
                    <Image 
                      src="/specialties/piel.png"
                      alt="Dermatología"
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                  </div>
                ) : specialty.id === '7' ? (
                  <div className="scale-125">
                    <Image 
                      src="/specialties/ojo.png"
                      alt="Oftalmología"
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                  </div>
                ) : specialty.id === '8' ? (
                  <div className="scale-110">
                    <Image 
                      src="/specialties/osito.png"
                      alt="Pediatría"
                      width={52}
                      height={52}
                      className="object-contain p-0.5"
                    />
                  </div>
                ) : (
                  renderSpecialtyIcon(specialty.icon, isSelected, 36)
                )}
              </div>
              <div className="text-sm text-dark-grey font-medium text-center leading-tight">
                {specialty.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Botón "Otra especialidad" */}
      <div className="mb-4">
        <div 
          className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-gray-300 hover:border-primary/30 cursor-pointer transition-all duration-200 h-28 bg-white"
          onClick={() => setShowModal(true)}
        >
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-2">
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M12 5v14m-7-7h14"/>
            </svg>
          </div>
          <span className="text-center text-sm font-medium text-gray-700">Otra especialidad</span>
        </div>
      </div>

      {/* Especialidades seleccionadas */}
      {selectedSpecialties.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-medium-grey mb-1">
            Especialidades seleccionadas ({selectedSpecialties.length}/{maxSelections}):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedSpecialties.map(id => {
              const specialty = COMPLETE_SPECIALTIES.find(s => s.id === id);
              return specialty ? (
                <div key={id} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <span>{specialty.name}</span>
                  <button
                    onClick={() => handleSpecialtyClick(specialty.id)}
                    className="hover:bg-primary/20 rounded-full p-0.5 transition-colors duration-150"
                    aria-label={`Quitar ${specialty.name}`}
                  >
                    <svg 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Modal para especialidades adicionales */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-xl text-gray-800">Más Especialidades</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Cerrar modal"
              >
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar especialidad"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {filteredAdditionalSpecialties.map((specialty) => {
                  const isSelected = selectedSpecialties.includes(specialty.id);
                  return (
                    <div 
                      key={specialty.id} 
                      className={`flex flex-col items-center p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md bg-white relative`}
                      style={{
                        backgroundColor: isSelected && specialty.color
                          ? hexToRgba(specialty.color, 0.05)
                          : 'white',
                        borderColor: isSelected && specialty.color 
                          ? specialty.color 
                          : '#F2F2F2',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        boxShadow: isSelected 
                          ? 'none' 
                          : '0 1px 3px rgba(0, 0, 0, 0.05)'
                      }}
                      onClick={() => {
                        handleSpecialtyClick(specialty.id);
                        if (!selectedSpecialties.includes(specialty.id) && selectedSpecialties.length < maxSelections) {
                          setShowModal(false);
                        }
                      }}
                    >
                      <div 
                        className="flex items-center justify-center mb-3 w-16 h-16 rounded-full overflow-hidden"
                        style={{ backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                      >
                        {specialty.id === '9' ? (
                          <div className="scale-110">
                            <Image 
                              src="/specialties/psiquiatria.png"
                              alt="Psiquiatría"
                              width={64}
                              height={64}
                              className="object-contain p-1"
                            />
                          </div>
                        ) : specialty.id === '10' ? (
                          <div className="scale-125">
                            <Image 
                              src="/specialties/Urologia..png"
                              alt="Urología"
                              width={58}
                              height={58}
                              className="object-contain"
                            />
                          </div>
                        ) : specialty.id === '11' ? (
                          <div className="scale-125">
                            <Image 
                              src="/specialties/Psicologiaa.png"
                              alt="Psicología"
                              width={60}
                              height={60}
                              className="object-contain"
                            />
                          </div>
                        ) : specialty.id === '12' ? (
                          <div className="scale-125">
                            <Image 
                              src="/specialties/Hemato.png"
                              alt="Hematología"
                              width={60}
                              height={60}
                              className="object-contain"
                            />
                          </div>
                        ) : specialty.id === '13' ? (
                          <div className="scale-125">
                            <Image 
                              src="/specialties/utero.png"
                              alt="Ginecología"
                              width={64}
                              height={64}
                              className="object-contain p-1"
                            />
                          </div>
                        ) : specialty.id === '14' ? (
                          <div className="scale-125">
                            <Image 
                              src="/specialties/C Plastica.png"
                              alt="Cirugía Plástica"
                              width={64}
                              height={64}
                              className="object-contain"
                            />
                          </div>
                        ) : specialty.id === '15' ? (
                          <div className="scale-125">
                            <Image 
                              src="/specialties/Cirugia.png"
                              alt="Cirugía General"
                              width={64}
                              height={64}
                              className="object-contain"
                            />
                          </div>
                        ) : specialty.id === '16' ? (
                          <div className="scale-125">
                            <Image 
                              src="/specialties/fisioterapia.png"
                              alt="Fisioterapia"
                              width={42}
                              height={42}
                              className="object-contain"
                            />
                          </div>
                        ) : specialty.id === '17' ? (
                          <div className="scale-125">
                            <Image 
                              src="/specialties/oncologia.png"
                              alt="Oncología"
                              width={38}
                              height={38}
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          renderSpecialtyIcon(specialty.icon, isSelected, 40)
                        )}
                      </div>
                      <div className="text-sm text-gray-800 font-medium text-center leading-tight">
                        {specialty.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialtySelector; 