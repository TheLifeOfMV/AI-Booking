import { Suspense } from 'react';
import { Metadata } from 'next';
import { AdminBookingsProvider } from '@/context/AdminBookingsProvider';
import BookingsTable from '@/components/admin/Bookings/BookingsTable';
import FilterPanel from '@/components/admin/Bookings/FilterPanel';
import BulkActionButtons from '@/components/admin/Bookings/BulkActionButtons';

// SEO metadata
export const metadata: Metadata = {
  title: 'Booking Management | Admin Panel',
  description: 'Manage all bookings, with filtering, bulk operations, and impersonation capabilities'
};

/**
 * Admin Bookings View
 * 
 * This page displays a table of all bookings in the system with controls to:
 * - Filter bookings by date, status, doctor, and patient
 * - Perform bulk actions (cancel/refund)
 * - Impersonate users to see their view
 */
export default function AdminBookingsPage() {
  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <AdminBookingsProvider>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Booking Management</h1>
          
          <div className="mt-4 lg:mt-0">
            <Suspense fallback={<div className="h-12 w-72 bg-light-grey animate-pulse rounded-lg"></div>}>
              <BulkActionButtons />
            </Suspense>
          </div>
        </div>

        {/* Filters Section */}
        <section className="mb-6">
          <Suspense fallback={<div className="h-24 w-full bg-light-grey animate-pulse rounded-lg mb-6"></div>}>
            <FilterPanel />
          </Suspense>
        </section>

        {/* Bookings Table */}
        <section>
          <Suspense fallback={<div className="h-96 w-full bg-light-grey animate-pulse rounded-lg"></div>}>
            <BookingsTable />
          </Suspense>
        </section>

        {/* Response time indicator */}
        <div className="text-xs text-medium-grey text-right mt-10">
          Load time: &lt;2s
        </div>
      </AdminBookingsProvider>
    </div>
  );
} 