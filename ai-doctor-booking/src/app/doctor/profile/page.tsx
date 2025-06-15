"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Input from '@/components/Input';
import Button from '@/components/Button';
import ScheduleEditor from '@/components/doctor/ScheduleEditor';
import SpecialtySelector from '@/components/doctor/SpecialtySelector';
import PlanChangeModal from '@/components/doctor/PlanChangeModal';
import { 
  FiUser, 
  FiMapPin, 
  FiSave, 
  FiClock, 
  FiFileText, 
  FiCreditCard, 
  FiAlertTriangle, 
  FiCheck, 
  FiSettings, 
  FiEdit,
  FiPhone,
  FiMail,
  FiHeart,
  FiPlus,
  FiMessageSquare,
  FiChevronDown,
  FiChevronUp,
  FiLock,
  FiHelpCircle,
  FiLogOut,
  FiCalendar,
  FiShield,
  FiCamera,
  FiActivity
} from 'react-icons/fi';
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
    planType: 'gratuito' | 'premium' | 'elite';
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
    monthlyFee: 100000, // 100,000 COP
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
  const borderColor = variant === 'danger' ? 'border-red-200' : 'border-gray-100';
  const iconColor = variant === 'danger' ? 'text-red-600' : 'text-blue-600';
  
  return (
    <div className={`bg-white rounded-xl shadow-sm mb-4 overflow-hidden border ${borderColor} hover:shadow-md transition-all duration-300`}>
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200" onClick={onToggle}>
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${variant === 'danger' ? 'bg-red-100' : 'bg-blue-100'} ${iconColor} mr-3`}>
            {icon}
          </div>
          <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
        </div>
        <div className="flex items-center space-x-3">
          {isEditable && onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
            >
              <FiEdit size={16} />
            </button>
          )}
          {isOpen ? <FiChevronUp size={20} className="text-gray-400" /> : <FiChevronDown size={20} className="text-gray-400" />}
        </div>
      </div>
      {isOpen && (
        <div className="border-t border-gray-100">
          <div className="p-6">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para fila de información
interface InfoRowProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon }) => (
  <div className="flex items-start py-4 px-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-25 transition-colors duration-200 rounded-lg -mx-6">
    <div className="flex items-center text-blue-600 w-5 h-5 mr-4 mt-0.5 flex-shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-gray-500 text-sm font-medium mb-1 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-gray-900 font-semibold text-base leading-relaxed break-words">
        {value}
      </div>
    </div>
  </div>
);

// Componente InfoRow sin iconos para la sección básica
const InfoRowNoIcon: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-start py-4 px-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-25 transition-colors duration-200 rounded-lg -mx-6">
    <div className="w-5 h-5 mr-4 mt-0.5 flex-shrink-0">
      {/* Espacio reservado para mantener alineación */}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-gray-500 text-sm font-medium mb-1 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-gray-900 font-semibold text-base leading-relaxed break-words">
        {value}
      </div>
    </div>
  </div>
);

// Componente para input personalizado
interface CustomInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  placeholder?: string;
  type?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({ label, name, value, onChange, icon, placeholder, type = "text" }) => (
  <div>
    <label className="block text-gray-700 font-medium mb-2">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-600">
        {icon}
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      />
    </div>
  </div>
);

// Componente para select personalizado
interface CustomSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  icon: React.ReactNode;
  placeholder?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ label, name, value, onChange, options, icon, placeholder }) => (
  <div>
    <label className="block text-gray-700 font-medium mb-2">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-600">
        {icon}
      </div>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  </div>
);

const DoctorProfilePage = () => {
  const router = useRouter();
  const { logout } = useAuthStore();
  
  const [profile, setProfile] = useState<DoctorProfile>(MOCK_DOCTOR_PROFILE);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado para controlar qué paneles están abiertos
  const [openPanels, setOpenPanels] = useState<{[key: string]: boolean}>({
    basic: false,
    professional: false,
    location: false,
    schedule: false,
    subscription: false,
    password: false,
    faq: false
  });
  
  // Blocked days state
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>(MOCK_BLOCKED_DATES);
  const [newBlockDate, setNewBlockDate] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showPlanChangeModal, setShowPlanChangeModal] = useState(false);
  
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
        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 800));
        // Aquí iría la llamada real al servicio
      } catch (error) {
        console.error('Error al cargar el perfil:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
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
  
  // Manejar cambios en campos de contraseña
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar carga de foto de perfil
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      // Simular carga de archivo
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Crear URL temporal para mostrar la imagen
      const imageUrl = URL.createObjectURL(file);
      setProfile(prev => ({ ...prev, avatar: imageUrl }));
      
      console.log('Foto subida correctamente');
    } catch (error) {
      console.error('Error al subir la foto:', error);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Manejar guardar cambios
  const handleSave = async (section: string) => {
    setIsSaving(true);
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEditing(null);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      console.log(`Sección ${section} guardada correctamente`);
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Manejar logout
  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };
  
  // Keep these handlers as they're needed for specific functionality
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
  
  const currentPlanData = SUBSCRIPTION_PLANS[profile.subscription.planType];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FiUser size={32} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Cargando perfil...</h2>
          <p className="text-gray-600">Un momento por favor</p>
        </div>
      </div>
    );
  }
    
    return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#E6F0FA' }}>
      {/* Animated Header with Profile Photo - Similar to patient profile */}
      <div className="bg-white mx-4 pt-4 rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        {/* Animated gradient background */}
        <div className="relative h-32 overflow-hidden">
          {/* Base gradient - doctor theme */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-800"></div>
          
          {/* Animated overlay gradients */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/80 via-transparent to-blue-700/60 animate-pulse"></div>
          
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
                  alt={profile.fullName}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
                    <FiUser size={40} className="text-green-600" />
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
              <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-600 to-blue-800 text-white rounded-full flex items-center justify-center shadow-lg hover:from-green-700 hover:to-blue-900 transition-all duration-200 cursor-pointer hover:scale-110">
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
              
            {/* Name and specialty */}
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {profile.fullName}
            </h1>
            <p className="text-green-600 font-medium mb-3">
                {profile.specialties.map(id => 
                  SAMPLE_SPECIALTIES.find(s => s.id === id)?.name
                ).join(', ')}
              </p>
              
            {/* Subtle animated accent */}
            <div className="w-16 h-1 bg-gradient-to-r from-green-600 to-blue-800 rounded-full animate-pulse"></div>
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
                  label="Nombre completo"
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleChange}
                  icon={<FiUser size={14} />}
                  placeholder="Dr. Juan Pérez"
                />
                <CustomInput
                  label="Email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  icon={<FiMail size={14} />}
                  placeholder="doctor@ejemplo.com"
                />
            </div>
            
              <CustomInput
                label="Teléfono"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                icon={<FiPhone size={14} />}
                placeholder="Tu número de teléfono"
              />

              <div className="flex gap-3 pt-4">
                  <button
                  onClick={() => setIsEditing(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancelar
                  </button>
                  <button
                  onClick={() => handleSave('basic')}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-800 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-blue-900 transition-all duration-200 disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
          ) : (
            <div className="-m-6">
              <InfoRowNoIcon 
                label="Nombre completo" 
                value={profile.fullName}
              />
              <InfoRowNoIcon 
                label="Email" 
                value={profile.email}
              />
              <InfoRowNoIcon 
                label="Teléfono" 
                value={profile.phone}
              />
            </div>
          )}
        </CollapsiblePanel>

        {/* Información Profesional */}
        <CollapsiblePanel
          title="Información Profesional"
          icon={<FiFileText size={18} />}
          isOpen={openPanels.professional}
          onToggle={() => togglePanel('professional')}
          isEditable={true}
          onEdit={() => setIsEditing('professional')}
        >
          {isEditing === 'professional' ? (
            <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomInput
                  label="Número de Licencia"
                      name="licenseNumber"
                      value={profile.licenseNumber}
                  onChange={handleChange}
                  icon={<FiShield size={14} />}
                  placeholder="12345-MD"
                    />
                <CustomInput
                  label="Años de Experiencia"
                      name="experience"
                      value={profile.experience}
                  onChange={handleChange}
                  icon={<FiClock size={14} />}
                  placeholder="10 años"
                    />
                  </div>
                  
                    <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Especialidades</label>
                      <SpecialtySelector
                        specialties={SAMPLE_SPECIALTIES}
                        selectedSpecialties={profile.specialties}
                        onChange={handleSpecialtiesChange}
                      />
                    </div>
                  
                  <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Biografía Profesional</label>
                    <textarea
                      name="bio"
                      value={profile.bio}
                  onChange={handleChange}
                      rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Describe tu experiencia y especialización..."
                    />
                  </div>
                  
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsEditing(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleSave('professional')}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-800 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-blue-900 transition-all duration-200 disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          ) : (
            <div className="-m-6">
              <InfoRowNoIcon 
                label="Número de Licencia" 
                value={profile.licenseNumber}
              />
              <InfoRowNoIcon 
                label="Años de Experiencia" 
                value={profile.experience}
              />
              <InfoRowNoIcon 
                label="Especialidades" 
                value={profile.specialties.map(id => 
                  SAMPLE_SPECIALTIES.find(s => s.id === id)?.name
                ).join(', ')}
              />
              <InfoRowNoIcon 
                label="Biografía Profesional" 
                value={profile.bio}
              />
            </div>
          )}
        </CollapsiblePanel>

        {/* Información de Ubicación */}
        <CollapsiblePanel
          title="Dirección del Consultorio"
          icon={<FiMapPin size={18} />}
          isOpen={openPanels.location}
          onToggle={() => togglePanel('location')}
          isEditable={true}
          onEdit={() => setIsEditing('location')}
        >
          {isEditing === 'location' ? (
            <div className="space-y-4 pt-4">
              <CustomInput
                        label="Dirección"
                        name="location.address"
                        value={profile.location.address}
                onChange={handleChange}
                icon={<FiMapPin size={14} />}
                placeholder="Calle Principal 123"
                      />
                      
              <CustomInput
                        label="Ciudad"
                        name="location.city"
                        value={profile.location.city}
                onChange={handleChange}
                icon={<FiMapPin size={14} />}
                placeholder="Madrid"
              />

              <CustomInput
                        label="País"
                        name="location.country"
                        value={profile.location.country}
                onChange={handleChange}
                icon={<FiMapPin size={14} />}
                placeholder="España"
              />

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsEditing(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleSave('location')}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-800 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-blue-900 transition-all duration-200 disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </button>
                    </div>
                  </div>
          ) : (
            <div className="-m-6">
              <InfoRowNoIcon 
                label="Dirección" 
                value={profile.location.address}
              />
              <InfoRowNoIcon 
                label="Ciudad" 
                value={profile.location.city}
              />
              <InfoRowNoIcon 
                label="País" 
                value={profile.location.country}
              />
                </div>
              )}
                </CollapsiblePanel>

        {/* Horarios de Atención */}
        <CollapsiblePanel
          title="Horarios de Atención"
          icon={<FiClock size={18} />}
          isOpen={openPanels.schedule}
          onToggle={() => togglePanel('schedule')}
          isEditable={true}
          onEdit={() => setIsEditing('schedule')}
        >
          {isEditing === 'schedule' ? (
            <div className="pt-4">
                      <ScheduleEditor
                        schedule={profile.availableTimes}
                        onChange={handleScheduleChange}
                      />
              
              {/* Días Bloqueados - Editable */}
              <div className="mt-6 bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <FiAlertTriangle className="mr-2 text-yellow-600" size={16} />
                  Días Bloqueados
                </h3>
                
                          <form onSubmit={handleAddBlockedDate} className="mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <CustomInput
                      label="Fecha"
                      name="block-date"
                                type="date"
                                value={newBlockDate}
                                onChange={(e) => setNewBlockDate(e.target.value)}
                      icon={<FiCalendar size={14} />}
                      placeholder=""
                    />
                    <CustomInput
                      label="Motivo"
                      name="block-reason"
                                value={newBlockReason}
                                onChange={(e) => setNewBlockReason(e.target.value)}
                      icon={<FiFileText size={14} />}
                                placeholder="Vacaciones, conferencia, etc."
                              />
                            </div>
                  <button
                    type="submit"
                    className="w-full bg-yellow-500 text-white py-2 px-4 rounded-xl font-medium hover:bg-yellow-600 transition-colors duration-200"
                            >
                              Añadir Día Bloqueado
                  </button>
                          </form>

                {blockedDates.length > 0 && (
                  <div className="space-y-2">
                    {blockedDates.map((blockedDate, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 flex justify-between items-center shadow-sm">
                                      <div>
                          <p className="font-medium text-gray-900">{new Date(blockedDate.date).toLocaleDateString('es-ES')}</p>
                          <p className="text-sm text-gray-600">{blockedDate.reason}</p>
                                      </div>
                                      <button
                                        onClick={() => handleRemoveBlockedDate(blockedDate.date)}
                          className="text-red-500 hover:text-red-700 transition-colors duration-200"
                                      >
                          <FiAlertTriangle size={16} />
                                      </button>
                      </div>
                    ))}
                  </div>
                            )}
                          </div>

              <div className="flex gap-3 pt-6">
                <button
                  onClick={() => setIsEditing(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleSave('schedule')}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-800 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-blue-900 transition-all duration-200 disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </button>
                        </div>
                      </div>
          ) : (
            <div className="-m-6">
              <div className="space-y-1">
                          {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day, index) => {
                            const daySchedule = profile.availableTimes.find(t => t.dayOfWeek === index);
                            return (
                    <div key={index} className="flex justify-between items-center py-4 px-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-25 transition-colors duration-200">
                      <div className="flex-1">
                        <span className="font-semibold text-gray-900 text-base">{day}</span>
                                </div>
                      <div className="flex-1 flex justify-end">
                        {daySchedule?.isAvailable ? (
                          <div className="flex flex-wrap gap-2 justify-end">
                                    {daySchedule.slots.map((slot, slotIndex) => (
                              <span key={slotIndex} className="text-sm bg-green-100 text-green-800 px-3 py-1.5 rounded-full font-medium">
                                        {slot.start} - {slot.end}
                              </span>
                                    ))}
                                  </div>
                        ) : (
                          <span className="text-gray-500 text-sm font-medium bg-gray-100 px-3 py-1.5 rounded-full">No disponible</span>
                                )}
                      </div>
                              </div>
                            );
                          })}
                        </div>
              
              {blockedDates.length > 0 && (
                <div className="border-t border-gray-100 mt-2 pt-4">
                  <div className="px-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center text-sm uppercase tracking-wide">
                      <FiAlertTriangle className="mr-2 text-yellow-600" size={14} />
                      Días Bloqueados
                    </h4>
                    <div className="space-y-3">
                      {blockedDates.slice(0, 3).map((blockedDate, index) => (
                        <div key={index} className="flex items-center justify-between bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                          <div className="flex-1">
                            <span className="font-semibold text-gray-900 text-base block">
                              {new Date(blockedDate.date).toLocaleDateString('es-ES')}
                            </span>
                            <p className="text-sm text-gray-600 mt-1">{blockedDate.reason}</p>
                      </div>
                          <div className="text-yellow-600 ml-4">
                            <FiAlertTriangle size={16} />
                        </div>
                                    </div>
                      ))}
                      {blockedDates.length > 3 && (
                        <div className="text-center py-2">
                          <p className="text-sm text-gray-500 font-medium">Y {blockedDates.length - 3} día(s) más...</p>
                        </div>
                          )}
                        </div>
                      </div>
                </div>
                  )}
                </div>
              )}
        </CollapsiblePanel>

        {/* Suscripción */}
        <CollapsiblePanel
          title="Plan de Suscripción"
          icon={<FiCreditCard size={18} />}
          isOpen={openPanels.subscription}
          onToggle={() => togglePanel('subscription')}
        >
          <div className="pt-4 space-y-4">
            {/* Plan Actual */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: currentPlanData?.color }}
                          />
                            Plan {currentPlanData?.name}
                          </h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  profile.subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {profile.subscription.status === 'active' ? 'Activo' : 'Pendiente'}
                </span>
                        </div>
              
              <p className="text-gray-700 text-sm mb-3">{currentPlanData?.description}</p>
              
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-2xl font-bold text-gray-900">
                          {formatCurrency(profile.subscription.monthlyFee)}
                  </span>
                  <span className="text-gray-500 text-sm">/mes</span>
                      </div>
                      
                <button
                  onClick={() => setShowPlanChangeModal(true)}
                  className="bg-gradient-to-r from-green-600 to-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-green-700 hover:to-blue-900 transition-all duration-200"
                >
                  Cambiar Plan
                </button>
                        </div>
                        </div>

            {/* Información de Pago */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h5 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Información de Pago</h5>
                        </div>
              <div className="-m-0">
                <InfoRow 
                  label="Estado del pago" 
                  value={profile.subscription.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                  icon={<FiCreditCard size={14} />}
                />
                <InfoRow 
                  label="Próximo pago" 
                  value={new Date(profile.subscription.nextPaymentDate).toLocaleDateString('es-ES')}
                  icon={<FiCalendar size={14} />}
                />
                    </div>
                  </div>

                  {/* Características del Plan */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h5 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Características Incluidas</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentPlanData?.features.map((feature, index) => (
                  <div key={index} className="flex items-start p-3 bg-green-50 rounded-lg border border-green-100">
                    <FiCheck className="w-4 h-4 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-800 font-medium text-sm leading-relaxed">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
          </div>
        </CollapsiblePanel>

        {/* Cambio de Contraseña */}
        <CollapsiblePanel
          title="Cambiar Contraseña"
          icon={<FiLock size={18} />}
          isOpen={openPanels.password}
          onToggle={() => togglePanel('password')}
          isEditable={true}
          onEdit={() => setIsEditing('password')}
        >
          {isEditing === 'password' ? (
            <div className="space-y-4 pt-4">
              <CustomInput
                label="Contraseña actual"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                icon={<FiLock size={14} />}
                placeholder="Ingresa tu contraseña actual"
              />
              
              <CustomInput
                label="Nueva contraseña"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                icon={<FiLock size={14} />}
                placeholder="Ingresa tu nueva contraseña"
              />
              
              <CustomInput
                label="Confirmar contraseña"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                icon={<FiLock size={14} />}
                placeholder="Confirma tu nueva contraseña"
              />

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsEditing(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancelar
                            </button>
                <button
                  onClick={() => handleSave('password')}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-800 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-blue-900 transition-all duration-200 disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : 'Cambiar Contraseña'}
                            </button>
                          </div>
                        </div>
          ) : (
            <div className="pt-3">
              <p className="text-gray-600 text-sm">Por seguridad, actualiza tu contraseña regularmente.</p>
                    </div>
                  )}
        </CollapsiblePanel>

        {/* Preguntas Frecuentes */}
        <CollapsiblePanel
          title="Preguntas Frecuentes"
          icon={<FiHelpCircle size={18} />}
          isOpen={openPanels.faq}
          onToggle={() => togglePanel('faq')}
        >
          <div className="pt-4 space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h5 className="font-medium text-gray-900 mb-1">¿Cómo cambio mi horario de atención?</h5>
              <p className="text-gray-600 text-sm">Puedes modificar tus horarios en la sección "Horarios de Atención" haciendo clic en editar.</p>
                        </div>
            
            <div className="border-b border-gray-100 pb-3">
              <h5 className="font-medium text-gray-900 mb-1">¿Cómo actualizo mi plan de suscripción?</h5>
              <p className="text-gray-600 text-sm">Ve a la sección "Plan de Suscripción" y haz clic en "Cambiar Plan" para ver las opciones disponibles.</p>
                        </div>
            
                        <div>
              <h5 className="font-medium text-gray-900 mb-1">¿Necesitas más ayuda?</h5>
              <p className="text-gray-600 text-sm">Contacta con nuestro equipo de soporte para recibir asistencia personalizada.</p>
                        </div>
                        </div>
        </CollapsiblePanel>

        {/* Cerrar Sesión */}
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
        <button className="w-14 h-14 bg-gradient-to-r from-green-600 to-blue-800 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center">
          <FiMessageSquare size={24} />
                      </button>
      </div>

      {/* Plan Change Modal */}
      <PlanChangeModal
        isOpen={showPlanChangeModal}
        onClose={() => setShowPlanChangeModal(false)}
        currentPlan={profile.subscription.planType}
        doctorId={profile.id}
        onPlanChanged={handlePlanChanged}
      />

      {/* Success notification */}
      {savedSuccess && (
        <div className="fixed bottom-4 left-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center animate-slide-in-left">
          <FiCheck className="mr-2" size={16} />
          ¡Información actualizada correctamente!
        </div>
      )}
    </div>
  );
};

export default DoctorProfilePage; 