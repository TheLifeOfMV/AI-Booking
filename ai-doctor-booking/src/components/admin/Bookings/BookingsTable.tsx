'use client';

import { useState } from 'react';
import { useAdminBookingsContext } from '@/context/AdminBookingsProvider';
import { AdminBooking, BookingStatus, PaymentStatus } from '@/types/admin';
import ImpersonationButton from './ImpersonationButton';

export default function BookingsTable() {
  const {
    bookings,
    loading,
    error,
    selectedBookingIds,
    toggleBookingSelection,
    selectAllBookings,
  } = useAdminBookingsContext();
  
  const [sortField, setSortField] = useState<keyof AdminBooking>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const handleSort = (field: keyof AdminBooking) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Sorting logic
  const sortedBookings = [...bookings].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      default:
        comparison = String(a[sortField]).localeCompare(String(b[sortField]));
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  // Status and payment badge styles
  const getStatusBadgeClass = (status: BookingStatus) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPaymentBadgeClass = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'refunded':
        return 'bg-orange-100 text-orange-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Función para traducir los status de reserva
  const translateBookingStatus = (status: BookingStatus): string => {
    switch (status) {
      case 'scheduled':
        return 'Programada';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      case 'no-show':
        return 'No asistió';
      default:
        return status;
    }
  };
  
  // Función para traducir los status de pago
  const translatePaymentStatus = (status: PaymentStatus): string => {
    switch (status) {
      case 'paid':
        return 'Pagado';
      case 'refunded':
        return 'Reembolsado';
      case 'pending':
        return 'Pendiente';
      default:
        return status;
    }
  };
  
  // Función para traducir especialidades médicas
  const translateSpecialty = (specialty: string): string => {
    const specialtiesMap: Record<string, string> = {
      'Cardiology': 'Cardiología',
      'Dermatology': 'Dermatología',
      'Oculist': 'Oftalmología',
      'Neurology': 'Neurología',
      'Pediatrics': 'Pediatría',
      'Orthopedics': 'Ortopedia',
      'Psychiatry': 'Psiquiatría',
      'Gynecology': 'Ginecología'
    };
    
    return specialtiesMap[specialty] || specialty;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-lg">
        <p>{error}</p>
        <button className="mt-2 text-primary underline">Reintentar</button>
      </div>
    );
  }
  
  if (bookings.length === 0) {
    return (
      <div className="p-8 text-center border rounded-lg">
        <p className="text-medium-grey mb-4">No se encontraron reservas.</p>
        <p className="text-sm">Intenta cambiar tus filtros o crear nuevas reservas.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-light-grey">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-light-grey">
          <thead className="bg-light-grey">
            <tr>
              <th scope="col" className="p-4 text-left">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary rounded border-medium-grey focus:ring-primary"
                    checked={selectedBookingIds.length > 0 && selectedBookingIds.length === bookings.length}
                    onChange={selectAllBookings}
                  />
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-xs font-medium text-dark-grey uppercase tracking-wider text-left cursor-pointer"
                onClick={() => handleSort('id')}
              >
                ID Reserva
                {sortField === 'id' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-xs font-medium text-dark-grey uppercase tracking-wider text-left cursor-pointer"
                onClick={() => handleSort('patientName')}
              >
                Paciente
                {sortField === 'patientName' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-xs font-medium text-dark-grey uppercase tracking-wider text-left cursor-pointer"
                onClick={() => handleSort('doctorName')}
              >
                Doctor
                {sortField === 'doctorName' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-xs font-medium text-dark-grey uppercase tracking-wider text-left cursor-pointer"
                onClick={() => handleSort('specialty')}
              >
                Especialidad
                {sortField === 'specialty' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-xs font-medium text-dark-grey uppercase tracking-wider text-left cursor-pointer"
                onClick={() => handleSort('date')}
              >
                Fecha y Hora
                {sortField === 'date' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-xs font-medium text-dark-grey uppercase tracking-wider text-left cursor-pointer"
                onClick={() => handleSort('status')}
              >
                Estado
                {sortField === 'status' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-xs font-medium text-dark-grey uppercase tracking-wider text-left cursor-pointer"
                onClick={() => handleSort('amount')}
              >
                Importe
                {sortField === 'amount' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-xs font-medium text-dark-grey uppercase tracking-wider text-left cursor-pointer"
                onClick={() => handleSort('paymentStatus')}
              >
                Pago
                {sortField === 'paymentStatus' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th scope="col" className="px-4 py-3 text-xs font-medium text-dark-grey uppercase tracking-wider text-left">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-light-grey">
            {sortedBookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-light-grey transition-colors">
                <td className="p-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary rounded border-medium-grey focus:ring-primary"
                      checked={selectedBookingIds.includes(booking.id)}
                      onChange={() => toggleBookingSelection(booking.id)}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-dark-grey">
                  <span className="font-medium">{booking.id}</span>
                </td>
                <td className="px-4 py-3 text-sm text-dark-grey">
                  {booking.patientName}
                </td>
                <td className="px-4 py-3 text-sm text-dark-grey">
                  {booking.doctorName}
                </td>
                <td className="px-4 py-3 text-sm text-dark-grey">
                  {translateSpecialty(booking.specialty)}
                </td>
                <td className="px-4 py-3 text-sm text-dark-grey">
                  <div>{booking.date}</div>
                  <div className="text-medium-grey">{booking.time}</div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(booking.status)}`}>
                    {translateBookingStatus(booking.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-dark-grey">
                  ${booking.amount}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentBadgeClass(booking.paymentStatus)}`}>
                    {translatePaymentStatus(booking.paymentStatus)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="flex items-center space-x-2">
                    <button 
                      className="text-medium-grey hover:text-primary transition-colors"
                      aria-label="Ver detalles"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <ImpersonationButton userId={booking.patientId} userName={booking.patientName} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-light-grey sm:px-6">
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-medium-grey">
              Mostrando <span className="font-medium">{bookings.length}</span> resultados
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Paginación">
              <a
                href="#"
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-light-grey bg-white text-sm font-medium text-medium-grey hover:bg-light-grey"
                onClick={(e) => e.preventDefault()}
              >
                <span className="sr-only">Anterior</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href="#"
                aria-current="page"
                className="z-10 bg-primary text-white relative inline-flex items-center px-4 py-2 border border-primary text-sm font-medium"
                onClick={(e) => e.preventDefault()}
              >
                1
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-4 py-2 border border-light-grey bg-white text-sm font-medium text-dark-grey hover:bg-light-grey"
                onClick={(e) => e.preventDefault()}
              >
                2
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-4 py-2 border border-light-grey bg-white text-sm font-medium text-dark-grey hover:bg-light-grey"
                onClick={(e) => e.preventDefault()}
              >
                3
              </a>
              <span className="relative inline-flex items-center px-4 py-2 border border-light-grey bg-white text-sm font-medium text-medium-grey">
                ...
              </span>
              <a
                href="#"
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-light-grey bg-white text-sm font-medium text-medium-grey hover:bg-light-grey"
                onClick={(e) => e.preventDefault()}
              >
                <span className="sr-only">Siguiente</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </a>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
} 