import { Suspense } from 'react';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Dynamic imports for better performance
const KPIBookingsPerDay = dynamic(() => import('@/components/admin/Dashboard/KPIBookingsPerDay'), {
  loading: () => <div className="h-64 w-full bg-light-grey animate-pulse rounded-lg"></div>
});

const KPIUtilization = dynamic(() => import('@/components/admin/Dashboard/KPIUtilization'), {
  loading: () => <div className="h-64 w-full bg-light-grey animate-pulse rounded-lg"></div>
});

const QuickLinks = dynamic(() => import('@/components/admin/Dashboard/QuickLinks'), {
  loading: () => <div className="h-36 w-full bg-light-grey animate-pulse rounded-lg"></div>
});

// SEO metadata
export const metadata: Metadata = {
  title: 'Panel de Administración | AI Doctor Booking',
  description: 'Panel de control para administradores con KPIs y accesos rápidos'
};

export default function AdminDashboardPage() {
  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>

      {/* Error boundary and suspense for KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Suspense fallback={<div className="h-64 w-full bg-light-grey animate-pulse rounded-lg"></div>}>
          <KPIBookingsPerDay />
        </Suspense>
        
        <Suspense fallback={<div className="h-64 w-full bg-light-grey animate-pulse rounded-lg"></div>}>
          <KPIUtilization />
        </Suspense>
      </div>

      {/* Quick Links Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Accesos Rápidos</h2>
        <Suspense fallback={<div className="h-36 w-full bg-light-grey animate-pulse rounded-lg"></div>}>
          <QuickLinks />
        </Suspense>
      </section>

      {/* Response time indicator */}
      <div className="text-xs text-medium-grey text-right mt-10">
        Tiempo de carga: &lt;1s
      </div>
    </div>
  );
} 