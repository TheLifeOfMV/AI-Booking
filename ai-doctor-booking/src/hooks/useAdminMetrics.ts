'use client';

import { useState, useEffect } from 'react';

// Types for the metrics data
export interface AdminMetricsData {
  bookingsByDay: {
    date: string;
    count: number;
  }[];
  utilization: {
    bookedSlots: number;
    totalSlots: number;
  };
}

export function useAdminMetrics(days: number = 7) {
  const [data, setData] = useState<AdminMetricsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the actual API endpoint
      const response = await fetch(`/api/admin/metrics?days=${days}`);
      
      // Check if the response is ok
      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      setData(responseData);
    } catch (err) {
      console.error('Error fetching admin metrics:', err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      
      // Fallback to mock data in case of error (for demo purposes)
      setData({
        bookingsByDay: [
          { date: '2023-06-01', count: 5 },
          { date: '2023-06-02', count: 8 },
          { date: '2023-06-03', count: 12 },
          { date: '2023-06-04', count: 6 },
          { date: '2023-06-05', count: 15 },
          { date: '2023-06-06', count: 11 },
          { date: '2023-06-07', count: 9 }
        ],
        utilization: {
          bookedSlots: 386,
          totalSlots: 560
        }
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchMetrics();
    
    // Set up a refresh interval (every 30 seconds)
    const intervalId = setInterval(fetchMetrics, 30000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [days]);
  
  // Function to manually refetch data
  const refetch = () => {
    fetchMetrics();
  };
  
  return {
    data,
    loading,
    error,
    refetch
  };
} 