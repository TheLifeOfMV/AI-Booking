'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

// Routes that don't require authentication
const publicRoutes = ['/login', '/intro', '/'];

interface RouteGuardProps {
  children: ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    // Check if route requires authentication
    const requiresAuth = !publicRoutes.includes(pathname);
    
    // If route requires auth and user is not authenticated, redirect to login
    if (requiresAuth && !isAuthenticated) {
      router.push('/login');
    }
    
    // If already logged in and on login page, redirect to channel page
    if (isAuthenticated && pathname === '/login') {
      router.push('/channel');
    }
  }, [pathname, isAuthenticated, router]);
  
  return <>{children}</>;
} 