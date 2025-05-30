'use client';

import { ReactNode, useEffect, useState } from 'react';
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
  const { isAuthenticated, user, initializeAuth } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
    setIsInitialized(true);
  }, [initializeAuth]);
  
  useEffect(() => {
    // Don't run route checks until auth is initialized
    if (!isInitialized) {
      console.log('RouteGuard: Waiting for auth initialization...');
      return;
    }
    
    console.log('RouteGuard: Auth check -', { 
      pathname, 
      isAuthenticated, 
      userRole: user?.role,
      isInitialized 
    });
    
    // Allow all doctor registration routes without authentication
    if (pathname.startsWith('/doctor/register')) {
      console.log('RouteGuard: Allowing doctor registration route');
      return;
    }
    
    // Check if route requires authentication
    const requiresAuth = !publicRoutes.includes(pathname);
    console.log('RouteGuard: Route analysis -', { 
      pathname, 
      requiresAuth, 
      isAuthenticated,
      publicRoutes: publicRoutes.includes(pathname)
    });
    
    // If route requires auth and user is not authenticated, redirect to login
    if (requiresAuth && !isAuthenticated) {
      console.log('RouteGuard: Redirecting to login - not authenticated');
      router.push('/login');
      return;
    }
    
    // If already logged in and on login page, redirect to appropriate page
    if (isAuthenticated && pathname === '/login') {
      console.log('RouteGuard: User authenticated, redirecting from login page');
      if (user?.role === 'doctor') {
        router.push('/doctor/dashboard');
      } else {
        router.push('/channel');
      }
      return;
    }

    // Check for role-based restrictions
    if (isAuthenticated && user) {
      for (const route of roleRestrictedRoutes) {
        if (pathname.startsWith(route.path) && !route.roles.includes(user.role || '')) {
          // User doesn't have the required role for this path
          console.log(`RouteGuard: Access denied for role ${user.role} to ${pathname}`);
          
          // Redirect based on user role
          if (user.role === 'doctor') {
            router.push('/doctor/dashboard');
          } else if (user.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/channel');
          }
          return;
        }
      }
    }
    
    console.log('RouteGuard: Route access granted');
  }, [router, pathname, isAuthenticated, user, isInitialized]);
  
  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F0F4F9' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-medium-grey">Cargando...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
} 