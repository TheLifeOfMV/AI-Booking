"use client";

import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

/**
 * Simple hook for showing toast notifications
 * In a real app, this would connect to a global toast system
 */
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now().toString();
    
    // In a real app, this would display a toast notification
    // For now, we'll just log to console
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Add toast to state
    setToasts(prev => [...prev, { id, type, message }]);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
    
    return id;
  }, []);
  
  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);
  
  return {
    toasts,
    showToast,
    hideToast
  };
}; 