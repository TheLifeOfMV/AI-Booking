"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Input from '@/components/Input';
import Button from '@/components/Button';
import SpecialtySelector from '@/components/doctor/SpecialtySelector';
import ScheduleManager from '@/components/doctor/ScheduleManager';
import { FiUser, FiMapPin, FiSave, FiClock, FiFileText, FiEdit, FiCalendar, FiCheck } from 'react-icons/fi';

// Datos de muestra para las especialidades
const SAMPLE_SPECIALTIES = [
  { id: '1', name: 'Cardiología' },
  { id: '2', name: 'Dermatología' },
  { id: '3', name: 'Pediatría' },
  { id: '4', name: 'Neurología' },
  { id: '5', name: 'Oftalmología' },
  { id: '6', name: 'Ginecología' },
  { id: '7', name: 'Traumatología' },
  { id: '8', name: 'Psiquiatría' }
];

// Definición de la interfaz para el perfil del doctor
interface DoctorProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  specialties: string[];
  licenseNumber: string;
  experience: string;
  bio: string;
  location: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  
  availableTimes: {
    dayOfWeek: number;
    isAvailable: boolean;
    slots: {
      start: string;
      end: string;
    }[];
  }[];
  
  subscription: {
    id: string;
    planType: 'basic' | 'premium' | 'enterprise';
    monthlyFee: number;
    status: 'active' | 'pending' | 'expired' | 'cancelled';
    paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
    startDate: string;
    endDate: string;
    lastPaymentDate?: string;
    nextPaymentDate: string;
    failedPaymentAttempts: number;
  };
}

// Datos de perfil de ejemplo
const MOCK_DOCTOR_PROFILE: DoctorProfile = {
  id: '123',
  fullName: 'Dr. Juan Pérez Martínez',
  email: 'juan.perez@example.com',
  phone: '+34 600 123 456',
  avatar: '/sample-doctor.jpg',
  specialties: ['5'], // Oftalmología
  licenseNumber: '12345-MD',
  experience: '10 años',
  bio: 'Especialista en oftalmología con más de 10 años de experiencia en el diagnóstico y tratamiento de enfermedades oculares. Formado en la Universidad de Barcelona y con fellowship en Estados Unidos.',
  location: {
    address: 'Calle Principal 123',
    city: 'Madrid',
    postalCode: '28001',
    country: 'España'
  },
  
  availableTimes: [
    {
      dayOfWeek: 0,
      isAvailable: true,
      slots: [
        { start: '09:00', end: '13:00' },
        { start: '16:00', end: '19:00' }
      ]
    },
    {
      dayOfWeek: 1,
      isAvailable: true,
      slots: [
        { start: '09:00', end: '14:00' }
      ]
    },
    {
      dayOfWeek: 2,
      isAvailable: true,
      slots: [
        { start: '09:00', end: '13:00' },
        { start: '16:00', end: '19:00' }
      ]
    },
    {
      dayOfWeek: 3,
      isAvailable: true,
      slots: [
        { start: '16:00', end: '20:00' }
      ]
    },
    {
      dayOfWeek: 4,
      isAvailable: true,
      slots: [
        { start: '09:00', end: '13:00' }
      ]
    },
    { dayOfWeek: 5, isAvailable: false, slots: [] },
    { dayOfWeek: 6, isAvailable: false, slots: [] }
  ],
  
  subscription: {
    id: 'sub123',
    planType: 'premium',
    monthlyFee: 150000, // 150,000 COP
    status: 'active',
    paymentStatus: 'paid',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    lastPaymentDate: '2023-06-01',
    nextPaymentDate: '2024-02-01',
    failedPaymentAttempts: 0
  }
};

// Blocked days type
interface BlockedDate {
  date: string;
  reason: string;
}

const MOCK_BLOCKED_DATES: BlockedDate[] = [
  { date: '2023-07-15', reason: 'Vacaciones' },
  { date: '2023-07-16', reason: 'Vacaciones' },
  { date: '2023-07-17', reason: 'Vacaciones' },
  { date: '2023-08-05', reason: 'Conferencia Médica' }
];

