'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/platform/store/authStore';

interface AuthInitializerProps {
  children: React.ReactNode;
}

export default function AuthInitializer({ children }: AuthInitializerProps) {
  const { initializeAuth } = useAuthStore();
  
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);
  
  return <>{children}</>;
} 