"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { DoctorFilter, CredentialStatus } from '@/types/doctor';
import { SPECIALTIES } from '@/services/doctorService';

interface DoctorFiltersProps {
  filters: DoctorFilter;
  onFilterChange: (filters: DoctorFilter) => void;
}

/**
 * Componente DoctorFilters
 * 
 * Proporciona controles de búsqueda y filtrado para la tabla de doctores
 */
const DoctorFilters: React.FC<DoctorFiltersProps> = ({ filters, onFilterChange }) => {
  // Local state for filter inputs
  const [search, setSearch] = useState(filters.search || '');
  const [specialtyId, setSpecialtyId] = useState(filters.specialtyId || '');
  const [credentialStatus, setCredentialStatus] = useState<CredentialStatus | ''>
    (filters.credentialStatus || '');
  const [approvalStatus, setApprovalStatus] = useState<boolean | undefined>(
    filters.approvalStatus
  );
  
  // State for specialties list
  const [specialties, setSpecialties] = useState(SPECIALTIES);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
  
  // Load specialties
  const loadSpecialties = useCallback(async () => {
    try {
      setLoadingSpecialties(true);
      const response = await fetch('/api/admin/doctors/specialties');
      
      if (!response.ok) {
        throw new Error('Error al cargar especialidades');
      }
      
      const data = await response.json();
      setSpecialties(data.specialties);
      
    } catch (error) {
      console.error('Error al cargar especialidades:', error);
      // Fall back to mock data in case of error
    } finally {
      setLoadingSpecialties(false);
    }
  }, []);
  
  // Load specialties on mount
  useEffect(() => {
    loadSpecialties();
  }, [loadSpecialties]);
  
  // Apply filters when search button is clicked
  const handleApplyFilters = () => {
    const newFilters: DoctorFilter = {};
    
    if (search.trim()) {
      newFilters.search = search.trim();
    }
    
    if (specialtyId) {
      newFilters.specialtyId = specialtyId;
    }
    
    if (credentialStatus) {
      newFilters.credentialStatus = credentialStatus;
    }
    
    if (approvalStatus !== undefined) {
      newFilters.approvalStatus = approvalStatus;
    }
    
    onFilterChange(newFilters);
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    setSearch('');
    setSpecialtyId('');
    setCredentialStatus('');
    setApprovalStatus(undefined);
    
    onFilterChange({});
  };
  
  // Handle search on Enter key
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApplyFilters();
    }
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search input */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-dark-grey mb-1">
            Buscar
          </label>
          <input
            id="search"
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            placeholder="Nombre, email o especialidad"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
        
        {/* Specialty filter */}
        <div>
          <label htmlFor="specialty" className="block text-sm font-medium text-dark-grey mb-1">
            Especialidad
          </label>
          <select
            id="specialty"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            value={specialtyId}
            onChange={(e) => setSpecialtyId(e.target.value)}
            disabled={loadingSpecialties}
          >
            <option value="">Todas las Especialidades</option>
            {specialties.map((specialty) => (
              <option key={specialty.id} value={specialty.id}>
                {specialty.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Credential status filter */}
        <div>
          <label htmlFor="credentialStatus" className="block text-sm font-medium text-dark-grey mb-1">
            Estado Credencial
          </label>
          <select
            id="credentialStatus"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            value={credentialStatus}
            onChange={(e) => setCredentialStatus(e.target.value as CredentialStatus | '')}
          >
            <option value="">Todos los Estados</option>
            <option value="verified">Verificado</option>
            <option value="pending">Pendiente de Revisión</option>
            <option value="rejected">Rechazado</option>
          </select>
        </div>
        
        {/* Approval status filter */}
        <div>
          <label htmlFor="approvalStatus" className="block text-sm font-medium text-dark-grey mb-1">
            Estado de Aprobación
          </label>
          <select
            id="approvalStatus"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            value={approvalStatus === undefined ? '' : approvalStatus ? 'true' : 'false'}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '') {
                setApprovalStatus(undefined);
              } else {
                setApprovalStatus(value === 'true');
              }
            }}
          >
            <option value="">Todos</option>
            <option value="true">Aprobado</option>
            <option value="false">No Aprobado</option>
          </select>
        </div>
      </div>
      
      {/* Filter actions */}
      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={handleResetFilters}
          className="px-4 py-2 border border-gray-300 rounded-md text-medium-grey hover:bg-gray-50"
        >
          Restablecer
        </button>
        <button
          onClick={handleApplyFilters}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
};

export default DoctorFilters; 