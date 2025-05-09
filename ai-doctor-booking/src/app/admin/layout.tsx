'use client';

import { PropsWithChildren } from 'react';
import { redirect, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

// Icons
const DashboardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 20C5 16.134 8.13401 13 12 13C15.866 13 19 16.134 19 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DoctorsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BookingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="5" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 11H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function AdminLayout({ children }: PropsWithChildren) {
  const router = useRouter();
  const { isAdmin, isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    // If not authenticated at all, redirect to login
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // If authenticated but not admin, redirect to home
    if (isAuthenticated && !isAdmin()) {
      router.push('/channel');
    }
  }, [isAuthenticated, isAdmin, router]);
  
  // Don't show any content until auth check is complete
  if (!isAuthenticated || !isAdmin()) {
    return null;
  }
  
  return (
    <div className="flex min-h-screen">
      {/* Desktop-only sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-light-grey shadow-md">
        <div className="p-4 border-b border-light-grey">
          <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Link 
                href="/admin" 
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-light-grey text-dark-grey hover:text-primary transition-colors"
              >
                <DashboardIcon /> 
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/users" 
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-light-grey text-dark-grey hover:text-primary transition-colors"
              >
                <UsersIcon /> 
                <span>Usuarios</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/doctors" 
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-light-grey text-dark-grey hover:text-primary transition-colors"
              >
                <DoctorsIcon /> 
                <span>Doctores</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/bookings" 
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-light-grey text-dark-grey hover:text-primary transition-colors"
              >
                <BookingsIcon /> 
                <span>Reservas</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 border-t border-light-grey">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
              A
            </div>
            <div>
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-medium-grey">administrator@example.com</p>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Mobile warning - admin is desktop only */}
      <div className="lg:hidden flex-1 flex flex-col items-center justify-center p-6 bg-light-grey text-center">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-medium-grey mb-4">
          <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h2 className="text-xl font-bold mb-2">Vista solo para escritorio</h2>
        <p className="text-medium-grey">Esta sección de administración está optimizada para uso en dispositivos de escritorio. Por favor, accede desde un ordenador.</p>
      </div>
      
      {/* Main content - only visible on desktop */}
      <main className="hidden lg:block flex-1 bg-light-grey">
        {children}
      </main>
    </div>
  );
} 