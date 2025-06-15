"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Input from '@/components/Input';
import Button from '@/components/Button';
import CredentialUpload from '@/components/doctor/CredentialUpload';
import SpecialtySelector from '@/components/doctor/SpecialtySelector';
import { FiUpload, FiCheckCircle, FiUser } from 'react-icons/fi';
import { useAuthStore } from '@/store/authStore';

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

const DoctorRegisterPage = () => {
  const router = useRouter();
  const { login } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialties: [] as string[],
    licenseNumber: '',
    experienceYears: '',
    profilePicture: null as File | null,
    credentials: [] as File[],
    bio: '',
    termsAccepted: false
  });
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSpecialtiesChange = (selectedIds: string[]) => {
    setFormData(prev => ({ ...prev, specialties: selectedIds }));
  };
  
  const handleCredentialsChange = (files: File[]) => {
    setFormData(prev => ({ ...prev, credentials: files }));
  };
  
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, profilePicture: file }));
      
      // Generar vista previa de la imagen
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  const validateCurrentStep = () => {
    console.log('[DoctorRegister] Validating step:', currentStep);
    
    try {
      // Validación específica para cada paso
      switch (currentStep) {
        case 1:
          const step1Valid = formData.fullName && formData.email && formData.phone;
          console.log('[DoctorRegister] Step 1 validation:', { step1Valid, formData: { fullName: !!formData.fullName, email: !!formData.email, phone: !!formData.phone } });
          return step1Valid;
        case 2:
          const step2Valid = formData.specialties.length > 0 && formData.licenseNumber && formData.experienceYears;
          console.log('[DoctorRegister] Step 2 validation:', { step2Valid, specialties: formData.specialties.length, licenseNumber: !!formData.licenseNumber, experienceYears: !!formData.experienceYears });
          return step2Valid;
        case 3:
          const step3Valid = formData.credentials.length > 0;
          console.log('[DoctorRegister] Step 3 validation:', { step3Valid, credentialsCount: formData.credentials.length });
          return step3Valid;
        case 4:
          const step4Valid = formData.termsAccepted;
          console.log('[DoctorRegister] Step 4 validation:', { step4Valid, termsAccepted: formData.termsAccepted });
          return step4Valid;
        default:
          console.warn('[DoctorRegister] Unknown step for validation:', currentStep);
          return true;
      }
    } catch (error) {
      console.error('[DoctorRegister] Error during step validation:', error);
      return false;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 4 && formData.termsAccepted) {
      setIsSubmitting(true);
      
      try {
        // Simular creación de doctor account
        console.log('[DoctorRegistration] Creating doctor account:', {
          ...formData,
          profilePicture: formData.profilePicture ? 'File uploaded' : null,
          credentials: `${formData.credentials.length} files uploaded`
        });

        // El doctor será registrado con un plan básico por defecto
        console.log('[DoctorRegistration] Doctor registered successfully');
        
        // **SOLUCIÓN**: Autenticar automáticamente al doctor después del registro
        await login({
          identifier: formData.email,
          password: 'demo_password', // In real app, would come from actual registration
          role: 'doctor'
        });
        
        console.log('[DoctorRegistration] Doctor authenticated automatically');
        
        // Redirigir a la página de éxito
        router.push('/doctor/register/success');
      } catch (error) {
        console.error('[DoctorRegistration] Registration failed:', error);
        alert('Error en el registro. Por favor, inténtalo de nuevo.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getStepLabel = (step: number) => {
    switch (step) {
      case 1: return 'Personal';
      case 2: return 'Profesional';
      case 3: return 'Documentos';
      case 4: return 'Finalizar';
      default: return '';
    }
  };
  
  return (
    <div style={{ backgroundColor: '#E6F0FA', minHeight: '100vh' }}>
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Error Boundary */}
        {hasError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error en el registro</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{errorMessage || 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.'}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setHasError(false);
                      setErrorMessage('');
                    }}
                    className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <h1 className="text-2xl font-bold text-center mb-6">Registro de Especialista Médico</h1>
        
        {/* Indicador de pasos */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-8">
            {[1, 2, 3, 4].map(step => (
              <div 
                key={step} 
                className="flex flex-col items-center"
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center 
                    ${currentStep >= step ? 'bg-primary text-white' : 'bg-light-grey text-medium-grey'}`}
                >
                  {currentStep > step ? <FiCheckCircle /> : step}
                </div>
                <span className={`text-xs mt-1 ${currentStep >= step ? 'text-primary' : 'text-medium-grey'}`}>
                  {getStepLabel(step)}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Paso 1: Información personal */}
          {currentStep === 1 && (
            <div className="max-w-xl mx-auto">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FiUser className="mr-2" /> Información Personal
                </h2>
                
                <div className="flex justify-center mb-6">
                  <div className="relative w-32 h-32 rounded-full bg-light-grey overflow-hidden border-4 border-white shadow-md">
                    {profilePreview ? (
                      <Image 
                        src={profilePreview} 
                        alt="Vista previa" 
                        layout="fill" 
                        objectFit="cover"
                        width={128}
                        height={128}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-medium-grey">
                        <FiUser size={32} />
                        <span className="text-xs mt-1">Sin foto</span>
                      </div>
                    )}
                    
                    <label 
                      htmlFor="profile-picture"
                      className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                    >
                      <div className="text-white text-sm font-medium flex flex-col items-center">
                        <FiUpload size={24} className="mb-1" />
                        <span>Subir foto</span>
                      </div>
                    </label>
                    <input 
                      type="file" 
                      id="profile-picture" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                    />
                  </div>
                </div>
                
                <Input
                  label="Nombre completo"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Dr. Juan Pérez Martínez"
                  required
                />
                
                <Input
                  label="Correo electrónico"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="juanperez@example.com"
                  required
                />
                
                <Input
                  label="Teléfono"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+57 300 000 0000"
                  required
                />
              </div>
            </div>
          )}
          
          {/* Paso 2: Información profesional */}
          {currentStep === 2 && (
            <div className="max-w-xl mx-auto">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Información Profesional</h2>
                
                <div className="mb-4">
                  <label className="block text-dark-grey font-medium mb-2">
                    Especialidad(es)
                  </label>
                  <SpecialtySelector
                    specialties={SAMPLE_SPECIALTIES}
                    selectedSpecialties={formData.specialties}
                    onChange={handleSpecialtiesChange}
                  />
                </div>
                
                <Input
                  label="Número de licencia profesional"
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  placeholder="12345-MD"
                  required
                />
                
                <Input
                  label="Años de experiencia"
                  type="number"
                  name="experienceYears"
                  value={formData.experienceYears}
                  onChange={handleInputChange}
                  placeholder="5"
                  min={0}
                  required
                />
                
                <div>
                  <label className="block text-dark-grey font-medium mb-2">
                    Biografía profesional
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Cuéntanos sobre tu experiencia profesional..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-light-grey focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Paso 3: Documentos y credenciales */}
          {currentStep === 3 && (
            <div className="max-w-xl mx-auto">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FiUpload className="mr-2" /> Credenciales y Documentos
                </h2>
                
                <p className="text-medium-grey mb-4">
                  Sube tu título médico, licencia profesional y cualquier certificación adicional relevante.
                  Estos documentos son necesarios para verificar tu identidad y credenciales.
                </p>
                
                <CredentialUpload
                  onFilesSelected={handleCredentialsChange}
                />
                
                <div className="mt-4 p-4 bg-light-grey/50 rounded-lg">
                  <p className="text-sm text-medium-grey">
                    <strong>Nota:</strong> Todos los documentos serán revisados por nuestro equipo.
                    El proceso de verificación puede tardar hasta 48 horas laborables.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Paso 4: Términos y condiciones */}
          {currentStep === 4 && (
            <div className="max-w-xl mx-auto">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Completar Registro</h2>
                
                <div className="bg-light-grey p-4 rounded-lg mb-6">
                  <h3 className="font-medium mb-2">Resumen de información</h3>
                  <ul className="space-y-2 text-sm">
                    <li><strong>Nombre:</strong> {formData.fullName}</li>
                    <li><strong>Correo:</strong> {formData.email}</li>
                    <li>
                      <strong>Especialidades:</strong> {' '}
                      {formData.specialties.map(id => 
                        SAMPLE_SPECIALTIES.find(s => s.id === id)?.name
                      ).join(', ')}
                    </li>
                    <li><strong>Licencia:</strong> {formData.licenseNumber}</li>
                    <li><strong>Experiencia:</strong> {formData.experienceYears} años</li>
                    <li><strong>Documentos:</strong> {formData.credentials.length} archivo(s)</li>
                  </ul>
                </div>
                
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="terms"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 text-primary border-light-grey rounded focus:ring-primary"
                  />
                  <label htmlFor="terms" className="ml-2 text-medium-grey">
                    He leído y acepto los <a href="#" className="text-primary hover:underline">términos y condiciones</a> y 
                    la <a href="#" className="text-primary hover:underline">política de privacidad</a>.
                  </label>
                </div>
              </div>
            </div>
          )}
          
          {/* Botones de navegación */}
          <div className="flex justify-between mt-8 max-w-xl mx-auto">
            {currentStep > 1 ? (
              <Button 
                type="secondary" 
                onClick={handlePrevStep}
                disabled={isSubmitting}
              >
                Anterior
              </Button>
            ) : (
              <div></div> // Espacio vacío para mantener la alineación
            )}
            
            {currentStep < 4 ? (
              <Button 
                type="primary" 
                onClick={handleNextStep}
                disabled={isSubmitting}
              >
                Siguiente
              </Button>
            ) : (
              <Button 
                type="primary" 
                htmlType="submit"
                disabled={!formData.termsAccepted || isSubmitting}
              >
                {isSubmitting ? 'Procesando...' : 'Completar Registro'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorRegisterPage; 