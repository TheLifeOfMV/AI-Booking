"use client";

import React, { useState } from 'react';
import { FiCheck, FiSearch, FiPlus } from 'react-icons/fi';

interface Specialty {
  id: string;
  name: string;
  icon?: string;
}

interface SpecialtySelectorProps {
  specialties: Specialty[];
  selectedSpecialties: string[];
  onChange: (selectedIds: string[]) => void;
  maxSelections?: number;
}

const SpecialtySelector: React.FC<SpecialtySelectorProps> = ({
  specialties,
  selectedSpecialties,
  onChange,
  maxSelections = 3
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredSpecialties = specialties.filter(specialty =>
    specialty.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSpecialtyClick = (id: string) => {
    let updatedSelections;
    
    if (selectedSpecialties.includes(id)) {
      // Remove specialty if already selected
      updatedSelections = selectedSpecialties.filter(specId => specId !== id);
    } else {
      // Add specialty if not at max limit
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
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <FiSearch className="text-medium-grey" />
        </div>
        <input
          type="text"
          placeholder="Buscar especialidad"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-light-grey 
                    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filteredSpecialties.map(specialty => (
          <div
            key={specialty.id}
            onClick={() => handleSpecialtyClick(specialty.id)}
            className={`relative flex flex-col items-center justify-center p-4 rounded-xl border 
                      cursor-pointer transition-all duration-200 h-28
                      ${selectedSpecialties.includes(specialty.id)
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-light-grey hover:border-primary/30'}`}
          >
            {selectedSpecialties.includes(specialty.id) && (
              <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full">
                <FiCheck size={12} />
              </div>
            )}
            
            <div className="w-10 h-10 rounded-full bg-light-grey flex items-center justify-center mb-2">
              {specialty.icon ? (
                <img src={specialty.icon} alt={specialty.name} className="w-6 h-6" />
              ) : (
                <span className="text-primary font-medium">{specialty.name.charAt(0)}</span>
              )}
            </div>
            <span className="text-center text-sm font-medium">{specialty.name}</span>
          </div>
        ))}
        
        {/* Agregar nueva especialidad */}
        <div
          className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-light-grey
                    hover:border-primary/30 cursor-pointer transition-all duration-200 h-28"
        >
          <div className="w-10 h-10 rounded-full bg-light-grey flex items-center justify-center mb-2">
            <FiPlus className="text-primary" />
          </div>
          <span className="text-center text-sm font-medium">Otra especialidad</span>
        </div>
      </div>
      
      {selectedSpecialties.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-medium-grey mb-1">
            Especialidades seleccionadas ({selectedSpecialties.length}/{maxSelections}):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedSpecialties.map(id => {
              const specialty = specialties.find(s => s.id === id);
              return specialty ? (
                <div key={id} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  {specialty.name}
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialtySelector; 