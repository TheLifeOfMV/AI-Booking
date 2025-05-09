"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { DoctorFilter, CredentialStatus } from '@/types/doctor';
import { SPECIALTIES } from '@/services/doctorService';

interface DoctorFiltersProps {
  filters: DoctorFilter;
  onFilterChange: (filters: DoctorFilter) => void;
}

/**
 * DoctorFilters component
 * 
 * Provides search and filter controls for the doctors table
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
        throw new Error('Failed to load specialties');
      }
      
      const data = await response.json();
      setSpecialties(data.specialties);
      
    } catch (error) {
      console.error('Error loading specialties:', error);
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
            Search
          </label>
          <input
            id="search"
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            placeholder="Name, email, or specialty"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
        
        {/* Specialty filter */}
        <div>
          <label htmlFor="specialty" className="block text-sm font-medium text-dark-grey mb-1">
            Specialty
          </label>
          <select
            id="specialty"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            value={specialtyId}
            onChange={(e) => setSpecialtyId(e.target.value)}
            disabled={loadingSpecialties}
          >
            <option value="">All Specialties</option>
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
            Credential Status
          </label>
          <select
            id="credentialStatus"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            value={credentialStatus}
            onChange={(e) => setCredentialStatus(e.target.value as CredentialStatus | '')}
          >
            <option value="">All Statuses</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending Review</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        {/* Approval status filter */}
        <div>
          <label htmlFor="approvalStatus" className="block text-sm font-medium text-dark-grey mb-1">
            Approval Status
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
            <option value="">All</option>
            <option value="true">Approved</option>
            <option value="false">Not Approved</option>
          </select>
        </div>
      </div>
      
      {/* Filter actions */}
      <div className="flex justify-end mt-4 space-x-2">
        <button
          onClick={handleResetFilters}
          className="px-4 py-2 border border-gray-300 rounded-md text-medium-grey hover:bg-gray-50"
        >
          Reset
        </button>
        <button
          onClick={handleApplyFilters}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default DoctorFilters; 