"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiCalendar, FiClock, FiUsers, FiTrendingUp, FiBarChart, FiMessageCircle, FiChevronRight, FiBell, FiUser, FiX } from 'react-icons/fi';

// Datos de muestra para el dashboard
const MOCK_APPOINTMENTS = [
  {
    id: '1',
    patientName: 'María García',
    patientAvatar: 'https://via.placeholder.com/40',
    date: '2023-07-15',
    time: '09:30',
    status: 'confirmed',
  },
  {
    id: '2',
    patientName: 'Carlos Rodríguez',
    patientAvatar: 'https://via.placeholder.com/40',
    date: '2023-07-15',
    time: '11:00',
    status: 'confirmed',
  },
  {
    id: '3',
    patientName: 'Laura Martínez',
    patientAvatar: 'https://via.placeholder.com/40',
    date: '2023-07-15',
    time: '12:30',
    status: 'pending',
  }
];

const MOCK_STATS = {
  todayPatients: 3,
  weeklyPatients: 15,
  totalPatients: 48,
  pendingAppointments: 5
};

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'appointment',
    message: 'Nueva cita reservada para mañana a las 10:00',
    time: '2 horas',
    isRead: false
  },
  {
    id: '2',
    type: 'message',
    message: 'Nuevo mensaje de Ana Gómez sobre su consulta',
    time: '1 día',
    isRead: true
  },
  {
    id: '3',
    type: 'system',
    message: 'Tu perfil ha sido verificado correctamente',
    time: '3 días',
    isRead: true
  }
];

