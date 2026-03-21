'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/platform/store/authStore';

const publicRoutes = ['/login', '/intro', '/', '/admin/login', '/doctor/register/success', '/splash'];

const roleRestrictedRoutes = [
  { path: '/patient', roles: ['patient', 'admin'] },
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
  const [shouldRestoreSession, setShouldRestoreSession] = useState(false);

  useEffect(() => {
    if (pathname === '/login') {
      setIsInitialized(true);
      setShouldRestoreSession(false);
    } else {
      setShouldRestoreSession(true);
      initializeAuth().finally(() => {
        setIsInitialized(true);
      });
    }
  }, [pathname, initializeAuth]);

  useEffect(() => {
    if (!isInitialized) return;

    if (pathname.startsWith('/doctor/register')) return;
    if (pathname === '/login') return;

    const requiresAuth = !publicRoutes.includes(pathname);

    if (requiresAuth && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user) {
      for (const route of roleRestrictedRoutes) {
        if (pathname.startsWith(route.path) && !route.roles.includes(user.role || '')) {
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
  }, [router, pathname, isAuthenticated, user, isInitialized, shouldRestoreSession]);

  if (!isInitialized && shouldRestoreSession) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F2F2F7' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-medium-grey">Cargando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 