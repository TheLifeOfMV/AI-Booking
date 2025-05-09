"use client";

import React, { useState } from 'react';
import { Doctor } from '@/types/doctor';

interface ApprovalToggleProps {
  doctor: Doctor;
  onToggle: (doctor: Doctor, newStatus: boolean) => Promise<void>;
}

/**
 * Toggle switch component for doctor approval status
 * with loading and error states
 */
const ApprovalToggle: React.FC<ApprovalToggleProps> = ({ doctor, onToggle }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Local state to track the visual state of the toggle
  const [isApproved, setIsApproved] = useState(doctor.approvalStatus);
  
  const handleToggleClick = () => {
    // If already loading, do nothing
    if (isLoading) return;
    
    // If this is turning off approval, show confirmation dialog
    if (isApproved) {
      setShowConfirm(true);
    } else {
      // Otherwise proceed directly
      handleConfirmedToggle();
    }
  };
  
  const handleConfirmedToggle = async () => {
    setShowConfirm(false);
    setIsLoading(true);
    setHasError(false);
    
    const newStatus = !isApproved;
    
    try {
      // Update the local state optimistically
      setIsApproved(newStatus);
      
      // Call the actual toggle function
      await onToggle(doctor, newStatus);
      
    } catch (error) {
      // Revert on error
      setIsApproved(isApproved);
      setHasError(true);
      
      // Auto-clear error state after 3 seconds
      setTimeout(() => {
        setHasError(false);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelToggle = () => {
    setShowConfirm(false);
  };
  
  return (
    <div className="flex items-center">
      {/* Toggle switch */}
      <button
        onClick={handleToggleClick}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full 
          transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          ${isApproved ? 'bg-primary' : 'bg-gray-300'}
          ${hasError ? 'border-2 border-red-500' : ''}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        disabled={isLoading}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${isApproved ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
      
      {/* Status text */}
      <span className={`ml-2 text-sm ${isApproved ? 'text-green-600' : 'text-medium-grey'}`}>
        {isLoading ? 'Updating...' : isApproved ? 'Approved' : 'Not Approved'}
      </span>
      
      {/* Error message */}
      {hasError && (
        <div className="ml-2 text-xs text-red-500">
          Failed to update
        </div>
      )}
      
      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <h3 className="text-lg font-medium text-dark-grey mb-4">Confirm Unapproval</h3>
            <p className="text-medium-grey mb-6">
              Are you sure you want to unapprove {doctor.name}? 
              This will remove them from the booking system and patients won't be able to book appointments.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancelToggle}
                className="px-4 py-2 bg-gray-200 text-dark-grey rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmedToggle}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Unapprove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalToggle; 