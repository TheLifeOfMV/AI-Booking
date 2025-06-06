"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FiClock, 
  FiMapPin, 
  FiVideo, 
  FiUser,
  FiChevronRight 
} from 'react-icons/fi';
import { ExtendedAppointment } from '../mockAppointments';
import AppointmentActions from './AppointmentActions';

interface CalendarAppointmentViewProps {
  date: Date;
  appointments: ExtendedAppointment[];
}

const CalendarAppointmentView: React.FC<CalendarAppointmentViewProps> = ({
  date,
  appointments
}) => {
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: ExtendedAppointment['status']) => {
    const statusConfig = {
      confirmed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmada' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendiente' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completada' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelada' },
      'no-show': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'No asistió' }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getUrgencyColor = (urgency: 'low' | 'medium' | 'high') => {
    switch (urgency) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-dark-grey mb-4">
            {formatDate(date)}
          </h3>
          <div className="text-center py-12">
            <FiClock size={48} className="mx-auto mb-4 text-light-grey" />
            <h4 className="text-xl font-semibold mb-2 text-dark-grey">
              No hay citas programadas
            </h4>
            <p className="text-medium-grey mb-6">
              Disfruta de tu tiempo libre este día.
            </p>
            <Link
              href="/doctor/appointments/new"
              className="inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors text-white"
              style={{ backgroundColor: '#007AFF' }}
            >
              Agregar Cita Manual
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-light-grey">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-dark-grey">
            {formatDate(date)}
          </h3>
          <div className="flex items-center gap-4">
            <span className="text-sm text-medium-grey">
              {appointments.length} cita{appointments.length !== 1 ? 's' : ''}
            </span>
            <Link
              href={`/doctor/appointments?date=${date.toISOString().split('T')[0]}`}
              className="text-primary hover:text-blue-600 text-sm font-medium flex items-center"
            >
              Ver en lista <FiChevronRight className="ml-1" size={14} />
            </Link>
          </div>
        </div>
      </div>

      <div className="divide-y divide-light-grey">
        {appointments.map(appointment => (
          <div 
            key={appointment.id}
            className={`p-6 border-l-4 ${getUrgencyColor(appointment.urgency)}`}
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              
              {/* Appointment Info */}
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  {/* Patient Avatar */}
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-light-grey flex-shrink-0">
                    <Image 
                      src={appointment.patientAvatar} 
                      alt={appointment.patientName}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    {/* Time and Status */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center text-dark-grey font-semibold">
                        <FiClock className="mr-2" size={16} />
                        <span>{appointment.time} - {appointment.endTime}</span>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>

                    {/* Patient Name */}
                    <h4 className="text-lg font-semibold text-dark-grey mb-2">
                      {appointment.patientName}
                    </h4>

                    {/* Location */}
                    <div className="flex items-center text-medium-grey mb-2">
                      {appointment.consultationType === 'virtual' ? (
                        <FiVideo className="mr-2 flex-shrink-0" size={16} />
                      ) : (
                        <FiMapPin className="mr-2 flex-shrink-0" size={16} />
                      )}
                      <span>{appointment.location}</span>
                      {appointment.roomNumber && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Sala {appointment.roomNumber}</span>
                        </>
                      )}
                    </div>

                    {/* Reason */}
                    <p className="text-dark-grey font-medium mb-2">
                      {appointment.reason}
                    </p>

                    {/* Symptoms */}
                    {appointment.symptoms && appointment.symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {appointment.symptoms.map((symptom, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-light-grey text-medium-grey"
                          >
                            {symptom}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Additional Info */}
                    <div className="flex items-center gap-4 text-sm text-medium-grey">
                      <span>€{appointment.fees}</span>
                      {appointment.insuranceProvider && (
                        <>
                          <span>•</span>
                          <span>{appointment.insuranceProvider}</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="capitalize">{appointment.appointmentType}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="lg:ml-4">
                <AppointmentActions 
                  appointment={appointment}
                  onConfirm={async (id) => console.log('Confirm', id)}
                  onCancel={async (id) => console.log('Cancel', id)}
                  onViewDetails={(id) => window.open(`/doctor/appointments/${id}`, '_blank')}
                  onReschedule={(id) => console.log('Reschedule', id)}
                  compact={false}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Day Summary */}
      <div className="p-6 bg-light-grey/30 border-t border-light-grey">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-dark-grey">
              {appointments.filter(apt => apt.status === 'confirmed').length}
            </div>
            <div className="text-sm text-medium-grey">Confirmadas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-dark-grey">
              {appointments.filter(apt => apt.status === 'pending').length}
            </div>
            <div className="text-sm text-medium-grey">Pendientes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-dark-grey">
              {appointments.reduce((sum, apt) => sum + apt.fees, 0)}€
            </div>
            <div className="text-sm text-medium-grey">Total Ingresos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-dark-grey">
              {appointments.reduce((sum, apt) => sum + apt.duration, 0)}min
            </div>
            <div className="text-sm text-medium-grey">Tiempo Total</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarAppointmentView; 