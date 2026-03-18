'use client';

import { useState, useEffect } from 'react';

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
      const response = await fetch(`/api/admin/metrics?days=${days}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.status}`);
      }
      const responseData = await response.json();
      setData(responseData);
    } catch (err) {
      console.error('Error fetching admin metrics:', err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const intervalId = setInterval(fetchMetrics, 30000);
    return () => clearInterval(intervalId);
  }, [days]);

  const refetch = () => {
    fetchMetrics();
  };

  return { data, loading, error, refetch };
}
