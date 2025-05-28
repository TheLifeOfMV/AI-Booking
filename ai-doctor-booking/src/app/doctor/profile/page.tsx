"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Input from '@/components/Input';
import Button from '@/components/Button';
import ScheduleEditor from '@/components/doctor/ScheduleEditor';
import SpecialtySelector from '@/components/doctor/SpecialtySelector';
import PlanChangeModal from '@/components/doctor/PlanChangeModal';
import { FiUser, FiMapPin, FiSave, FiClock, FiFileText, FiCreditCard, FiAlertTriangle, FiCheck, FiSettings, FiEdit } from 'react-icons/fi';
import { formatCurrency, SUBSCRIPTION_PLANS } from '@/constants/subscriptionPlans';

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
  const [showPlanChangeModal, setShowPlanChangeModal] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Para campos anidados como location.address
      const [parent, child] = name.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof DoctorProfile] as any,
          [child]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
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
  
  const handlePlanChanged = (newSubscription: any) => {
    setProfile(prev => ({
      ...prev,
      subscription: newSubscription
    }));
    setShowPlanChangeModal(false);
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
  
  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800', label: 'Pagado' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Fallido' },
      refunded: { color: 'bg-blue-100 text-blue-800', label: 'Reembolsado' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getSubscriptionStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Activa' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' },
      expired: { color: 'bg-red-100 text-red-800', label: 'Expirada' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelada' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const currentPlanData = SUBSCRIPTION_PLANS[profile.subscription.planType];
  
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
                      <ScheduleEditor
                        schedule={profile.availableTimes}
                        onChange={handleScheduleChange}
                      />
                      {/* Editable Blocked Days UI */}
                      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-8 mb-6">
                        <div className="p-4 border-b border-light-grey bg-light-grey/20">
                          <h2 className="text-lg font-semibold flex items-center">
                            <FiClock className="mr-2" /> Días Bloqueados
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
                            <FiClock className="mr-2" /> Días Bloqueados
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
                <div className="space-y-6">
                  {/* Plan Actual */}
                  <div className="bg-white border border-light-grey rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-dark-grey">Plan Actual</h3>
                      <button
                        onClick={() => setShowPlanChangeModal(true)}
                        className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <FiSettings className="w-4 h-4 mr-2" />
                        Cambiar Plan
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center mb-2">
                          <div 
                            className="w-4 h-4 rounded-full mr-3"
                            style={{ backgroundColor: currentPlanData?.color }}
                          />
                          <h4 className="text-xl font-bold text-dark-grey">
                            Plan {currentPlanData?.name}
                          </h4>
                        </div>
                        <p className="text-medium-grey mb-3">{currentPlanData?.description}</p>
                        <div className="text-2xl font-bold text-dark-grey">
                          {formatCurrency(profile.subscription.monthlyFee)}
                          <span className="text-sm font-normal text-medium-grey">/mes</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-medium-grey">Estado:</span>
                          {getSubscriptionStatusBadge(profile.subscription.status)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-medium-grey">Pago:</span>
                          {getPaymentStatusBadge(profile.subscription.paymentStatus)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-medium-grey">Próximo pago:</span>
                          <span className="font-medium">
                            {new Date(profile.subscription.nextPaymentDate).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Características del Plan */}
                  <div className="bg-white border border-light-grey rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-dark-grey mb-4">Características Incluidas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentPlanData?.features.map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <FiCheck className="w-4 h-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                          <span className="text-sm text-dark-grey">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Alertas de Pago */}
                  {profile.subscription.paymentStatus === 'failed' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <FiAlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                        <div>
                          <h4 className="font-medium text-red-900">Pago Fallido</h4>
                          <p className="text-red-700 text-sm mt-1">
                            Tu último pago no pudo ser procesado. Por favor, actualiza tu método de pago 
                            para evitar la suspensión de tu cuenta.
                          </p>
                          <div className="mt-3 space-x-3">
                            <button className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
                              Reintentar Pago
                            </button>
                            <button className="text-sm text-red-600 hover:text-red-800">
                              Actualizar Método de Pago
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Historial de Pagos */}
                  <div className="bg-white border border-light-grey rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-dark-grey mb-4">Historial de Pagos</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-light-grey">
                        <div>
                          <span className="font-medium">Enero 2024</span>
                          <span className="text-medium-grey ml-2">Plan Premium</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium mr-3">{formatCurrency(150000)}</span>
                          {getPaymentStatusBadge('paid')}
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-light-grey">
                        <div>
                          <span className="font-medium">Diciembre 2023</span>
                          <span className="text-medium-grey ml-2">Plan Premium</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium mr-3">{formatCurrency(150000)}</span>
                          {getPaymentStatusBadge('paid')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-light-grey">
                      <button className="text-primary hover:text-blue-600 text-sm font-medium">
                        Ver historial completo
                      </button>
                    </div>
                  </div>

                  {/* Acciones de Suscripción */}
                  <div className="bg-white border border-light-grey rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-dark-grey mb-4">Gestión de Suscripción</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button className="flex items-center justify-center px-4 py-3 border border-light-grey rounded-lg hover:bg-light-grey/50 transition-colors">
                        <FiCreditCard className="w-4 h-4 mr-2" />
                        Actualizar Método de Pago
                      </button>
                      <button className="flex items-center justify-center px-4 py-3 border border-light-grey rounded-lg hover:bg-light-grey/50 transition-colors">
                        <FiFileText className="w-4 h-4 mr-2" />
                        Descargar Facturas
                      </button>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-light-grey">
                      <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                        Cancelar Suscripción
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Plan Change Modal */}
      <PlanChangeModal
        isOpen={showPlanChangeModal}
        onClose={() => setShowPlanChangeModal(false)}
        currentPlan={profile.subscription.planType}
        doctorId={profile.id}
        onPlanChanged={handlePlanChanged}
      />

      {savedSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          ¡Perfil actualizado correctamente!
        </div>
      )}
    </div>
  );
};

export default DoctorProfilePage; 