const DoctorDashboardPage = () => {
  const [dateFilter, setDateFilter] = useState('today');
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const markAllAsRead = () => {
    // In a real app, this would make an API call
    console.log('Marking all notifications as read');
  };
  
  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#F2F2F2' }}>
      {/* Fixed Top-Right Notification Icon */}
      <div className="fixed top-6 right-6 z-50" ref={notificationRef}>
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-4 bg-white rounded-full shadow-lg border border-light-grey hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <FiBell size={28} style={{ color: '#777777' }} />
          {MOCK_NOTIFICATIONS.filter(n => !n.isRead).length > 0 && (
            <span 
              className="absolute -top-2 -right-2 h-7 w-7 rounded-full text-white text-sm flex items-center justify-center font-bold animate-pulse shadow-md"
              style={{ backgroundColor: '#FF9500' }}
            >
              {MOCK_NOTIFICATIONS.filter(n => !n.isRead).length}
            </span>
          )}
        </button>

        {/* Enhanced Notifications Dropdown - Fixed positioning */}
        {showNotifications && (
          <div 
            className="absolute top-full mt-4 bg-white rounded-2xl shadow-2xl border border-light-grey overflow-hidden"
            style={{ 
              backgroundColor: '#FFFFFF',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
              right: 0,
              width: '420px',
              maxWidth: '90vw',
              maxHeight: '80vh',
              transform: 'translateX(0)',
              zIndex: 1000
            }}
          >
            {/* Dropdown Header */}
            <div className="flex justify-between items-center p-6 border-b border-light-grey bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h3 className="text-xl font-bold text-dark-grey">Notificaciones</h3>
                <p className="text-sm text-medium-grey mt-1">
                  {MOCK_NOTIFICATIONS.filter(n => !n.isRead).length} sin leer
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={markAllAsRead}
                  className="text-sm font-semibold px-3 py-1.5 rounded-full transition-all duration-200 hover:bg-white/80"
                  style={{ color: '#007AFF' }}
                >
                  Marcar todas
                </button>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="p-2 hover:bg-white/80 rounded-full transition-colors"
                >
                  <FiX size={20} className="text-medium-grey" />
                </button>
              </div>
            </div>
            
            {/* Notifications List */}
            <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: '400px' }}>
              <div className="divide-y divide-light-grey">
                {MOCK_NOTIFICATIONS.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-5 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 cursor-pointer ${
                      notification.isRead ? 'bg-white' : 'bg-gradient-to-r from-blue-50/30 to-indigo-50/30'
                    }`}
                    onClick={() => {/* Handle notification click */}}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {notification.type === 'appointment' && 
                          <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
                            <FiCalendar size={18} style={{ color: '#007AFF' }} />
                          </div>
                        }
                        {notification.type === 'message' && 
                          <div className="p-3 bg-green-100 rounded-xl shadow-sm">
                            <FiMessageCircle size={18} className="text-green-600" />
                          </div>
                        }
                        {notification.type === 'system' && 
                          <div className="p-3 bg-orange-100 rounded-xl shadow-sm">
                            <FiBell size={18} style={{ color: '#FF9500' }} />
                          </div>
                        }
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-relaxed ${
                          notification.isRead ? 'text-medium-grey' : 'text-dark-grey font-semibold'
                        }`}>
                          {notification.message}
                        </p>
                        <span className="text-xs text-medium-grey mt-2 block font-medium">
                          Hace {notification.time}
                        </span>
                      </div>
                      
                      {!notification.isRead && (
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0 mt-2 animate-pulse"
                          style={{ backgroundColor: '#007AFF' }}
                        ></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Dropdown Footer */}
            <div className="p-5 border-t border-light-grey bg-gradient-to-r from-gray-50 to-blue-50">
              <Link 
                href="/doctor/notifications" 
                className="flex items-center justify-center font-semibold text-sm py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-md w-full"
                style={{ 
                  color: '#007AFF',
                  backgroundColor: 'rgba(0, 122, 255, 0.1)'
                }}
                onClick={() => setShowNotifications(false)}
              >
                Ver todas las notificaciones <FiChevronRight className="ml-2" size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="container max-w-6xl mx-auto py-8 px-6">
        {/* Header - Enhanced responsive design with proper spacing */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pr-4 md:pr-24 lg:pr-32">
          <div>
            <h1 className="text-3xl font-bold text-dark-grey mb-2">Dashboard</h1>
            <p className="text-medium-grey text-lg">
              Bienvenido de nuevo, Dr. Juan Pérez
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center">
            <Link 
              href="/doctor/profile" 
              className="flex items-center font-medium px-6 py-3 rounded-full transition-all duration-200 hover:shadow-md"
              style={{ 
                color: '#007AFF', 
                backgroundColor: 'rgba(0, 122, 255, 0.1)',
              }}
            >
              <FiUser className="mr-2" size={18} /> Ver Perfil
            </Link>
          </div>
        </div>
        
        {/* Tarjetas de estadísticas - Removed monthly income card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            icon={<FiUsers size={24} style={{ color: '#007AFF' }} />}
            title="Pacientes Hoy"
            value={MOCK_STATS.todayPatients}
            bgColor="bg-blue-50"
          />
          
          <StatCard 
            icon={<FiCalendar size={24} className="text-green-600" />}
            title="Pacientes Semanales"
            value={MOCK_STATS.weeklyPatients}
            bgColor="bg-green-50"
          />
          
          <StatCard 
            icon={<FiBarChart size={24} style={{ color: '#FF9500' }} />}
            title="Total Pacientes"
            value={MOCK_STATS.totalPatients}
            trend="+8% vs mes pasado"
            bgColor="bg-orange-50"
          />
        </div>
        
        {/* Citas del día - Enhanced responsive design and proper spacing */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8 w-full" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-6 border-b border-light-grey gap-4 sm:gap-0">
            <h2 className="text-xl font-semibold text-dark-grey">Tus Citas</h2>
            
            <div className="flex rounded-lg overflow-hidden border border-light-grey w-full sm:w-auto">
              <button 
                className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium transition-colors ${
                  dateFilter === 'today' 
                    ? 'text-white' 
                    : 'bg-white text-medium-grey hover:bg-light-grey'
                }`}
                style={{ backgroundColor: dateFilter === 'today' ? '#007AFF' : undefined }}
                onClick={() => setDateFilter('today')}
              >
                Hoy
              </button>
              <button 
                className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium transition-colors ${
                  dateFilter === 'tomorrow' 
                    ? 'text-white' 
                    : 'bg-white text-medium-grey hover:bg-light-grey'
                }`}
                style={{ backgroundColor: dateFilter === 'tomorrow' ? '#007AFF' : undefined }}
                onClick={() => setDateFilter('tomorrow')}
              >
                Mañana
              </button>
              <button 
                className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium transition-colors ${
                  dateFilter === 'week' 
                    ? 'text-white' 
                    : 'bg-white text-medium-grey hover:bg-light-grey'
                }`}
                style={{ backgroundColor: dateFilter === 'week' ? '#007AFF' : undefined }}
                onClick={() => setDateFilter('week')}
              >
                Semana
              </button>
            </div>
          </div>
          
          {MOCK_APPOINTMENTS.length > 0 ? (
            <div className="p-6 space-y-4">
              {MOCK_APPOINTMENTS.map(appointment => (
                <Link 
                  key={appointment.id} 
                  href={`/doctor/appointments/${appointment.id}`}
                  className="block"
                >
                  <div 
                    className="bg-white rounded-xl border border-light-grey hover:shadow-lg hover:border-blue-200 transition-all duration-300 overflow-hidden group cursor-pointer transform hover:scale-[1.02]"
                    style={{ backgroundColor: '#FFFFFF' }}
                  >
                    <div className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center">
                          <div className="w-14 h-14 rounded-full overflow-hidden bg-light-grey mr-4 flex-shrink-0 ring-2 ring-blue-50 group-hover:ring-blue-200 transition-all duration-300">
                            <Image 
                              src={appointment.patientAvatar} 
                              alt={appointment.patientName}
                              width={56}
                              height={56}
                              className="object-cover"
                            />
                          </div>
                          
                          <div className="min-w-0">
                            <h3 className="font-bold text-dark-grey text-xl mb-2 group-hover:text-blue-700 transition-colors duration-300">{appointment.patientName}</h3>
                            
                            {/* Date and Time Info */}
                            <div className="flex items-center gap-4 text-medium-grey">
                              <div className="flex items-center">
                                <FiCalendar className="mr-2 flex-shrink-0" size={16} />
                                <span className="font-medium text-sm">
                                  {new Date(appointment.date).toLocaleDateString('es-ES', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short'
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <FiClock className="mr-2 flex-shrink-0" size={16} />
                                <span className="font-semibold text-lg">{appointment.time}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <span 
                            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                              appointment.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            }`}
                          >
                            {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-medium-grey">
              <FiCalendar size={64} className="mx-auto mb-4 text-light-grey" />
              <h3 className="text-xl font-semibold mb-2 text-dark-grey">No tienes citas programadas</h3>
              <p className="text-lg">Disfruta de tu tiempo libre.</p>
            </div>
          )}
          
          <div className="p-6 border-t border-light-grey">
            <Link 
              href="/doctor/appointments" 
              className="font-medium text-sm flex items-center justify-center transition-colors hover:text-primary/80"
              style={{ color: '#007AFF' }}
            >
              Ver todas las citas <FiChevronRight className="ml-1" size={16} />
            </Link>
          </div>
        </div>
        
        {/* Estadísticas de Actividad Reciente */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="p-6 border-b border-light-grey">
            <h2 className="text-xl font-semibold text-dark-grey">Actividad Reciente</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-medium-grey font-medium">Tasa de ocupación</span>
                    <span className="font-semibold text-dark-grey text-lg">85%</span>
                  </div>
                  <div className="h-3 bg-light-grey rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ width: '85%', backgroundColor: '#007AFF' }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-medium-grey font-medium">Citas completadas</span>
                    <span className="font-semibold text-dark-grey text-lg">18/20</span>
                  </div>
                  <div className="h-3 bg-light-grey rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: '90%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-medium-grey font-medium">Valoraciones positivas</span>
                    <span className="font-semibold text-dark-grey text-lg">92%</span>
                  </div>
                  <div className="h-3 bg-light-grey rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ width: '92%', backgroundColor: '#FF9500' }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-medium-grey font-medium">Nuevos pacientes</span>
                    <span className="font-semibold text-dark-grey text-lg">8</span>
                  </div>
                  <div className="h-3 bg-light-grey rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full transition-all duration-1000" style={{ width: '40%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-light-grey">
            <Link 
              href="/doctor/analytics" 
              className="font-medium text-sm flex items-center justify-center transition-colors hover:text-primary/80"
              style={{ color: '#007AFF' }}
            >
              Ver análisis detallado <FiTrendingUp className="ml-1" size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Enhanced Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F2F2F2;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #777777;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #007AFF;
        }
        
        /* Responsive adjustments for notifications */
        @media (max-width: 768px) {
          .notification-dropdown {
            right: 1rem !important;
            left: 1rem !important;
            width: auto !important;
            max-width: none !important;
          }
        }
      `}</style>
    </div>
  );
};

// Componente para tarjetas de estadísticas - Enhanced design
interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  trend?: string;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, trend, bgColor }) => {
  return (
    <div 
      className="rounded-xl shadow-sm p-6 flex items-start transition-all duration-200 hover:shadow-md"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <div className={`${bgColor} p-4 rounded-xl mr-4 flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-medium-grey text-sm font-medium mb-2">{title}</h3>
        <p className="text-3xl font-bold text-dark-grey mb-1">{value}</p>
        {trend && (
          <p className="text-sm text-green-600 font-medium">{trend}</p>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboardPage; 