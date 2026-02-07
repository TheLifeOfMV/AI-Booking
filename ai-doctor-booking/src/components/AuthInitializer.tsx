'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { isTestingMode, logTestingMode } from '@/config/testing';

interface AuthInitializerProps {
  children: React.ReactNode;
}

/**
 * AuthInitializer Component
 * 
 * This client component initializes the authentication state
 * by hydrating from localStorage when the app loads.
 * 
 * It must be a client component because it uses useEffect
 * and interacts with localStorage.
 */
export default function AuthInitializer({ children }: AuthInitializerProps) {
  const { initializeAuth } = useAuthStore();
  
  useEffect(() => {
    if (isTestingMode()) {
      logTestingMode('AuthInitializer: Skipping auth initialization in testing mode');
      return;
    }
    
    // Initialize auth state on app load
    initializeAuth();
  }, [initializeAuth]);
  
  return <>{children}</>;
} 