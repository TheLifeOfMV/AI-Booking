"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Input from '@/components/Input';
import Button from '@/components/Button';
import CredentialUpload from '@/components/doctor/CredentialUpload';
import SpecialtySelector from '@/components/doctor/SpecialtySelector';
import { FiUpload, FiCheckCircle, FiClock, FiUser } from 'react-icons/fi';

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
  const [currentStep, setCurrentStep] = useState(1);
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
    // Aquí iría la validación específica para cada paso
    // Por ahora solo validamos campos obligatorios
    switch (currentStep) {
      case 1:
        return formData.fullName && formData.email && formData.phone;
      case 2:
        return formData.specialties.length > 0 && formData.licenseNumber && formData.experienceYears;
      case 3:
        return formData.credentials.length > 0;
      case 4:
        return formData.termsAccepted;
      default:
        return true;
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 4 && formData.termsAccepted) {
      // Aquí iría la lógica de envío del formulario al backend
      console.log('Datos del formulario:', formData);
      
      // Redirigir a la página de éxito
      router.push('/doctor/register/success');
    }
  };
  
  return (
    <div style={{ backgroundColor: '#F0F4F9', minHeight: '100vh' }}>
      <div className="container max-w-xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-center mb-6">Registro de Especialista Médico</h1>
        
        {/* Indicador de pasos */}
        <div className="flex items-center justify-between mb-8">
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
                {step === 1 && 'Personal'}
                {step === 2 && 'Profesional'}
                {step === 3 && 'Documentos'}
                {step === 4 && 'Finalizar'}
              </span>
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Paso 1: Información personal */}
          {currentStep === 1 && (
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
                placeholder="+34 600 000 000"
                required
              />
            </div>
          )}
          
          {/* Paso 2: Información profesional */}
          {currentStep === 2 && (
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
              
              <div className="mb-4">
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
          )}
          
          {/* Paso 3: Documentos y credenciales */}
          {currentStep === 3 && (
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
          )}
          
          {/* Paso 4: Términos y condiciones */}
          {currentStep === 4 && (
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
              
              <div className="border border-light-grey p-4 rounded-lg mb-6 max-h-60 overflow-y-auto text-sm">
                <h3 className="font-medium mb-2">Términos y Condiciones</h3>
                <p className="text-medium-grey">
                  Al registrarte como médico especialista en nuestra plataforma, aceptas 
                  los siguientes términos y condiciones:
                </p>
                <ul className="list-disc ml-5 my-3 space-y-2 text-medium-grey">
                  <li>
                    Confirmas que toda la información proporcionada es verídica y precisa.
                  </li>
                  <li>
                    Te comprometes a mantener actualizada tu información y credenciales.
                  </li>
                  <li>
                    Aceptas que podamos verificar tus credenciales con las autoridades pertinentes.
                  </li>
                  <li>
                    Entiendes que el proceso de verificación puede tomar hasta 48 horas laborables.
                  </li>
                  <li>
                    Eres responsable de mantener la confidencialidad de tus credenciales de acceso.
                  </li>
                  <li>
                    Aceptas cumplir con las políticas de privacidad y protección de datos de pacientes.
                  </li>
                </ul>
              </div>
              
              <div className="flex items-start mb-6">
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
          )}
          
          {/* Botones de navegación */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 ? (
              <Button 
                type="secondary" 
                onClick={handlePrevStep}
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
              >
                Siguiente
              </Button>
            ) : (
              <Button 
                type="primary" 
                htmlType="submit"
                disabled={!formData.termsAccepted}
              >
                Completar Registro
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorRegisterPage; 