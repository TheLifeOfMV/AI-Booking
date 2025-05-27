"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiCalendar, FiClock, FiUsers, FiDollarSign, FiTrendingUp, FiBarChart, FiMessageCircle, FiChevronRight, FiBell, FiUser } from 'react-icons/fi';

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
  monthlyEarnings: 750,
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
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F0F4F9' }}>
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-medium-grey">
              Bienvenido de nuevo, Dr. Juan Pérez
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            <div className="relative">
              <button className="p-2 text-medium-grey hover:text-primary transition-colors focus:outline-none">
                <FiBell size={20} />
                <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {MOCK_NOTIFICATIONS.filter(n => !n.isRead).length}
                </span>
              </button>
            </div>
            
            <Link 
              href="/doctor/profile" 
              className="flex items-center text-primary hover:text-primary/80 font-medium bg-primary/10 px-3 py-1.5 rounded-full transition-colors"
            >
              <FiUser className="mr-1.5" /> Ver Perfil
            </Link>
          </div>
        </div>
        
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            icon={<FiUsers size={20} className="text-blue-500" />}
            title="Pacientes Hoy"
            value={MOCK_STATS.todayPatients}
            bgColor="bg-blue-50"
          />
          
          <StatCard 
            icon={<FiCalendar size={20} className="text-green-500" />}
            title="Pacientes Semanales"
            value={MOCK_STATS.weeklyPatients}
            bgColor="bg-green-50"
          />
          
          <StatCard 
            icon={<FiDollarSign size={20} className="text-purple-500" />}
            title="Ingresos Mensuales"
            value={`${MOCK_STATS.monthlyEarnings} €`}
            bgColor="bg-purple-50"
          />
          
          <StatCard 
            icon={<FiBarChart size={20} className="text-orange-500" />}
            title="Total Pacientes"
            value={MOCK_STATS.totalPatients}
            trend="+8% vs mes pasado"
            bgColor="bg-orange-50"
          />
        </div>
        
        {/* Citas del día */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="flex justify-between items-center p-4 border-b border-light-grey">
            <h2 className="text-lg font-semibold">Tus Citas</h2>
            
            <div className="flex rounded-lg overflow-hidden border border-light-grey">
              <button 
                className={`px-3 py-1 text-sm ${dateFilter === 'today' ? 'bg-primary text-white' : 'bg-white text-medium-grey'}`}
                onClick={() => setDateFilter('today')}
              >
                Hoy
              </button>
              <button 
                className={`px-3 py-1 text-sm ${dateFilter === 'tomorrow' ? 'bg-primary text-white' : 'bg-white text-medium-grey'}`}
                onClick={() => setDateFilter('tomorrow')}
              >
                Mañana
              </button>
              <button 
                className={`px-3 py-1 text-sm ${dateFilter === 'week' ? 'bg-primary text-white' : 'bg-white text-medium-grey'}`}
                onClick={() => setDateFilter('week')}
              >
                Semana
              </button>
            </div>
          </div>
          
          {MOCK_APPOINTMENTS.length > 0 ? (
            <div className="divide-y divide-light-grey">
              {MOCK_APPOINTMENTS.map(appointment => (
                <div key={appointment.id} className="p-4 hover:bg-light-grey/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-light-grey mr-3">
                        <Image 
                          src={appointment.patientAvatar} 
                          alt={appointment.patientName}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                      
                      <div>
                        <h3 className="font-medium">{appointment.patientName}</h3>
                        <div className="flex items-center text-sm text-medium-grey">
                          <FiClock className="mr-1" />
                          <span>{appointment.time}</span>
                          <span className="mx-1">•</span>
                          <span className="text-dark-grey">
                            Presencial
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <span 
                        className={`inline-block px-2 py-1 rounded-full text-xs mr-3 ${
                          appointment.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                      </span>
                      
                      <Link href={`/doctor/appointments/${appointment.id}`}>
                        <button className="text-primary hover:text-primary/80">
                          <FiChevronRight />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-medium-grey">
              <FiCalendar size={48} className="mx-auto mb-4 text-light-grey" />
              <h3 className="text-lg font-medium mb-1">No tienes citas programadas</h3>
              <p>Disfruta de tu tiempo libre.</p>
            </div>
          )}
          
          <div className="p-4 border-t border-light-grey">
            <Link 
              href="/doctor/appointments" 
              className="text-primary hover:text-primary/80 font-medium text-sm flex items-center justify-center"
            >
              Ver todas las citas <FiChevronRight className="ml-1" />
            </Link>
          </div>
        </div>
        
        {/* Notificaciones y Actividad Reciente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Notificaciones */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-light-grey">
              <h2 className="text-lg font-semibold">Notificaciones</h2>
              <button className="text-sm text-primary">Marcar todas como leídas</button>
            </div>
            
            <div className="max-h-[350px] overflow-y-auto">
              <div className="divide-y divide-light-grey">
                {MOCK_NOTIFICATIONS.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-4 flex ${notification.isRead ? 'bg-white' : 'bg-blue-50'}`}
                  >
                    <div className="mr-3">
                      {notification.type === 'appointment' && <FiCalendar className="text-blue-500" />}
                      {notification.type === 'message' && <FiMessageCircle className="text-green-500" />}
                      {notification.type === 'system' && <FiBell className="text-orange-500" />}
                    </div>
                    
                    <div className="flex-1">
                      <p className={`${notification.isRead ? 'text-medium-grey' : 'text-dark-grey font-medium'}`}>
                        {notification.message}
                      </p>
                      <span className="text-xs text-medium-grey">
                        Hace {notification.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-light-grey">
              <Link 
                href="/doctor/notifications" 
                className="text-primary hover:text-primary/80 font-medium text-sm flex items-center justify-center"
              >
                Ver todas las notificaciones <FiChevronRight className="ml-1" />
              </Link>
            </div>
          </div>
          
          {/* Estadísticas */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-light-grey">
              <h2 className="text-lg font-semibold">Actividad Reciente</h2>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-medium-grey">Tasa de ocupación</span>
                  <span className="text-sm font-medium">85%</span>
                </div>
                <div className="h-2 bg-light-grey rounded-full">
                  <div className="h-full bg-primary rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-medium-grey">Citas completadas</span>
                  <span className="text-sm font-medium">18/20</span>
                </div>
                <div className="h-2 bg-light-grey rounded-full">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-medium-grey">Valoraciones positivas</span>
                  <span className="text-sm font-medium">92%</span>
                </div>
                <div className="h-2 bg-light-grey rounded-full">
                  <div className="h-full bg-yellow-500 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-medium-grey">Nuevos pacientes</span>
                  <span className="text-sm font-medium">8</span>
                </div>
                <div className="h-2 bg-light-grey rounded-full">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-light-grey">
              <Link 
                href="/doctor/analytics" 
                className="text-primary hover:text-primary/80 font-medium text-sm flex items-center justify-center"
              >
                Ver análisis detallado <FiTrendingUp className="ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para tarjetas de estadísticas
interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  trend?: string;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, trend, bgColor }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-start">
      <div className={`${bgColor} p-3 rounded-lg mr-4`}>
        {icon}
      </div>
      <div>
        <h3 className="text-medium-grey text-sm mb-1">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
        {trend && <p className="text-xs text-green-600 font-medium">{trend}</p>}
      </div>
    </div>
  );
};

export default DoctorDashboardPage; 