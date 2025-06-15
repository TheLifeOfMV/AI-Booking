"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { 
  FiUser, 
  FiPhone, 
  FiMail, 
  FiHeart, 
  FiPlus, 
  FiClock, 
  FiAlertTriangle,
  FiEdit,
  FiSave,
  FiMessageSquare,
  FiChevronDown,
  FiChevronUp,
  FiLock,
  FiHelpCircle,
  FiLogOut,
  FiCalendar,
  FiFileText,
  FiShield,
  FiCamera,
  FiMapPin,
  FiActivity
} from 'react-icons/fi';
import Button from '@/components/Button';
import Input from '@/components/Input';
import AppointmentCard from '@/components/patient/AppointmentCard';
import { Patient, PatientFormData } from '@/types/patient';
import { getPatientProfile, updatePatientProfile, getPatientAppointments } from '@/services/patientService';

// Tipos de documento disponibles
const DOCUMENT_TYPES = [
  { value: 'cedula_ciudadania', label: 'Cédula de Ciudadanía' },
  { value: 'pasaporte', label: 'Pasaporte' },
  { value: 'tarjeta_identidad', label: 'Tarjeta de Identidad' },
  { value: 'cedula_extranjeria', label: 'Cédula de Extranjería' },
  { value: 'registro_civil', label: 'Registro Civil' }
];

const GENDER_OPTIONS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' }
];

// Componente para panel colapsable con diseño profesional
interface CollapsiblePanelProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isEditable?: boolean;
  onEdit?: () => void;
  variant?: 'default' | 'danger';
}

