'use client';

import { useState, useEffect } from 'react';
import { useAdminMetrics } from '@/hooks/useAdminMetrics';
import KPICard from './KPICard';

const LineChart = ({ data }: { data: { date: string; count: number }[] }) => {
  // Calculate maximum value for scaling
  const maxCount = Math.max(...data.map(item => item.count));
  const minCount = Math.min(...data.map(item => item.count));

  // If no data or all values are the same, provide default scaling
  const yScale = maxCount === minCount 
    ? (value: number) => 50 // Fixed height if all values are the same
    : (value: number) => 100 - ((value - minCount) / (maxCount - minCount)) * 80;

  // Chart dimensions
  const width = data.length > 1 ? 100 / (data.length - 1) : 100;

  return (
    <div className="h-40 w-full relative">
      {/* Y-axis indicator lines */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
        <div className="h-px w-full bg-light-grey opacity-50"></div>
        <div className="h-px w-full bg-light-grey opacity-50"></div>
        <div className="h-px w-full bg-light-grey opacity-50"></div>
      </div>
      
      {/* Line chart */}
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Line connecting data points */}
        <polyline
          points={data.map((item, index) => `${index * width},${yScale(item.count)}`).join(' ')}
          stroke="#007AFF"
          strokeWidth="2"
          fill="none"
        />
        
        {/* Gradient area under the line */}
        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#007AFF" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#007AFF" stopOpacity="0" />
        </linearGradient>
        
        <polygon
          points={`
            ${data.map((item, index) => `${index * width},${yScale(item.count)}`).join(' ')}
            ${(data.length - 1) * width},100 0,100
          `}
          fill="url(#gradient)"
        />
        
        {/* Data points */}
        {data.map((item, index) => (
          <circle
            key={index}
            cx={index * width}
            cy={yScale(item.count)}
            r="2"
            fill="#007AFF"
            stroke="#FFF"
            strokeWidth="1"
          />
        ))}
      </svg>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-2 text-xs text-medium-grey">
        {data.map((item, index) => (
          <div key={index}>
            {new Date(item.date).toLocaleDateString('es-ES', { weekday: 'short' })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function KPIBookingsPerDay() {
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
  const bookingsData = data?.bookingsByDay || [
    { date: '2023-06-01', count: 5 },
    { date: '2023-06-02', count: 8 },
    { date: '2023-06-03', count: 12 },
    { date: '2023-06-04', count: 6 },
    { date: '2023-06-05', count: 15 },
    { date: '2023-06-06', count: 11 },
    { date: '2023-06-07', count: 9 }
  ];
  
  // Calculate total bookings
  const totalBookings = bookingsData.reduce((sum, item) => sum + item.count, 0);
  
  // Calculate trend percentage (compare last day with first day)
  const firstDayCount = bookingsData[0]?.count || 0;
  const lastDayCount = bookingsData[bookingsData.length - 1]?.count || 0;
  const trendPercentage = firstDayCount === 0 
    ? 100 
    : Math.round(((lastDayCount - firstDayCount) / firstDayCount) * 100);
  
  return (
    <KPICard
      title="Reservas por día"
      loading={loading && !data}
      error={error}
      onRetry={handleRetry}
    >
      <LineChart data={bookingsData} />
      
      <div className="mt-6 flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold">{totalBookings}</p>
          <p className="text-medium-grey text-sm">Total de reservas</p>
        </div>
        
        <div className={`text-sm flex items-center ${trendPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trendPercentage >= 0 ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M12 19L19 12M12 19L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          <span className="ml-1">{Math.abs(trendPercentage)}%</span>
        </div>
      </div>
    </KPICard>
  );
} 