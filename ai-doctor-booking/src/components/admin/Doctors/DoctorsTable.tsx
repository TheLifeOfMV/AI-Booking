"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Doctor, DoctorFilter, DoctorTableColumn, CredentialStatus } from '@/types/doctor';
import DoctorFilters from './DoctorFilters';
import CredentialStatusBadge from './CredentialStatusBadge';
import ApprovalToggle from './ApprovalToggle';
import DoctorEditModal from './DoctorEditModal';
import { useToast } from '@/hooks/useToast';

// Define the sortable fields type to include all possible column keys
type SortableFields = keyof Doctor | 'credentials.status' | 'actions';

/**
 * DoctorsTable component
 * 
 * Displays a searchable and filterable table of doctors with edit functionality
 */
const DoctorsTable: React.FC = () => {
  // State
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DoctorFilter>({});
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [sortField, setSortField] = useState<SortableFields | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [loadTime, setLoadTime] = useState<string | null>(null);
  
  // Hooks
  const { showToast } = useToast();
  
  // Table column definitions
  const columns: DoctorTableColumn[] = [
    { key: 'name', title: 'Name', sortable: true },
    { key: 'specialtyName', title: 'Specialty', sortable: true },
    { key: 'credentials.status', title: 'Credential Status' },
    { key: 'approvalStatus', title: 'Approved' },
    { key: 'experience', title: 'Experience' },
    { key: 'consultationFee', title: 'Fee', sortable: true },
    { key: 'actions', title: 'Actions', width: '100px' },
  ];
  
  // Fetch doctors data
  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      
      if (filters.specialtyId) {
        queryParams.append('specialtyId', filters.specialtyId);
      }
      
      if (filters.credentialStatus) {
        queryParams.append('credentialStatus', filters.credentialStatus);
      }
      
      if (filters.approvalStatus !== undefined) {
        queryParams.append('approvalStatus', filters.approvalStatus.toString());
      }
      
      // Fetch data from API
      const response = await fetch(`/api/admin/doctors?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch doctors');
      }
      
      const data = await response.json();
      
      setDoctors(data.doctors);
      setTotal(data.pagination.total);
      setLoadTime(data.metadata?.loadTime || null);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching doctors');
      showToast('error', 'Failed to load doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters, showToast]);
  
  // Initial data fetch
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);
  
  // Sort doctors client-side
  const sortedDoctors = React.useMemo(() => {
    if (!sortField || sortField === 'actions') return doctors;
    
    return [...doctors].sort((a, b) => {
      // Handle credential status sorting
      if (sortField === 'credentials.status') {
        const aValue = a.credentials.status;
        const bValue = b.credentials.status;
        
        // Custom sort order for credential status
        const statusOrder: Record<CredentialStatus, number> = {
          'verified': 1,
          'pending': 2,
          'rejected': 3
        };
        
        return sortDirection === 'asc' 
          ? statusOrder[aValue] - statusOrder[bValue]
          : statusOrder[bValue] - statusOrder[aValue];
      }
      
      // Regular sort for other fields
      const aValue = a[sortField as keyof Doctor];
      const bValue = b[sortField as keyof Doctor];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortDirection === 'asc'
        ? (aValue as number || 0) - (bValue as number || 0)
        : (bValue as number || 0) - (aValue as number || 0);
    });
  }, [doctors, sortField, sortDirection]);
  
  // Handle sort column click
  const handleSort = (key: SortableFields) => {
    if (key === 'actions') return;
    
    if (key === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and reset direction to asc
      setSortField(key);
      setSortDirection('asc');
    }
  };
  
  // Handle row click to open edit modal
  const handleRowClick = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsEditModalOpen(true);
  };
  
  // Handle approval toggle
  const handleApprovalToggle = async (doctor: Doctor, newStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/doctors/${doctor.id}/approval`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approved: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update approval status');
      }
      
      // Update local state optimistically
      setDoctors(prev => 
        prev.map(d => d.id === doctor.id ? { ...d, approvalStatus: newStatus } : d)
      );
      
      showToast('success', `Doctor ${newStatus ? 'approved' : 'unapproved'} successfully`);
      
    } catch (err: any) {
      // Revert optimistic update on error
      setDoctors(prev => 
        prev.map(d => d.id === doctor.id ? { ...d, approvalStatus: doctor.approvalStatus } : d)
      );
      
      showToast('error', err.message || 'Failed to update approval status');
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (newFilters: DoctorFilter) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page on filter change
  };
  
  // Handle edit modal close
  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedDoctor(null);
  };
  
  // Handle doctor update from modal
  const handleDoctorUpdate = (updatedDoctor: Doctor) => {
    setDoctors(prev => 
      prev.map(d => d.id === updatedDoctor.id ? updatedDoctor : d)
    );
    setIsEditModalOpen(false);
    setSelectedDoctor(null);
    showToast('success', 'Doctor updated successfully');
  };
  
  // Render loading state
  if (loading && !doctors.length) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-medium-grey">Loading doctors...</div>
      </div>
    );
  }
  
  // Render error state
  if (error && !doctors.length) {
    return (
      <div className="w-full min-h-[400px] flex flex-col items-center justify-center text-red-500">
        <p>{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
          onClick={() => fetchDoctors()}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      {/* Filters */}
      <div className="mb-6">
        <DoctorFilters onFilterChange={handleFilterChange} filters={filters} />
      </div>
      
      {/* Performance metrics */}
      {loadTime && (
        <div className="mb-2 text-xs text-medium-grey text-right">
          Load time: {loadTime}
        </div>
      )}
      
      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-light-grey">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-left text-xs font-medium text-dark-grey uppercase tracking-wider ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-200' : ''
                    } ${column.width ? `w-[${column.width}]` : ''}`}
                    onClick={() => column.sortable && handleSort(column.key as SortableFields)}
                  >
                    <div className="flex items-center">
                      {column.title}
                      {column.sortable && sortField === column.key && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedDoctors.length > 0 ? (
                sortedDoctors.map((doctor) => (
                  <tr 
                    key={doctor.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleRowClick(doctor)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {doctor.avatar ? (
                            <img
                              src={doctor.avatar}
                              alt={doctor.name}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <span className="text-medium-grey">
                              {doctor.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-dark-grey">
                            {doctor.name}
                          </div>
                          <div className="text-sm text-medium-grey">
                            {doctor.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-light-grey text-dark-grey">
                        {doctor.specialtyName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <CredentialStatusBadge status={doctor.credentials.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div onClick={(e) => e.stopPropagation()}>
                        <ApprovalToggle
                          doctor={doctor}
                          onToggle={handleApprovalToggle}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-grey">
                      {doctor.experience}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-grey">
                      ${doctor.consultationFee}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(doctor);
                        }}
                        className="text-primary hover:underline"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-4 text-center text-medium-grey">
                    No doctors found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-medium-grey">
            Showing {doctors.length > 0 ? (page - 1) * limit + 1 : 0} to{' '}
            {Math.min(page * limit, total)} of {total} results
          </div>
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 rounded ${
                page > 1
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-medium-grey cursor-not-allowed'
              }`}
              onClick={() => page > 1 && setPage(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </button>
            <button
              className={`px-3 py-1 rounded ${
                page < Math.ceil(total / limit)
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-medium-grey cursor-not-allowed'
              }`}
              onClick={() => page < Math.ceil(total / limit) && setPage(page + 1)}
              disabled={page >= Math.ceil(total / limit)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      
      {/* Edit Modal */}
      {selectedDoctor && (
        <DoctorEditModal
          isOpen={isEditModalOpen}
          doctor={selectedDoctor}
          onClose={handleEditModalClose}
          onSave={handleDoctorUpdate}
        />
      )}
    </div>
  );
};

export default DoctorsTable; 