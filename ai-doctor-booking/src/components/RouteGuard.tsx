'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

// Routes that don't require authentication
const publicRoutes = ['/login', '/intro', '/', '/admin/login', '/doctor/register/success'];

// Routes that require specific roles
const roleRestrictedRoutes = [
  { path: '/patient', roles: ['patient', 'client', 'admin'] },
  { path: '/doctor', roles: ['doctor', 'admin'] },
  { path: '/admin', roles: ['admin'] }
];

interface RouteGuardProps {
  children: ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  
  useEffect(() => {
    // Allow all doctor registration routes without authentication
    if (pathname.startsWith('/doctor/register')) {
      return;
    }
    
    // Check if route requires authentication
    const requiresAuth = !publicRoutes.includes(pathname);
    
    // If route requires auth and user is not authenticated, redirect to login
    if (requiresAuth && !isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // If already logged in and on login page, redirect to channel page
    if (isAuthenticated && pathname === '/login') {
      router.push('/channel');
      return;
    }

    // Check for role-based restrictions
    if (isAuthenticated && user) {
      for (const route of roleRestrictedRoutes) {
        if (pathname.startsWith(route.path) && !route.roles.includes(user.role || '')) {
          // User doesn't have the required role for this path
          router.push('/channel'); // Redirect to a default authorized page
          return;
        }
      }
    }
  }, [pathname, isAuthenticated, router, user]);
  
  return <>{children}</>;
} 