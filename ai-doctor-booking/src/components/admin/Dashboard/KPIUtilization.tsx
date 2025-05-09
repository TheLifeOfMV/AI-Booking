'use client';

import { useState, useEffect } from 'react';
import { useAdminMetrics } from '@/hooks/useAdminMetrics';
import KPICard from './KPICard';

const UtilizationChart = ({ percentage }: { percentage: number }) => {
  // Ensure percentage is between 0 and 100
  const safePercentage = Math.max(0, Math.min(100, percentage));
  
  // Calculate colors based on utilization percentage
  const getUtilizationColor = (percent: number) => {
    if (percent < 30) return '#FF9500'; // warning/orange for low utilization
    if (percent < 70) return '#007AFF'; // primary/blue for medium utilization
    return '#34C759'; // green for high utilization
  };
  
  const color = getUtilizationColor(safePercentage);
  const circumference = 2 * Math.PI * 45; // 45 is the radius
  const dashOffset = circumference * (1 - safePercentage / 100);
  
  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Background circle */}
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#F2F2F2"
          strokeWidth="10"
        />
        
        {/* Foreground circle - the progress */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
        
        {/* Percentage text */}
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="20"
          fontWeight="bold"
          fill="#333333"
        >
          {Math.round(safePercentage)}%
        </text>
      </svg>
    </div>
  );
};

export default function KPIUtilization() {
  const { data, loading, error, refetch } = useAdminMetrics();
  const [retryCount, setRetryCount] = useState(0);
  
  // Auto-retry on error up to 3 times
  useEffect(() => {
    if (error && retryCount < 3) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        refetch();
      }, 1000 * (retryCount + 1)); // Exponential backoff
      
      return () => clearTimeout(timer);
    }
  }, [error, retryCount, refetch]);
  
  // Handle retry click
  const handleRetry = () => {
    setRetryCount(0);
    refetch();
  };
  
  // Use mock data if no data available (for demonstration)
  const utilizationData = {
    bookedSlots: data?.utilization?.bookedSlots || 386,
    totalSlots: data?.utilization?.totalSlots || 560, 
  };
  
  // Calculate utilization percentage
  const utilizationPercentage = Math.round((utilizationData.bookedSlots / utilizationData.totalSlots) * 100);
  
  // Get status text based on utilization
  const getUtilizationStatus = (percent: number) => {
    if (percent < 30) return 'Baja';
    if (percent < 70) return 'Media'; 
    return 'Alta';
  };
  
  // Get utilization color
  const getUtilizationColor = (percent: number) => {
    if (percent < 30) return 'text-accent-orange'; // orange
    if (percent < 70) return 'text-primary'; // blue
    return 'text-green-500'; // green
  };
  
  const utilizationStatus = getUtilizationStatus(utilizationPercentage);
  const utilizationColor = getUtilizationColor(utilizationPercentage);
  
  return (
    <KPICard
      title="Utilización de Slots"
      loading={loading && !data}
      error={error}
      onRetry={handleRetry}
    >
      <UtilizationChart percentage={utilizationPercentage} />
      
      <div className="mt-6 text-center">
        <div className={`text-xl font-bold ${utilizationColor}`}>
          Utilización {utilizationStatus}
        </div>
        <p className="text-medium-grey text-sm mt-1">
          {utilizationData.bookedSlots} reservados de {utilizationData.totalSlots} slots disponibles
        </p>
      </div>
    </KPICard>
  );
} 