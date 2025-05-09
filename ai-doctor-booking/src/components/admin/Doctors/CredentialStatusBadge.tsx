"use client";

import React from 'react';
import { CredentialStatus } from '@/types/doctor';

interface CredentialStatusBadgeProps {
  status: CredentialStatus;
}

/**
 * Badge component to display credential status with different styles
 */
const CredentialStatusBadge: React.FC<CredentialStatusBadgeProps> = ({ status }) => {
  // Define styles based on status
  const getStatusStyles = () => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Define status display text
  const getStatusText = () => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'pending':
        return 'Pending Review';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };
  
  // Define status icon
  const getStatusIcon = () => {
    switch (status) {
      case 'verified':
        return '✓';
      case 'pending':
        return '⏳';
      case 'rejected':
        return '✗';
      default:
        return '?';
    }
  };
  
  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles()}`}>
      <span className="mr-1">{getStatusIcon()}</span>
      {getStatusText()}
    </div>
  );
};

export default CredentialStatusBadge; 