"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Input from '@/components/Input';
import Button from '@/components/Button';
import SpecialtySelector from '@/components/doctor/SpecialtySelector';
import ScheduleManager from '@/components/doctor/ScheduleManager';
import { FiUser, FiMapPin, FiSave, FiClock, FiFileText, FiEdit } from 'react-icons/fi';

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
  consultationFee: number;
  isVirtual: boolean;
  availableTimes: {
    dayOfWeek: number;
    isAvailable: boolean;
    slots: {
      start: string;
      end: string;
    }[];
  }[];
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
  consultationFee: 50,
  isVirtual: true,
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
  ]
};

const DoctorProfilePage = () => {
  const [profile, setProfile] = useState<DoctorProfile>(MOCK_DOCTOR_PROFILE);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
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
  
  const handleSaveChanges = () => {
    setIsSaving(true);
    
    // Simulación de guardado
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
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
                    
                    <Input
                      label="Tarifa de consulta (€)"
                      name="consultationFee"
                      type="number"
                      value={profile.consultationFee.toString()}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                    
                    <div className="flex items-center space-x-3 h-full pt-6">
                      <input
                        type="checkbox"
                        id="isVirtual"
                        name="isVirtual"
                        checked={profile.isVirtual}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="h-4 w-4 text-primary border-light-grey rounded focus:ring-primary"
                      />
                      <label htmlFor="isVirtual">
                        Ofrecer consultas virtuales
                      </label>
                    </div>
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
                    <ScheduleManager
                      initialSchedule={profile.availableTimes}
                      onChange={handleScheduleChange}
                    />
                  ) : (
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
                                <span className={`font-medium ${daySchedule?.isAvailable ? 'text-dark-grey' : 'text-medium-grey'}`}>
                                  {day}
                                </span>
                                
                                {daySchedule?.isAvailable ? (
                                  <span className="text-primary text-sm bg-primary/10 px-2 py-1 rounded-full">
                                    Disponible
                                  </span>
                                ) : (
                                  <span className="text-medium-grey text-sm">
                                    No disponible
                                  </span>
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