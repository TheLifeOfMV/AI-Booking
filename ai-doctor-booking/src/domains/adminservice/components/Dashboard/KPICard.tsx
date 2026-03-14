'use client';

import { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  period?: string;
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  children: ReactNode;
}

export default function KPICard({
  title,
  period = 'Últimos 7 días',
  loading = false,
  error = null,
  onRetry,
  children
}: KPICardProps) {
  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="text-xs bg-light-grey text-medium-grey px-2 py-1 rounded">{period}</div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center w-full">
            <div className="bg-light-grey h-40 rounded w-full mb-4"></div>
            <div className="bg-light-grey h-6 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="text-xs bg-light-grey text-medium-grey px-2 py-1 rounded">{period}</div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-medium-grey mb-2">
            <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="text-medium-grey mb-2">Error al cargar los datos</p>
          {onRetry && (
            <button 
              onClick={onRetry}
              className="text-primary text-sm hover:underline"
            >
              Reintentar
            </button>
          )}
        </div>
      </div>
    );
  }
  
  // Default state (data loaded)
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="text-xs bg-light-grey text-medium-grey px-2 py-1 rounded">{period}</div>
      </div>
      
      {children}
    </div>
  );
} 