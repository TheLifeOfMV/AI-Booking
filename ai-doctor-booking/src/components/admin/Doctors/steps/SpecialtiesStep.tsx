"use client";

import React, { useState, useEffect } from 'react';
import { Doctor, CredentialStatus } from '@/types/doctor';
import { getSpecialties } from '@/services/doctorService';

interface Specialty {
  id: string;
  name: string;
  imageUrl?: string;
  icon?: string;
  color?: string;
}

interface SpecialtiesStepProps {
  formData: Doctor;
  errors: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSpecialtyChange: (specialtyId: string, specialtyName: string) => void;
  handleCredentialStatusChange: (status: CredentialStatus) => void;
}

/**
 * Componente SpecialtiesStep
 * 
 * Segundo paso en el modal de edición de doctor para selección de especialidad y credenciales.
 */
const SpecialtiesStep: React.FC<SpecialtiesStepProps> = ({
  formData,
  errors,
  handleChange,
  handleSpecialtyChange,
  handleCredentialStatusChange,
}) => {
  // Specialties state
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoadingSpecialties, setIsLoadingSpecialties] = useState(false);

  // Load specialties
  useEffect(() => {
    const fetchSpecialties = async () => {
      setIsLoadingSpecialties(true);
      try {
        const result = await getSpecialties();
        setSpecialties(result);
      } catch (error) {
        console.error('Error al cargar especialidades:', error);
      } finally {
        setIsLoadingSpecialties(false);
      }
    };

    fetchSpecialties();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-dark-grey mb-4">Especialidad y Credenciales</h2>
        <p className="text-medium-grey mb-6">
          Gestiona la especialidad médica del doctor y el estado de verificación de credenciales.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="specialtyId" className="block text-sm font-medium text-dark-grey mb-1">
            Especialidad Médica*
          </label>
          {isLoadingSpecialties ? (
            <div className="w-full p-3 text-medium-grey bg-light-grey rounded-md">
              Cargando especialidades...
            </div>
          ) : (
            <select
              id="specialtyId"
              name="specialtyId"
              value={formData.specialtyId}
              onChange={(e) => {
                const selectedSpecialty = specialties.find(s => s.id === e.target.value);
                handleSpecialtyChange(
                  e.target.value, 
                  selectedSpecialty ? selectedSpecialty.name : formData.specialtyName
                );
              }}
              className={`w-full p-3 border ${
                errors.specialtyId ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:ring-primary focus:border-primary transition-colors duration-200`}
            >
              <option value="">Seleccionar Especialidad</option>
              {specialties.map((specialty) => (
                <option key={specialty.id} value={specialty.id}>
                  {specialty.name}
                </option>
              ))}
            </select>
          )}
          {errors.specialtyId && <p className="mt-1 text-sm text-red-500">{errors.specialtyId}</p>}
        </div>

        <div>
          <label htmlFor="experience" className="block text-sm font-medium text-dark-grey mb-1">
            Experiencia*
          </label>
          <input
            type="text"
            id="experience"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            placeholder="10+ años"
            className={`w-full p-3 border ${
              errors.experience ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:ring-primary focus:border-primary transition-colors duration-200`}
          />
          {errors.experience && <p className="mt-1 text-sm text-red-500">{errors.experience}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="credentials.licenseNumber" className="block text-sm font-medium text-dark-grey mb-1">
          Número de Licencia Médica*
        </label>
        <input
          type="text"
          id="credentials.licenseNumber"
          name="credentials.licenseNumber"
          value={formData.credentials.licenseNumber}
          onChange={handleChange}
          placeholder="MC12345"
          className={`w-full p-3 border ${
            errors['credentials.licenseNumber'] ? 'border-red-500' : 'border-gray-300'
          } rounded-md focus:ring-primary focus:border-primary transition-colors duration-200`}
        />
        {errors['credentials.licenseNumber'] && (
          <p className="mt-1 text-sm text-red-500">{errors['credentials.licenseNumber']}</p>
        )}
      </div>

      <div>
        <label htmlFor="credentials.expiryDate" className="block text-sm font-medium text-dark-grey mb-1">
          Fecha de Vencimiento de Licencia*
        </label>
        <input
          type="date"
          id="credentials.expiryDate"
          name="credentials.expiryDate"
          value={formData.credentials.expiryDate}
          onChange={handleChange}
          className={`w-full p-3 border ${
            errors['credentials.expiryDate'] ? 'border-red-500' : 'border-gray-300'
          } rounded-md focus:ring-primary focus:border-primary transition-colors duration-200`}
        />
        {errors['credentials.expiryDate'] && (
          <p className="mt-1 text-sm text-red-500">{errors['credentials.expiryDate']}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-grey mb-3">
          Estado de Verificación de Credenciales
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleCredentialStatusChange('pending')}
            className={`px-4 py-2 rounded-full border transition-colors duration-200 ${
              formData.credentials.status === 'pending'
                ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
                : 'border-gray-300 text-medium-grey hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                formData.credentials.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'
              }`}></div>
              Pendiente de Revisión
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleCredentialStatusChange('verified')}
            className={`px-4 py-2 rounded-full border transition-colors duration-200 ${
              formData.credentials.status === 'verified'
                ? 'bg-green-100 border-green-300 text-green-800'
                : 'border-gray-300 text-medium-grey hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                formData.credentials.status === 'verified' ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              Verificado
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleCredentialStatusChange('rejected')}
            className={`px-4 py-2 rounded-full border transition-colors duration-200 ${
              formData.credentials.status === 'rejected'
                ? 'bg-red-100 border-red-300 text-red-800'
                : 'border-gray-300 text-medium-grey hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                formData.credentials.status === 'rejected' ? 'bg-red-500' : 'bg-gray-300'
              }`}></div>
              Rechazado
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpecialtiesStep; 