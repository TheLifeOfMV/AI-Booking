import { Suspense } from 'react';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { UserFilter } from '@/types/user';

// Dynamic imports for better performance
const UsersTable = dynamic(() => import('@/components/admin/Users/UsersTable'), {
  loading: () => <div className="h-96 w-full bg-light-grey animate-pulse rounded-lg"></div>
});

const UserFilters = dynamic(() => import('@/components/admin/Users/UserFilters'), {
  loading: () => <div className="h-20 w-full bg-light-grey animate-pulse rounded-lg mb-6"></div>
});

// SEO metadata
export const metadata: Metadata = {
  title: 'Gestión de Usuarios | Panel de Administración',
  description: 'Administra cuentas de usuarios, permisos y detalles'
};

export default function AdminUsersPage() {
  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        
        <div className="mt-4 lg:mt-0">
          <button 
            className="bg-primary text-white px-4 py-2 rounded-lg font-medium flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Añadir Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <section className="mb-6">
        <Suspense fallback={<div className="h-20 w-full bg-light-grey animate-pulse rounded-lg mb-6"></div>}>
          <UserFilters />
        </Suspense>
      </section>

      {/* Users Table */}
      <section>
        <Suspense fallback={<div className="h-96 w-full bg-light-grey animate-pulse rounded-lg"></div>}>
          <UsersTable />
        </Suspense>
      </section>

      {/* Response time indicator */}
      <div className="text-xs text-medium-grey text-right mt-10">
        Tiempo de carga: &lt;1s
      </div>
    </div>
  );
} 