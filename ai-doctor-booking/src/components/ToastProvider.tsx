"use client";

import React, { createContext, useContext } from 'react';
import { useToast as useToastHook, ToastType } from '@/hooks/useToast';

// Define toast context type
interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => string;
  removeToast: (id: string) => void;
}

// Create context with default values
const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * ToastProvider component
 * 
 * Provides toast notification functionality to the entire application
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast, removeToast, ToastContainer } = useToastHook();

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

/**
 * useToast hook for consuming toast context
 * 
 * Example:
 * const { showToast } = useToast();
 * showToast('success', 'Operation successful');
 */
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};

export default ToastProvider; 