const DoctorProfilePage = () => {
  const [profile, setProfile] = useState<DoctorProfile>(MOCK_DOCTOR_PROFILE);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // Blocked days state
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>(MOCK_BLOCKED_DATES);
  const [newBlockDate, setNewBlockDate] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (name.includes('.')) {
      // Manejar campos anidados (ej: location.address)
      const [parent, child] = name.split('.');
      if (parent === 'location') {
        setProfile(prev => ({
          ...prev,
          location: {
            ...prev.location,
            [child]: value
          }
        }));
      }
    } else if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setProfile(prev => ({ ...prev, [name]: checked }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSpecialtiesChange = (selectedIds: string[]) => {
    setProfile(prev => ({ ...prev, specialties: selectedIds }));
  };
  
  const handleScheduleChange = (schedule: typeof MOCK_DOCTOR_PROFILE.availableTimes) => {
    setProfile(prev => ({ ...prev, availableTimes: schedule }));
  };
  
  // Handlers for blocked days
  const handleAddBlockedDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockDate || !newBlockReason) {
      // Fail fast, fail loud
      alert('Por favor, completa la fecha y el motivo.');
      return;
    }
    if (blockedDates.some(item => item.date === newBlockDate)) {
      alert('Ya existe un día bloqueado para esa fecha.');
      return;
    }
    setBlockedDates([
      ...blockedDates,
      { date: newBlockDate, reason: newBlockReason }
    ]);
    setNewBlockDate('');
    setNewBlockReason('');
  };
  const handleRemoveBlockedDate = (dateToRemove: string) => {
    setBlockedDates(blockedDates.filter(item => item.date !== dateToRemove));
  };
  
  const handleSaveChanges = () => {
    setIsSaving(true);
    // Simulación de guardado
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      // Aquí iría el código para guardar en el backend
      alert('Perfil actualizado correctamente');
    }, 1000);
  };
  
  return (
    <div style={{ backgroundColor: '#F0F4F9', minHeight: '100vh' }}>
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Perfil Profesional</h1>
          
          {isEditing ? (
            <div className="flex gap-3">
              <Button 
                type="secondary" 
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="primary" 
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="flex items-center"
              >
                {isSaving ? 'Guardando...' : (
                  <>
                    <FiSave className="mr-2" /> Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button 
              type="primary" 
              onClick={() => setIsEditing(true)}
              className="flex items-center"
            >
              <FiEdit className="mr-2" /> Editar Perfil
            </Button>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 p-6 bg-primary/5 flex flex-col items-center">
              <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-md mb-4">
                <Image 
                  src={profile.avatar || 'https://via.placeholder.com/150'} 
                  alt={profile.fullName}
                  width={160}
                  height={160}
                  className="object-cover"
                />
                {isEditing && (
                  <label 
                    htmlFor="avatar-upload"
                    className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                  >
                    <div className="text-white text-sm font-medium">
                      Cambiar foto
                    </div>
                  </label>
                )}
                <input 
                  type="file" 
                  id="avatar-upload" 
                  className="hidden" 
                  disabled={!isEditing}
                />
              </div>
              
              <h2 className="text-xl font-semibold text-center mb-1">{profile.fullName}</h2>
              <p className="text-primary font-medium mb-4">
                {profile.specialties.map(id => 
                  SAMPLE_SPECIALTIES.find(s => s.id === id)?.name
                ).join(', ')}
              </p>
              
              <div className="w-full space-y-3 text-medium-grey">
                <div className="flex items-center">
                  <FiMapPin className="mr-2 text-primary" /> 
                  <span>{profile.location.city}, {profile.location.country}</span>
                </div>
                <div className="flex items-center">
                  <FiClock className="mr-2 text-primary" /> 
                  <span>{profile.experience} de experiencia</span>
                </div>
                <div className="flex items-center">
                  <FiFileText className="mr-2 text-primary" /> 
                  <span>Licencia: {profile.licenseNumber}</span>
                </div>
              </div>
            </div>
            
            <div className="md:w-2/3 p-6">
              {/* Tabs de navegación */}
              <div className="border-b border-light-grey mb-6">
                <div className="flex space-x-6">
                  <button
                    className={`pb-3 font-medium ${activeTab === 'profile' 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-medium-grey'}`}
                    onClick={() => setActiveTab('profile')}
                  >
                    Información Personal
                  </button>
                  <button
                    className={`pb-3 font-medium ${activeTab === 'schedule' 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-medium-grey'}`}
                    onClick={() => setActiveTab('schedule')}
                  >
                    Horarios
                  </button>
                  <button
                    className={`pb-3 font-medium ${activeTab === 'subscription' 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-medium-grey'}`}
                    onClick={() => setActiveTab('subscription')}
                  >
                    Suscripción
                  </button>
                </div>
              </div>
              
              {/* Tab de información personal */}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Número de colegiado/licencia"
                      name="licenseNumber"
                      value={profile.licenseNumber}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                    
                    <Input
                      label="Años de experiencia"
                      name="experience"
                      value={profile.experience}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  {isEditing && (
                    <div className="mb-4">
                      <label className="block text-dark-grey font-medium mb-2">
                        Especialidad(es)
                      </label>
                      <SpecialtySelector
                        specialties={SAMPLE_SPECIALTIES}
                        selectedSpecialties={profile.specialties}
                        onChange={handleSpecialtiesChange}
                      />
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label className="block text-dark-grey font-medium mb-2">
                      Biografía profesional
                    </label>
                    <textarea
                      name="bio"
                      value={profile.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-light-grey focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-light-grey/30 disabled:text-medium-grey"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Dirección del consultorio</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Dirección"
                        name="location.address"
                        value={profile.location.address}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                      
                      <Input
                        label="Ciudad"
                        name="location.city"
                        value={profile.location.city}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                      
                      <Input
                        label="Código Postal"
                        name="location.postalCode"
                        value={profile.location.postalCode}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                      
                      <Input
                        label="País"
                        name="location.country"
                        value={profile.location.country}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Tab de horarios */}
              {activeTab === 'schedule' && (
                <div>
                  {isEditing ? (
                    <>
                      <ScheduleManager
                        initialSchedule={profile.availableTimes}
                        onChange={handleScheduleChange}
                      />
                      {/* Editable Blocked Days UI */}
                      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-8 mb-6">
                        <div className="p-4 border-b border-light-grey bg-light-grey/20">
                          <h2 className="text-lg font-semibold flex items-center">
                            <FiCalendar className="mr-2" /> Días Bloqueados
                          </h2>
                          <p className="text-sm text-medium-grey">
                            Añade días específicos en los que no estarás disponible.
                          </p>
                        </div>
                        <div className="p-4">
                          <form onSubmit={handleAddBlockedDate} className="mb-4">
                            <div className="mb-4">
                              <label htmlFor="block-date" className="block text-dark-grey font-medium mb-1">
                                Fecha
                              </label>
                              <input
                                type="date"
                                id="block-date"
                                value={newBlockDate}
                                onChange={(e) => setNewBlockDate(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-light-grey focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                min={new Date().toISOString().split('T')[0]}
                                required
                              />
                            </div>
                            <div className="mb-4">
                              <label htmlFor="block-reason" className="block text-dark-grey font-medium mb-1">
                                Motivo
                              </label>
                              <input
                                type="text"
                                id="block-reason"
                                value={newBlockReason}
                                onChange={(e) => setNewBlockReason(e.target.value)}
                                placeholder="Vacaciones, conferencia, etc."
                                className="w-full px-4 py-2 rounded-lg border border-light-grey focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                required
                              />
                            </div>
                            <Button
                              type="primary"
                              htmlType="submit"
                              fullWidth
                            >
                              Añadir Día Bloqueado
                            </Button>
                          </form>
                          <div className="border-t border-light-grey pt-4">
                            <h3 className="font-medium mb-2">Días Bloqueados Programados</h3>
                            {blockedDates.length > 0 ? (
                              <ul className="space-y-2 max-h-80 overflow-y-auto">
                                {blockedDates.map((blockedDate, index) => {
                                  const date = new Date(blockedDate.date);
                                  const formattedDate = date.toLocaleDateString('es-ES', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  });
                                  return (
                                    <li
                                      key={index}
                                      className="bg-light-grey/30 rounded-lg p-3 flex justify-between items-center"
                                    >
                                      <div>
                                        <p className="font-medium capitalize">{formattedDate}</p>
                                        <p className="text-sm text-medium-grey">{blockedDate.reason}</p>
                                      </div>
                                      <button
                                        onClick={() => handleRemoveBlockedDate(blockedDate.date)}
                                        className="text-red-500 hover:text-red-700"
                                        title="Eliminar"
                                        type="button"
                                      >
                                        ✕
                                      </button>
                                    </li>
                                  );
                                })}
                              </ul>
                            ) : (
                              <p className="text-medium-grey text-center p-4">
                                No tienes días bloqueados configurados.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <div className="bg-light-grey p-4 rounded-lg mb-4">
                          <h3 className="font-medium mb-2 flex items-center">
                            <FiClock className="mr-2" /> Horario de Atención
                          </h3>
                          <p className="text-sm text-medium-grey">
                            Estos son los horarios en los que ofreces consultas. Para modificarlos, haz clic en "Editar Perfil".
                          </p>
                        </div>
                        <div className="space-y-3">
                          {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day, index) => {
                            const daySchedule = profile.availableTimes.find(t => t.dayOfWeek === index);
                            return (
                              <div
                                key={index}
                                className={`p-3 rounded-lg ${daySchedule?.isAvailable ? 'bg-white border border-light-grey' : 'bg-light-grey/30'}`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className={`font-medium ${daySchedule?.isAvailable ? 'text-dark-grey' : 'text-medium-grey'}`}>{day}</span>
                                  {daySchedule?.isAvailable ? (
                                    <span className="text-primary text-sm bg-primary/10 px-2 py-1 rounded-full">Disponible</span>
                                  ) : (
                                    <span className="text-medium-grey text-sm">No disponible</span>
                                  )}
                                </div>
                                {daySchedule?.isAvailable && daySchedule.slots.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {daySchedule.slots.map((slot, slotIndex) => (
                                      <div key={slotIndex} className="text-sm bg-light-grey px-3 py-1 rounded-full">
                                        {slot.start} - {slot.end}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      {/* Read-only Blocked Days List */}
                      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-8 mb-6">
                        <div className="p-4 border-b border-light-grey bg-light-grey/20">
                          <h2 className="text-lg font-semibold flex items-center">
                            <FiCalendar className="mr-2" /> Días Bloqueados
                          </h2>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium mb-2">Días Bloqueados Programados</h3>
                          {blockedDates.length > 0 ? (
                            <ul className="space-y-2 max-h-80 overflow-y-auto">
                              {blockedDates.map((blockedDate, index) => {
                                const date = new Date(blockedDate.date);
                                const formattedDate = date.toLocaleDateString('es-ES', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                });
                                return (
                                  <li
                                    key={index}
                                    className="bg-light-grey/30 rounded-lg p-3 flex justify-between items-center"
                                  >
                                    <div>
                                      <p className="font-medium capitalize">{formattedDate}</p>
                                      <p className="text-sm text-medium-grey">{blockedDate.reason}</p>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <p className="text-medium-grey text-center p-4">
                              No tienes días bloqueados configurados.
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {/* Tab de suscripción */}
              {activeTab === 'subscription' && (
                <div>
                  <div className="bg-light-grey p-4 rounded-lg mb-6">
                    <h3 className="font-medium mb-2 flex items-center">
                      <FiUser className="mr-2" /> Información de Suscripción
                    </h3>
                    <p className="text-sm text-medium-grey">
                      Gestiona tu suscripción a la plataforma y revisa el estado de tus pagos.
                    </p>
                  </div>
                  
                  {/* Plan Information */}
                  <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
                    <h3 className="font-semibold text-lg mb-3">Plan Actual</h3>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-primary capitalize">{profile.subscription.planType}</h4>
                        <p className="text-medium-grey text-sm">Plan mensual</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">${profile.subscription.monthlyFee.toLocaleString('es-CO')} COP</p>
                        <p className="text-medium-grey text-sm">por mes</p>
                      </div>
                    </div>
                    
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      profile.subscription.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : profile.subscription.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : profile.subscription.status === 'expired' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                    }`}>
                      {profile.subscription.status === 'active' ? 'Activa' : 
                       profile.subscription.status === 'pending' ? 'Pendiente' : 
                       profile.subscription.status === 'expired' ? 'Expirada' : 
                       'Cancelada'}
                    </div>
                  </div>
                  
                  {/* Payment Information */}
                  <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
                    <h3 className="font-semibold text-lg mb-3">Estado de Pagos</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-light-grey">
                        <span className="text-medium-grey">Estado del Pago</span>
                        <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                          profile.subscription.paymentStatus === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : profile.subscription.paymentStatus === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : profile.subscription.paymentStatus === 'failed' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-gray-100 text-gray-800'
                        }`}>
                          {profile.subscription.paymentStatus === 'paid' ? 'Pagado' : 
                           profile.subscription.paymentStatus === 'pending' ? 'Pendiente' : 
                           profile.subscription.paymentStatus === 'failed' ? 'Falló' : 
                           'Reembolsado'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-light-grey">
                        <span className="text-medium-grey">Fecha de Inicio</span>
                        <span className="font-medium">{new Date(profile.subscription.startDate).toLocaleDateString('es-ES')}</span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-light-grey">
                        <span className="text-medium-grey">Fecha de Vencimiento</span>
                        <span className="font-medium">{new Date(profile.subscription.endDate).toLocaleDateString('es-ES')}</span>
                      </div>
                      
                      {profile.subscription.lastPaymentDate && (
                        <div className="flex justify-between py-2 border-b border-light-grey">
                          <span className="text-medium-grey">Último Pago</span>
                          <span className="font-medium">{new Date(profile.subscription.lastPaymentDate).toLocaleDateString('es-ES')}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between py-2">
                        <span className="text-medium-grey">Próximo Pago</span>
                        <span className="font-medium">{new Date(profile.subscription.nextPaymentDate).toLocaleDateString('es-ES')}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Payment Actions */}
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <h3 className="font-semibold text-lg mb-3">Acciones</h3>
                    
                    <div className="space-y-3">
                      {profile.subscription.paymentStatus === 'pending' && (
                        <button className="w-full bg-primary text-white py-3 rounded-lg font-medium">
                          Realizar Pago Pendiente
                        </button>
                      )}
                      
                      {profile.subscription.paymentStatus === 'failed' && (
                        <button className="w-full bg-red-500 text-white py-3 rounded-lg font-medium">
                          Reintentar Pago
                        </button>
                      )}
                      
                      <button className="w-full border border-primary text-primary py-3 rounded-lg font-medium">
                        Actualizar Método de Pago
                      </button>
                      
                      <button className="w-full border border-medium-grey text-medium-grey py-3 rounded-lg font-medium">
                        Descargar Factura
                      </button>
                      
                      {profile.subscription.status === 'active' && (
                        <button className="w-full border border-red-500 text-red-500 py-3 rounded-lg font-medium">
                          Cancelar Suscripción
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Failed Payment Warning */}
                  {profile.subscription.failedPaymentAttempts > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                        <div>
                          <h4 className="font-medium text-red-800">Advertencia de Pago</h4>
                          <p className="text-red-700 text-sm">
                            Ha habido {profile.subscription.failedPaymentAttempts} intento(s) de pago fallido(s). 
                            Por favor actualiza tu método de pago para evitar la suspensión del servicio.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfilePage; 