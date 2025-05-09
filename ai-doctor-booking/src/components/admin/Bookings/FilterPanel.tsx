'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminBookingsContext } from '@/context/AdminBookingsProvider';
import { BookingStatus } from '@/types/admin';

export default function FilterPanel() {
  const { filters, updateFilters, resetFilters } = useAdminBookingsContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<BookingStatus[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Status options
  const statusOptions: { value: BookingStatus; label: string }[] = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'no-show', label: 'No-show' }
  ];
  
  // Apply filters function - memoize to prevent infinite loops
  const applyFilters = useCallback(() => {
    const newFilters: any = {};
    
    if (searchTerm) {
      newFilters.searchTerm = searchTerm;
    }
    
    if (selectedStatuses.length > 0) {
      newFilters.status = selectedStatuses;
    }
    
    if (startDate && endDate) {
      newFilters.dateRange = {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      };
    }
    
    updateFilters(newFilters);
  }, [searchTerm, selectedStatuses, startDate, endDate, updateFilters]);
  
  // Handle status toggle with memoization
  const toggleStatus = useCallback((status: BookingStatus) => {
    setSelectedStatuses(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  }, []);
  
  // Handle search on enter key
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };
  
  // Clear all filters
  const handleClearAll = () => {
    setSearchTerm('');
    setSelectedStatuses([]);
    setStartDate('');
    setEndDate('');
    resetFilters();
  };
  
  // Apply filters when selectedStatuses changes, but avoid initial empty array trigger
  useEffect(() => {
    // Skip the initial render when selectedStatuses is empty
    if (selectedStatuses.length > 0) {
      applyFilters();
    }
  }, [selectedStatuses, applyFilters]);
  
  return (
    <div className="bg-white rounded-lg border border-light-grey shadow-sm p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Search Input */}
        <div className="flex-grow">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-medium-grey" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-light-grey rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-sm"
              placeholder="Search bookings by ID, patient, or doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
        </div>

        {/* Filter Toggle Button (Mobile) */}
        <div className="lg:hidden">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-light-grey rounded-md shadow-sm text-sm font-medium bg-white text-dark-grey hover:bg-light-grey focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            Filters {isExpanded ? '▲' : '▼'}
          </button>
        </div>
        
        {/* Date Range (Desktop) */}
        <div className="hidden lg:flex space-x-3 items-center">
          <div className="flex items-center">
            <span className="text-sm text-dark-grey mr-2">From:</span>
            <input
              type="date"
              className="border border-light-grey rounded-md shadow-sm text-sm p-2 focus:outline-none focus:ring-primary focus:border-primary"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <span className="text-sm text-dark-grey mr-2">To:</span>
            <input
              type="date"
              className="border border-light-grey rounded-md shadow-sm text-sm p-2 focus:outline-none focus:ring-primary focus:border-primary"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        
        {/* Status Filter Buttons (Desktop) */}
        <div className="hidden lg:flex space-x-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                selectedStatuses.includes(option.value)
                  ? 'bg-primary text-white'
                  : 'bg-light-grey text-dark-grey hover:bg-light-grey/80'
              }`}
              onClick={() => toggleStatus(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        
        {/* Apply Filters (Desktop) */}
        <div className="hidden lg:flex space-x-2">
          <button
            type="button"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            onClick={applyFilters}
          >
            Apply Filters
          </button>
          <button
            type="button"
            className="px-4 py-2 border border-light-grey rounded-md shadow-sm text-sm font-medium bg-white text-dark-grey hover:bg-light-grey focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            onClick={handleClearAll}
          >
            Clear All
          </button>
        </div>
      </div>
      
      {/* Expanded Mobile Filters */}
      {isExpanded && (
        <div className="mt-4 space-y-4 lg:hidden">
          {/* Mobile Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-dark-grey mb-1">From:</label>
              <input
                type="date"
                className="w-full border border-light-grey rounded-md shadow-sm text-sm p-2 focus:outline-none focus:ring-primary focus:border-primary"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-grey mb-1">To:</label>
              <input
                type="date"
                className="w-full border border-light-grey rounded-md shadow-sm text-sm p-2 focus:outline-none focus:ring-primary focus:border-primary"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          
          {/* Mobile Status Filter */}
          <div>
            <label className="block text-sm font-medium text-dark-grey mb-2">Status:</label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    selectedStatuses.includes(option.value)
                      ? 'bg-primary text-white'
                      : 'bg-light-grey text-dark-grey hover:bg-light-grey/80'
                  }`}
                  onClick={() => toggleStatus(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Mobile Filter Actions */}
          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              onClick={applyFilters}
            >
              Apply Filters
            </button>
            <button
              type="button"
              className="flex-1 px-4 py-2 border border-light-grey rounded-md shadow-sm text-sm font-medium bg-white text-dark-grey hover:bg-light-grey focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              onClick={handleClearAll}
            >
              Clear All
            </button>
          </div>
        </div>
      )}
      
      {/* Active Filters Display */}
      {(selectedStatuses.length > 0 || (startDate && endDate) || searchTerm) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-medium-grey">Active filters:</span>
          
          {searchTerm && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-light-grey text-dark-grey">
              Search: {searchTerm}
              <button 
                type="button" 
                className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-medium-grey hover:text-dark-grey focus:outline-none"
                onClick={() => setSearchTerm('')}
              >
                <span className="sr-only">Remove search filter</span>
                <svg className="h-2 w-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </span>
          )}
          
          {startDate && endDate && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-light-grey text-dark-grey">
              Date: {startDate} to {endDate}
              <button 
                type="button" 
                className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-medium-grey hover:text-dark-grey focus:outline-none"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  updateFilters({ dateRange: undefined });
                }}
              >
                <span className="sr-only">Remove date filter</span>
                <svg className="h-2 w-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </span>
          )}
          
          {selectedStatuses.map((status) => (
            <span 
              key={status}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-light-grey text-dark-grey"
            >
              Status: {status.charAt(0).toUpperCase() + status.slice(1)}
              <button 
                type="button" 
                className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-medium-grey hover:text-dark-grey focus:outline-none"
                onClick={() => toggleStatus(status)}
              >
                <span className="sr-only">Remove {status} filter</span>
                <svg className="h-2 w-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
} 