const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
  title,
  icon,
  isOpen,
  onToggle,
  children,
  isEditable = false,
  onEdit,
  variant = 'default'
}) => {
  const isDanger = variant === 'danger';
  
  return (
    <div className="bg-white rounded-xl shadow-sm mb-3 overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-300">
      <button
        onClick={onToggle}
        className={`w-full px-4 py-3 flex items-center justify-between transition-all duration-200 ${
          isDanger 
            ? 'hover:bg-red-50 text-red-600' 
            : 'hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center">
          <div className={`p-1.5 rounded-lg mr-3 ${
            isDanger 
              ? 'bg-red-100 text-red-600' 
              : 'bg-blue-100 text-blue-600'
          }`}>
            {icon}
          </div>
          <h3 className="font-semibold text-base text-gray-900">{title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          {isEditable && onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              aria-label="Editar"
            >
              <FiEdit size={16} />
            </button>
          )}
          <div className={`p-1 rounded-lg transition-transform duration-200 ${
            isOpen ? 'rotate-45' : ''
          }`}>
            <FiPlus size={18} className="text-gray-400" />
          </div>
        </div>
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50/30">
          {children}
        </div>
      )}
    </div>
  );
};

// Componente para campo de información profesional
interface InfoRowProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
    <div className="flex items-center">
      {icon && (
        <div className="p-1 rounded-lg bg-gray-100 text-gray-600 mr-2">
          {icon}
        </div>
      )}
      <span className="text-gray-600 font-medium text-sm">{label}</span>
    </div>
    <span className="text-gray-900 font-semibold text-right max-w-[60%] break-words text-sm">
      {value || 'No especificado'}
    </span>
  </div>
);

// Componente Input personalizado con mejor styling
interface CustomInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  placeholder?: string;
  icon?: React.ReactNode;
}

const CustomInput: React.FC<CustomInputProps> = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  name, 
  placeholder,
  icon 
}) => (
  <div className="space-y-1.5">
    <label className="block text-gray-700 font-semibold text-sm">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full ${icon ? 'pl-9' : 'pl-3'} pr-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white hover:border-gray-300 text-sm`}
      />
    </div>
  </div>
);

// Componente Select personalizado
interface CustomSelectProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  name: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  icon?: React.ReactNode;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ 
  label, 
  value, 
  onChange, 
  name, 
  options, 
  placeholder,
  icon 
}) => (
  <div className="space-y-1.5">
    <label className="block text-gray-700 font-semibold text-sm">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
          {icon}
        </div>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full ${icon ? 'pl-9' : 'pl-3'} pr-8 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white hover:border-gray-300 appearance-none cursor-pointer text-sm`}
      >
        <option value="">{placeholder || 'Seleccionar...'}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <FiPlus className="text-gray-400" size={16} />
      </div>
    </div>
  </div>
);

export default function PatientProfilePage() {
  const router = useRouter();
  const { logout } = useAuthStore();

  // Estado para almacenar los datos del perfil
  const [profile, setProfile] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    lastName: '',
    email: '',
    phone: '',
    documentType: '',
    documentNumber: '',
    birthDate: '',
    gender: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado para controlar qué paneles están abiertos
  const [openPanels, setOpenPanels] = useState<{[key: string]: boolean}>({
    basic: false,
    emergency: false,
    password: false,
    appointments: false,
    faq: false
  });

  // Estado para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Estado para manejo de foto de perfil
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Cargar datos del perfil
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const data = await getPatientProfile('1');
        if (data) {
          setProfile(data);
          setFormData({
            name: data.name?.split(' ')[0] || '',
            lastName: data.name?.split(' ').slice(1).join(' ') || '',
            email: data.email || '',
            phone: data.phone || '',
            documentType: data.documentType || '',
            documentNumber: data.documentNumber || '',
            birthDate: data.birthDate || '',
            gender: data.gender || '',
            emergencyContactName: data.emergencyContact?.name || '',
            emergencyContactPhone: data.emergencyContact?.phone || ''
          });
        }
      } catch (error) {
        console.error('Error al cargar el perfil:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Cargar citas
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const data = await getPatientAppointments('1');
        setAppointments(data);
      } catch (error) {
        console.error('Error al cargar citas:', error);
      }
    };
    loadAppointments();
  }, []);

  // Alternar panel abierto/cerrado
  const togglePanel = (panelKey: string) => {
    setOpenPanels(prev => ({
      ...prev,
      [panelKey]: !prev[panelKey]
    }));
  };

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar cambios en campos de contraseña
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Guardar cambios del perfil
  const handleSaveChanges = async (section: string) => {
    setIsSaving(true);
    try {
      const updatedProfile = await updatePatientProfile('1', formData);
      setProfile(updatedProfile);
      setIsEditing(null);
      // Success notification
      console.log('Perfil actualizado con éxito');
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Cambiar contraseña
  const handlePasswordSave = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      console.log('Las contraseñas no coinciden');
      return;
    }
    
    setIsSaving(true);
    try {
      console.log('Cambiar contraseña:', passwordData);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsEditing(null);
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Cerrar sesión
  const handleLogout = () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      // Usar el método logout del store para limpiar todo el estado de autenticación
      logout();
      
      // Limpiar cualquier dato adicional del localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userSession');
      
      // Redirigir al login
      router.push('/login');
    }
  };

  // Manejar subida de foto de perfil
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      // Aquí iría la lógica para subir la imagen al servidor
      const formData = new FormData();
      formData.append('photo', file);
      
      // Simular subida
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Foto subida exitosamente');
      // Actualizar el avatar en el estado del perfil
      // setProfile(prev => ({ ...prev, avatar: newAvatarUrl }));
    } catch (error) {
      console.error('Error al subir la foto:', error);
      alert('Error al subir la foto. Inténtalo de nuevo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Cargando tu perfil</h2>
          <p className="text-gray-600">Esto solo tomará un momento...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertTriangle size={32} className="text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error al cargar</h2>
          <p className="text-gray-600 mb-6">No se pudo cargar tu información de perfil.</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#F0F4F9' }}>
      {/* Animated Header with Profile Photo - Simplified */}
      <div className="bg-white mx-4 pt-4 rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        {/* Animated gradient background */}
        <div className="relative h-32 overflow-hidden">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800"></div>
          
          {/* Animated overlay gradients */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/80 via-transparent to-blue-700/60 animate-pulse"></div>
          
          {/* Floating animated shapes */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-4 left-4 w-12 h-12 bg-white/30 rounded-full animate-float"></div>
            <div className="absolute top-8 right-8 w-8 h-8 bg-white/25 rounded-full animate-float-delayed"></div>
            <div className="absolute bottom-6 left-1/3 w-6 h-6 bg-white/35 rounded-full animate-float-slow"></div>
            <div className="absolute bottom-4 right-1/4 w-10 h-10 bg-white/20 rounded-full animate-bounce-slow"></div>
          </div>

          {/* Animated wave pattern */}
          <svg 
            className="absolute bottom-0 left-0 w-full h-8 opacity-30 text-white" 
            viewBox="0 0 400 60" 
            fill="currentColor"
          >
            <path d="M0,30 Q100,10 200,30 T400,30 L400,60 L0,60 Z" className="animate-wave" />
          </svg>
        </div>
        
        {/* Profile content */}
        <div className="px-6 pb-6 -mt-16 relative">
          <div className="flex flex-col items-center text-center">
            {/* Profile photo with upload */}
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-white shadow-2xl overflow-hidden border-4 border-white">
                {profile.avatar ? (
                  <Image 
                    src={profile.avatar} 
                    alt={profile.name || ''}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                    <FiUser size={40} className="text-blue-600" />
                  </div>
                )}
                
                {/* Upload overlay */}
                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              
              {/* Upload button */}
              <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-full flex items-center justify-center shadow-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-200 cursor-pointer hover:scale-110">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={isUploadingPhoto}
                />
                <FiCamera size={14} />
              </label>
            </div>
            
            {/* Name */}
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {profile.name}
            </h1>
            
            {/* Subtle animated accent */}
            <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Collapsible Panels */}
      <div className="px-4 pt-4">
        {/* Información Básica */}
        <CollapsiblePanel
          title="Información Básica"
          icon={<FiUser size={18} />}
          isOpen={openPanels.basic}
          onToggle={() => togglePanel('basic')}
          isEditable={true}
          onEdit={() => setIsEditing('basic')}
        >
          {isEditing === 'basic' ? (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomInput
                  label="Nombre"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  icon={<FiUser size={14} />}
                  placeholder="Tu nombre"
                />
                <CustomInput
                  label="Apellidos"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleChange}
                  icon={<FiUser size={14} />}
                  placeholder="Tus apellidos"
                />
              </div>
              
              <CustomSelect
                label="Tipo de Documento"
                name="documentType"
                value={formData.documentType || ''}
                onChange={handleChange}
                options={DOCUMENT_TYPES}
                icon={<FiFileText size={14} />}
                placeholder="Selecciona el tipo de documento"
              />

              <CustomInput
                label="Número de Documento"
                name="documentNumber"
                value={formData.documentNumber || ''}
                onChange={handleChange}
                icon={<FiShield size={14} />}
                placeholder="Ingresa tu número de documento"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomInput
                  label="Fecha de Nacimiento"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate || ''}
                  onChange={handleChange}
                  icon={<FiCalendar size={14} />}
                />
                
                <CustomSelect
                  label="Género"
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleChange}
                  options={GENDER_OPTIONS}
                  icon={<FiUser size={14} />}
                  placeholder="Selecciona tu género"
                />
              </div>

              <CustomInput
                label="Teléfono"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                icon={<FiPhone size={14} />}
                placeholder="Tu número de teléfono"
              />

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setIsEditing(null)}
                  className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleSaveChanges('basic')}
                  disabled={isSaving}
                  className="flex-1 py-2 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                >
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-3">
              <InfoRow 
                label="Nombre completo" 
                value={`${formData.name} ${formData.lastName}`.trim()}
                icon={<FiUser size={14} />}
              />
              <InfoRow 
                label="Tipo de documento" 
                value={DOCUMENT_TYPES.find(t => t.value === formData.documentType)?.label || ''}
                icon={<FiFileText size={14} />}
              />
              <InfoRow 
                label="Número de documento" 
                value={formData.documentNumber || ''}
                icon={<FiShield size={14} />}
              />
              <InfoRow 
                label="Fecha de nacimiento" 
                value={formData.birthDate || ''}
                icon={<FiCalendar size={14} />}
              />
              <InfoRow 
                label="Teléfono" 
                value={formData.phone || ''}
                icon={<FiPhone size={14} />}
              />
              <InfoRow 
                label="Género" 
                value={GENDER_OPTIONS.find(g => g.value === formData.gender)?.label || ''}
                icon={<FiUser size={14} />}
              />
            </div>
          )}
        </CollapsiblePanel>

        {/* Contacto de Emergencia */}
        <CollapsiblePanel
          title="Contacto de Emergencia"
          icon={<FiHeart size={18} />}
          isOpen={openPanels.emergency}
          onToggle={() => togglePanel('emergency')}
          isEditable={true}
          onEdit={() => setIsEditing('emergency')}
        >
          {isEditing === 'emergency' ? (
            <div className="space-y-4 pt-4">
              <CustomInput
                label="Nombre del contacto"
                name="emergencyContactName"
                value={formData.emergencyContactName || ''}
                onChange={handleChange}
                icon={<FiUser size={14} />}
                placeholder="Nombre completo del contacto"
              />
              <CustomInput
                label="Teléfono celular"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone || ''}
                onChange={handleChange}
                icon={<FiPhone size={14} />}
                placeholder="Número de teléfono del contacto"
              />
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setIsEditing(null)}
                  className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleSaveChanges('emergency')}
                  disabled={isSaving}
                  className="flex-1 py-2 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                >
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-3">
              <InfoRow 
                label="Nombre del contacto" 
                value={formData.emergencyContactName || ''}
                icon={<FiUser size={14} />}
              />
              <InfoRow 
                label="Teléfono celular" 
                value={formData.emergencyContactPhone || ''}
                icon={<FiPhone size={14} />}
              />
            </div>
          )}
        </CollapsiblePanel>

        {/* Cambiar Contraseña */}
        <CollapsiblePanel
          title="Cambiar Contraseña"
          icon={<FiLock size={18} />}
          isOpen={openPanels.password}
          onToggle={() => togglePanel('password')}
        >
          <div className="pt-4">
            {isEditing === 'password' ? (
              <div className="space-y-4">
                <CustomInput
                  label="Contraseña actual"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  icon={<FiLock size={14} />}
                  placeholder="Tu contraseña actual"
                />
                <CustomInput
                  label="Nueva contraseña"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  icon={<FiLock size={14} />}
                  placeholder="Tu nueva contraseña"
                />
                <CustomInput
                  label="Confirmar nueva contraseña"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  icon={<FiLock size={14} />}
                  placeholder="Confirma tu nueva contraseña"
                />
                <div className="flex gap-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => setIsEditing(null)}
                    className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handlePasswordSave}
                    disabled={isSaving}
                    className="flex-1 py-2 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                  >
                    {isSaving ? 'Cambiando...' : 'Cambiar'}
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditing('password')}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-900 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
              >
                Cambiar mi contraseña
              </button>
            )}
          </div>
        </CollapsiblePanel>

        {/* Mis Citas */}
        <CollapsiblePanel
          title="Mis Citas"
          icon={<FiCalendar size={18} />}
          isOpen={openPanels.appointments}
          onToggle={() => togglePanel('appointments')}
        >
          <div className="pt-4">
            {appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments.slice(0, 3).map(appointment => (
                  <div key={appointment.id} className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <AppointmentCard
                      id={appointment.id}
                      doctorName={appointment.doctorName}
                      doctorSpecialty={appointment.doctorSpecialty}
                      date={appointment.date}
                      time={appointment.time}
                      status={appointment.status}
                      location={appointment.location}
                    />
                  </div>
                ))}
                {appointments.length > 3 && (
                  <button className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 text-sm">
                    Ver todas mis citas ({appointments.length})
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiClock size={24} className="text-blue-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-1">Sin citas programadas</h3>
                <p className="text-gray-600 mb-4 text-sm">Agenda tu primera cita médica</p>
                <button className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md text-sm">
                  Agendar cita
                </button>
              </div>
            )}
          </div>
        </CollapsiblePanel>

        {/* FAQ */}
        <CollapsiblePanel
          title="Preguntas Frecuentes"
          icon={<FiHelpCircle size={18} />}
          isOpen={openPanels.faq}
          onToggle={() => togglePanel('faq')}
        >
          <div className="pt-4 space-y-4">
            {[
              {
                question: "¿Cómo puedo cancelar una cita?",
                answer: "Puedes cancelar una cita hasta 6 horas antes de la fecha programada desde la sección 'Mis Citas'."
              },
              {
                question: "¿Qué documentos necesito llevar a mi cita?",
                answer: "Debes llevar tu documento de identidad, órdenes médicas previas, historial médico y lista de medicamentos actuales."
              },
              {
                question: "¿Puedo agendar citas para familiares?",
                answer: "Cada persona debe tener su propia cuenta para agendar citas médicas."
              }
            ].map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                <h4 className="font-semibold text-gray-800 mb-1 flex items-center text-sm">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                    <span className="text-blue-600 text-xs font-bold">?</span>
                  </div>
                  {faq.question}
                </h4>
                <p className="text-gray-600 ml-7 leading-relaxed text-sm">{faq.answer}</p>
              </div>
            ))}
            <button className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 text-sm">
              Ver más preguntas frecuentes
            </button>
          </div>
        </CollapsiblePanel>

        {/* Custom logout button */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-red-200 hover:shadow-md transition-all duration-300">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 flex items-center justify-center hover:bg-red-50 transition-colors duration-200 text-red-600"
          >
            <div className="p-1.5 rounded-lg bg-red-100 text-red-600 mr-3">
              <FiLogOut size={18} />
            </div>
            <span className="font-semibold text-base">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Floating Chat Button */}
      <div className="fixed bottom-24 right-6">
        <button className="w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center">
          <FiMessageSquare size={24} />
        </button>
      </div>
    </div>
  );
} 