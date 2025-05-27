import React from 'react';
import { FiClock, FiMapPin, FiCalendar } from 'react-icons/fi';

interface AppointmentCardProps {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  location: string;

}

/**
 * Componente que muestra una tarjeta de cita médica
 */
const AppointmentCard: React.FC<AppointmentCardProps> = ({
  id,
  doctorName,
  doctorSpecialty,
  date,
  time,
  status,
  location
}) => {
  // Formatear la fecha a un formato más legible
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Obtener el color y texto según el estado de la cita
  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return { color: 'bg-accent-orange/10 text-accent-orange', text: 'Pendiente' };
      case 'confirmed':
        return { color: 'bg-primary/10 text-primary', text: 'Confirmada' };
      case 'completed':
        return { color: 'bg-green-100 text-green-700', text: 'Completada' };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-700', text: 'Cancelada' };
      default:
        return { color: 'bg-light-grey text-medium-grey', text: 'Desconocido' };
    }
  };

  const statusInfo = getStatusInfo();

  // Determinar si la cita es futura o pasada
  const isPast = new Date(`${date}T${time}`) < new Date();

  return (
    <div className={`border rounded-xl overflow-hidden mb-4 ${
      isPast ? 'border-light-grey bg-white' : 'border-primary/20 bg-primary/5'
    }`}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-dark-grey">{doctorName}</h3>
            <p className="text-primary text-sm">{doctorSpecialty}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex items-center text-sm text-medium-grey">
            <FiCalendar className="mr-2" />
            <span>{formatDate(date)}</span>
          </div>
          <div className="flex items-center text-sm text-medium-grey">
            <FiClock className="mr-2" />
            <span>{time}</span>
          </div>
          <div className="flex items-center text-sm text-medium-grey">
            <FiMapPin className="mr-2" />
            <span>{location}</span>
          </div>
        </div>
      </div>

      {!isPast && status !== 'cancelled' && (
        <div className="border-t border-light-grey flex divide-x divide-light-grey">
          {status === 'confirmed' && (
            <button className="flex-1 py-3 text-sm font-medium text-primary hover:bg-light-grey transition-colors">
              Iniciar consulta
            </button>
          )}
          <button className="flex-1 py-3 text-sm font-medium text-medium-grey hover:bg-light-grey transition-colors">
            Reprogramar
          </button>
          <button className="flex-1 py-3 text-sm font-medium text-red-600 hover:bg-light-grey transition-colors">
            Cancelar
          </button>
        </div>
      )}

      {status === 'completed' && (
        <div className="border-t border-light-grey flex divide-x divide-light-grey">
          <button className="flex-1 py-3 text-sm font-medium text-primary hover:bg-light-grey transition-colors">
            Ver detalles
          </button>
          <button className="flex-1 py-3 text-sm font-medium text-primary hover:bg-light-grey transition-colors">
            Agendar nueva cita
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentCard; 