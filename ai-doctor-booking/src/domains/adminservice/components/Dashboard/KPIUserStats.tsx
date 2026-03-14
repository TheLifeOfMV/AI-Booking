'use client';

import React, { useState, useEffect } from 'react';
import KPICard from './KPICard';

interface UserStatsData {
  totalUsers: number;
  activeUsers: number;
  totalDoctors: number;
  activeDoctors: number;
  userGrowth: number;
  doctorGrowth: number;
  activityRate: number;
}

export default function KPIUserStats() {
  const [data, setData] = useState<UserStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Simulate data fetching
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true);
        // Simulated API call with delay
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Mock data - in real app this would come from an API
        const mockData: UserStatsData = {
          totalUsers: 2847,
          activeUsers: 1923,
          totalDoctors: 89,
          activeDoctors: 67,
          userGrowth: 8.3,
          doctorGrowth: 15.2,
          activityRate: 67.5
        };
        
        setData(mockData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Trigger refetch
    setTimeout(() => {
      setData({
        totalUsers: 2847,
        activeUsers: 1923,
        totalDoctors: 89,
        activeDoctors: 67,
        userGrowth: 8.3,
        doctorGrowth: 15.2,
        activityRate: 67.5
      });
      setLoading(false);
    }, 1200);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  return (
    <KPICard
      title="Usuarios y Especialistas"
      period="Estado actual"
      loading={loading}
      error={error}
      onRetry={handleRetry}
    >
      {data && (
        <div className="flex flex-col h-full">
          {/* Main Stats Display */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Users Stats */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold text-purple-600">
                  {formatNumber(data.totalUsers)}
                </div>
                <div className="text-purple-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20 8V14M23 11H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div className="text-xs text-purple-600/70 mb-1">Usuarios totales</div>
              <div className="text-sm font-medium text-purple-600">
                {formatNumber(data.activeUsers)} activos
              </div>
            </div>

            {/* Doctors Stats */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold text-emerald-600">
                  {formatNumber(data.totalDoctors)}
                </div>
                <div className="text-emerald-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.5 14.25V11.625C19.5 9.76104 17.989 8.25 16.125 8.25H14.625C14.004 8.25 13.5 7.746 13.5 7.125V5.625C13.5 3.76104 11.989 2.25 10.125 2.25H8.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4.5 12.75H19.5M8.25 17.25H12M10.125 2.25H5.625C5.004 2.25 4.5 2.754 4.5 3.375V20.625C4.5 21.246 5.004 21.75 5.625 21.75H18.375C18.996 21.75 19.5 21.246 19.5 20.625V11.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div className="text-xs text-emerald-600/70 mb-1">Especialistas totales</div>
              <div className="text-sm font-medium text-emerald-600">
                {formatNumber(data.activeDoctors)} activos
              </div>
            </div>
          </div>

          {/* Growth Indicators */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-medium-grey">Crecimiento usuarios</span>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                data.userGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {data.userGrowth >= 0 ? '↗' : '↘'} {Math.abs(data.userGrowth)}%
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-medium-grey">Crecimiento doctores</span>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                data.doctorGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {data.doctorGrowth >= 0 ? '↗' : '↘'} {Math.abs(data.doctorGrowth)}%
              </div>
            </div>
          </div>

          {/* Activity Rate */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-medium-grey">Tasa de actividad general</span>
              <span className="text-lg font-bold text-primary">{data.activityRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-purple-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${data.activityRate}%` }}
              ></div>
            </div>
          </div>

          {/* Quick Summary */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-medium-grey">Estado de la plataforma</span>
              <span className="font-medium text-green-600">✓ Saludable</span>
            </div>
          </div>
        </div>
      )}
    </KPICard>
  );
} 