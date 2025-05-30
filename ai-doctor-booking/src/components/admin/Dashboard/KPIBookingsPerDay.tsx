'use client';

import { useState, useEffect } from 'react';
import { useAdminMetrics } from '@/hooks/useAdminMetrics';
import KPICard from './KPICard';

const ModernBarChart = ({ data }: { data: { date: string; count: number }[] }) => {
  const [animationKey, setAnimationKey] = useState(0);
  const maxCount = Math.max(...data.map(item => item.count));
  
  // Trigger animation on data change
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [data]);

  return (
    <div className="h-48 w-full relative mb-4">
      {/* Background grid */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-px w-full bg-gray-100 opacity-60"></div>
        ))}
      </div>
      
      {/* Bar chart container */}
      <div className="flex items-end justify-between h-full gap-2 px-2">
        {data.map((item, index) => {
          const height = maxCount > 0 ? (item.count / maxCount) * 85 : 10;
          const dayName = new Date(item.date).toLocaleDateString('es-ES', { weekday: 'short' });
          
          return (
            <div key={`${animationKey}-${index}`} className="flex flex-col items-center flex-1 group">
              {/* Animated bar */}
              <div className="relative w-full flex justify-center mb-2">
                <div 
                  className="w-8 bg-gradient-to-t from-blue-500 via-blue-400 to-blue-300 rounded-t-lg shadow-lg 
                             transition-all duration-1000 ease-out transform group-hover:scale-110 
                             hover:shadow-xl relative overflow-hidden cursor-pointer"
                  style={{ 
                    height: `${height}%`,
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -top-10 bg-gradient-to-b from-white/40 via-white/20 to-transparent 
                                  w-full h-full transform -skew-x-12 transition-transform duration-1000 
                                  group-hover:translate-x-full"></div>
                  
                  {/* Value tooltip on hover */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 
                                  bg-gray-800 text-white text-xs px-2 py-1 rounded 
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                  whitespace-nowrap z-10">
                    {item.count} reservas
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 
                                    border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
              
              {/* Day label */}
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                {dayName}
              </div>
              
              {/* Count below */}
              <div className="text-xs text-gray-500 mt-1">
                {item.count}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StatCard = ({ 
  value, 
  label, 
  trend, 
  icon, 
  color = 'blue' 
}: { 
  value: number | string; 
  label: string; 
  trend?: number; 
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}) => {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 text-blue-600 border-blue-200',
    green: 'from-green-50 to-green-100 text-green-600 border-green-200',
    purple: 'from-purple-50 to-purple-100 text-purple-600 border-purple-200',
    orange: 'from-orange-50 to-orange-100 text-orange-600 border-orange-200'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} p-4 rounded-xl border transition-all duration-300 hover:shadow-md hover:scale-105`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-2xl font-bold">{value}</div>
        <div className="opacity-70">{icon}</div>
      </div>
      <div className="text-sm opacity-80 mb-1">{label}</div>
      {trend !== undefined && (
        <div className={`flex items-center text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? '↗' : '↘'} {Math.abs(trend)}%
        </div>
      )}
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
      }, 1000 * (retryCount + 1));
      
      return () => clearTimeout(timer);
    }
  }, [error, retryCount, refetch]);
  
  const handleRetry = () => {
    setRetryCount(0);
    refetch();
  };
  
  // Enhanced mock data with better values
  const bookingsData = data?.bookingsByDay || [
    { date: '2023-12-04', count: 15 },
    { date: '2023-12-05', count: 22 },
    { date: '2023-12-06', count: 18 },
    { date: '2023-12-07', count: 28 },
    { date: '2023-12-08', count: 31 },
    { date: '2023-12-09', count: 25 },
    { date: '2023-12-10', count: 19 }
  ];
  
  const totalBookings = bookingsData.reduce((sum, item) => sum + item.count, 0);
  const avgBookings = Math.round(totalBookings / bookingsData.length);
  const maxBookings = Math.max(...bookingsData.map(item => item.count));
  
  // Calculate weekly trend
  const firstHalf = bookingsData.slice(0, Math.ceil(bookingsData.length / 2));
  const secondHalf = bookingsData.slice(Math.ceil(bookingsData.length / 2));
  const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.count, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.count, 0) / secondHalf.length;
  const trendPercentage = Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100);

  return (
    <KPICard
      title="Reservas por día"
      period="Últimos 7 días"
      loading={loading && !data}
      error={error}
      onRetry={handleRetry}
    >
      <div className="space-y-6">
        {/* Modern bar chart */}
        <ModernBarChart data={bookingsData} />
        
        {/* Statistics cards grid */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            value={totalBookings}
            label="Total"
            trend={trendPercentage}
            color="blue"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          />
          
          <StatCard
            value={avgBookings}
            label="Promedio"
            color="green"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 11V17H15V11M4 15V9C4 8.44772 4.44772 8 5 8H19C19.5523 8 20 8.44772 20 9V15C20 15.5523 19.5523 16 19 16H5C4.44772 16 4 15.5523 4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          />
          
          <StatCard
            value={maxBookings}
            label="Máximo"
            color="purple"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          />
        </div>
      </div>
    </KPICard>
  );
} 