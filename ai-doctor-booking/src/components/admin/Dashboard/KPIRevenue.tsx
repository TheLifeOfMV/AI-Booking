'use client';

import React, { useState, useEffect } from 'react';
import KPICard from './KPICard';

interface RevenueData {
  monthlyRevenue: number;
  totalRevenue: number;
  monthlyGrowth: number;
  subscriptionsCount: number;
  averageRevenue: number;
}

export default function KPIRevenue() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Simulate data fetching
  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        // Simulated API call with delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - in real app this would come from an API
        const mockData: RevenueData = {
          monthlyRevenue: 185420000,
          totalRevenue: 1267890000,
          monthlyGrowth: 12.5,
          subscriptionsCount: 156,
          averageRevenue: 1188000
        };
        
        setData(mockData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Trigger refetch
    setTimeout(() => {
      setData({
        monthlyRevenue: 185420000,
        totalRevenue: 1267890000,
        monthlyGrowth: 12.5,
        subscriptionsCount: 156,
        averageRevenue: 1188000
      });
      setLoading(false);
    }, 1000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <KPICard
      title="Ingresos por Suscripciones"
      period="Mes actual"
      loading={loading}
      error={error}
      onRetry={handleRetry}
    >
      {data && (
        <div className="flex flex-col h-full">
          {/* Main Revenue Display */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {formatCurrency(data.monthlyRevenue)}
              </div>
              <div className="text-sm text-medium-grey">Ingresos mensuales</div>
            </div>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
              data.monthlyGrowth >= 0 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {data.monthlyGrowth >= 0 ? '↗' : '↘'} {Math.abs(data.monthlyGrowth)}%
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {formatCurrency(data.totalRevenue)}
              </div>
              <div className="text-xs text-blue-600/70">Ingresos totales</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {formatCurrency(data.averageRevenue)}
              </div>
              <div className="text-xs text-green-600/70">Ingreso promedio</div>
            </div>
          </div>

          {/* Subscription Metrics */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-sm text-medium-grey">Suscripciones activas</span>
            </div>
            <div className="font-semibold text-gray-900">{data.subscriptionsCount}</div>
          </div>

          {/* Revenue Trend Indicator */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-medium-grey">Tendencia</span>
              <span className="font-medium text-primary">Crecimiento sostenido</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-primary to-blue-500 h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(data.monthlyGrowth * 5, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </KPICard>
  );
} 