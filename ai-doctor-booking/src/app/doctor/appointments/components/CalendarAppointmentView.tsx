"use client";

import React from 'react';
import Link from 'next/link';
import { 
  FiClock, 
  FiChevronRight,
  FiCalendar
} from 'react-icons/fi';
import { ExtendedAppointment } from '../mockAppointments';
import AppointmentCard from '../../dashboard/AppointmentCard';

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

  // Convert ExtendedAppointment to AppointmentCard format
  const convertToAppointmentCardFormat = (appointment: ExtendedAppointment) => {
    return {
      id: appointment.id,
      patientName: appointment.patientName,
      patientAvatar: appointment.patientAvatar,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status as 'confirmed' | 'pending' | 'cancelled'
    };
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

      <div className="p-6">
        <div className="space-y-4">
          {appointments.map(appointment => (
            <AppointmentCard
              key={appointment.id}
              appointment={convertToAppointmentCardFormat(appointment)}
              href={`/doctor/appointments/${appointment.id}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarAppointmentView; 