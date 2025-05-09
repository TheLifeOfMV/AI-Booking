'use client';

import { useState } from 'react';
import { useAdminBookingsContext } from '@/context/AdminBookingsProvider';

export default function BulkActionButtons() {
  const { selectedBookingIds, bulkCancelBookings, bulkRefundBookings } = useAdminBookingsContext();
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const [actionResult, setActionResult] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning';
  } | null>(null);
  
  // Clear action result after delay
  const clearActionResult = () => {
    setTimeout(() => {
      setActionResult(null);
    }, 5000);
  };
  
  // Handle bulk cancel
  const handleBulkCancel = async () => {
    if (selectedBookingIds.length === 0) {
      setActionResult({
        message: 'Please select at least one booking to cancel',
        type: 'warning'
      });
      clearActionResult();
      return;
    }
    
    const confirmCancel = window.confirm(
      `Are you sure you want to cancel ${selectedBookingIds.length} booking(s)? This action cannot be undone.`
    );
    
    if (!confirmCancel) return;
    
    try {
      setIsCancelling(true);
      const result = await bulkCancelBookings();
      
      if (result.success) {
        setActionResult({
          message: result.message,
          type: 'success'
        });
      } else {
        setActionResult({
          message: result.message,
          type: 'error'
        });
      }
    } catch (error) {
      setActionResult({
        message: 'An error occurred while cancelling bookings',
        type: 'error'
      });
    } finally {
      setIsCancelling(false);
      clearActionResult();
    }
  };
  
  // Handle bulk refund
  const handleBulkRefund = async () => {
    if (selectedBookingIds.length === 0) {
      setActionResult({
        message: 'Please select at least one booking to refund',
        type: 'warning'
      });
      clearActionResult();
      return;
    }
    
    const confirmRefund = window.confirm(
      `Are you sure you want to refund ${selectedBookingIds.length} booking(s)? This action cannot be undone.`
    );
    
    if (!confirmRefund) return;
    
    try {
      setIsRefunding(true);
      const result = await bulkRefundBookings();
      
      if (result.success) {
        setActionResult({
          message: result.message,
          type: 'success'
        });
      } else {
        setActionResult({
          message: result.message,
          type: 'error'
        });
      }
    } catch (error) {
      setActionResult({
        message: 'An error occurred while refunding bookings',
        type: 'error'
      });
    } finally {
      setIsRefunding(false);
      clearActionResult();
    }
  };
  
  return (
    <div className="relative">
      <div className="flex space-x-2">
        <button
          type="button"
          className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          onClick={handleBulkCancel}
          disabled={isCancelling || selectedBookingIds.length === 0}
        >
          {isCancelling ? (
            <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
          Bulk Cancel
        </button>
        
        <button
          type="button"
          className="px-4 py-2 bg-accent-orange text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          onClick={handleBulkRefund}
          disabled={isRefunding || selectedBookingIds.length === 0}
        >
          {isRefunding ? (
            <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          )}
          Bulk Refund
        </button>
      </div>
      
      {actionResult && (
        <div 
          className={`absolute right-0 top-full mt-2 p-3 rounded-md shadow-md text-sm z-10 w-64 ${
            actionResult.type === 'success' ? 'bg-green-50 text-green-800' :
            actionResult.type === 'error' ? 'bg-red-50 text-red-800' :
            'bg-yellow-50 text-yellow-800'
          }`}
        >
          <div className="flex items-start">
            {actionResult.type === 'success' && (
              <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            
            {actionResult.type === 'error' && (
              <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            
            {actionResult.type === 'warning' && (
              <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            
            <p>{actionResult.message}</p>
          </div>
          
          <button
            type="button"
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
            onClick={() => setActionResult(null)}
          >
            <span className="sr-only">Close</span>
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
      
      <div className="mt-2 text-xs text-medium-grey">
        {selectedBookingIds.length > 0 ? (
          <span>Selected: {selectedBookingIds.length} booking(s)</span>
        ) : (
          <span>Select bookings to perform bulk actions</span>
        )}
      </div>
    </div>
  );
} 