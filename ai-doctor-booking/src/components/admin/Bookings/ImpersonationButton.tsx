'use client';

import { useState } from 'react';
import { useAdminBookingsContext } from '@/context/AdminBookingsProvider';

interface ImpersonationButtonProps {
  userId: string;
  userName: string;
}

export default function ImpersonationButton({ userId, userName }: ImpersonationButtonProps) {
  const { impersonateUser } = useAdminBookingsContext();
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const handleImpersonate = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      const result = await impersonateUser(userId);
      
      if (result.success) {
        // In a real app, this would redirect to the user's view
        // For now, we'll just show a success message via an alert
        alert(result.message);
      }
    } catch (error) {
      console.error('Error impersonating user:', error);
      alert('Failed to impersonate user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="relative">
      <button
        className="text-medium-grey hover:text-primary transition-colors"
        aria-label={`Impersonate ${userName}`}
        onClick={handleImpersonate}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
        )}
      </button>
      
      {showTooltip && (
        <div className="absolute right-0 bottom-full mb-2 px-2 py-1 text-xs font-medium text-white bg-dark-grey rounded shadow-lg whitespace-nowrap z-10">
          Impersonate {userName}
          <div className="absolute bottom-0 right-[9px] transform translate-y-1/2 rotate-45 w-2 h-2 bg-dark-grey"></div>
        </div>
      )}
    </div>
  );
} 