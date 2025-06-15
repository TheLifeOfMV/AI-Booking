"use client";

import { usePathname } from 'next/navigation';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Check if the current path is one where navigation should be hidden
  // This mirrors the logic from BottomNavigation component
  const shouldHideNavigation = 
    !pathname || // Handle initial loading state
    pathname === '/' || // Hide on root path (initial landing)
    pathname.startsWith('/intro') || 
    pathname.startsWith('/channel') || 
    pathname.startsWith('/login') ||
    pathname.startsWith('/splash') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/doctor/register') || // Hide during doctor registration
    pathname.startsWith('/admin'); // Hide in admin views for desktop
  
  // Apply bottom padding only when navigation is visible
  const mainClasses = shouldHideNavigation 
    ? "min-h-screen" 
    : "min-h-screen pb-16";
  
  return (
    <main className={mainClasses}>
      {children}
    </main>
  );
} 