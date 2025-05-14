"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  FiUser, 
  FiPhone, 
  FiMail, 
  FiMapPin, 
  FiHeart, 
  FiPlus, 
  FiClock, 
  FiAlertTriangle,
  FiEdit,
  FiSave,
  FiFileText,
  FiShield,
  FiMessageSquare
} from 'react-icons/fi';
import Button from '@/components/Button';
import Input from '@/components/Input';
import ProfileSection from '@/components/patient/ProfileSection';
import InfoField from '@/components/patient/InfoField';
import DocumentCard from '@/components/patient/DocumentCard';
import AppointmentCard from '@/components/patient/AppointmentCard';
import { Patient, PatientFormData } from '@/types/patient';
import { getPatientProfile, updatePatientProfile, getPatientDocuments, getPatientAppointments } from '@/services/patientService';

// Pestañas disponibles
type ProfileTab = 'personal' | 'medical' | 'appointments' | 'documents';

export default function PatientProfilePage() {
  // Estado para almacenar los datos del perfil
  const [profile, setProfile] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    email: '',
    phone: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
  const [documents, setDocuments] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos del perfil
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        // Simulación: obtener perfil del paciente con ID 1
        const data = await getPatientProfile('1');
        if (data) {
          setProfile(data);
          setFormData({
            name: data.name,
            email: data.email,
            phone: data.phone,
            bloodType: data.bloodType,
            allergies: data.allergies?.join(', '),
            chronicConditions: data.chronicConditions?.join(', '),
            medications: data.medications?.join(', '),
            emergencyContactName: data.emergencyContact?.name,
            emergencyContactRelationship: data.emergencyContact?.relationship,
            emergencyContactPhone: data.emergencyContact?.phone,
            street: data.address?.street,
            city: data.address?.city,
            postalCode: data.address?.postalCode,
            country: data.address?.country,
            insuranceProvider: data.insurance?.provider,
            insurancePolicyNumber: data.insurance?.policyNumber,
            insuranceExpirationDate: data.insurance?.expirationDate,
            insuranceCoverageDetails: data.insurance?.coverageDetails
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

  // Cargar documentos cuando se selecciona la pestaña correspondiente
  useEffect(() => {
    if (activeTab === 'documents') {
      const loadDocuments = async () => {
        try {
          const data = await getPatientDocuments('1');
          setDocuments(data);
        } catch (error) {
          console.error('Error al cargar documentos:', error);
        }
      };
      loadDocuments();
    } else if (activeTab === 'appointments') {
      const loadAppointments = async () => {
        try {
          const data = await getPatientAppointments('1');
          setAppointments(data);
        } catch (error) {
          console.error('Error al cargar citas:', error);
        }
      };
      loadAppointments();
    }
  }, [activeTab]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Guardar cambios del perfil
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const updatedProfile = await updatePatientProfile('1', formData);
      setProfile(updatedProfile);
      setIsEditing(false);
      // Mostrar notificación de éxito (en una implementación real)
      alert('Perfil actualizado con éxito');
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      // Mostrar notificación de error (en una implementación real)
      alert('Error al actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-medium-grey">Cargando perfil...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <FiAlertTriangle size={48} className="text-accent-orange mb-4" />
        <h2 className="text-xl font-semibold mb-2">No se pudo cargar el perfil</h2>
        <p className="text-medium-grey mb-4">Por favor, inténtelo de nuevo más tarde.</p>
        <Button type="primary" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Cabecera del perfil */}
      <div className="bg-primary/10 p-6">
        <div className="flex items-center mb-4">
          <div className="relative mr-4">
            <div className="w-20 h-20 rounded-full bg-light-grey overflow-hidden border-2 border-white">
              {profile.avatar ? (
                <Image 
                  src={profile.avatar} 
                  alt={profile.name}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary">
                  <FiUser size={32} />
                </div>
              )}
            </div>
            {isEditing && (
              <button 
                className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 border-2 border-white"
                aria-label="Cambiar foto"
              >
                <FiEdit size={14} />
              </button>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-dark-grey">{profile.name}</h1>
            <p className="text-medium-grey text-sm">ID: {profile.id}</p>
          </div>
        </div>
        
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

      {/* Navegación por pestañas */}
      <div className="sticky top-0 z-10 bg-white border-b border-light-grey">
        <div className="flex overflow-x-auto no-scrollbar">
          <button
            className={`px-5 py-4 font-medium whitespace-nowrap ${
              activeTab === 'personal' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-medium-grey'
            }`}
            onClick={() => setActiveTab('personal')}
          >
            Información Personal
          </button>
          <button
            className={`px-5 py-4 font-medium whitespace-nowrap ${
              activeTab === 'medical' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-medium-grey'
            }`}
            onClick={() => setActiveTab('medical')}
          >
            Datos Médicos
          </button>
          <button
            className={`px-5 py-4 font-medium whitespace-nowrap ${
              activeTab === 'appointments' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-medium-grey'
            }`}
            onClick={() => setActiveTab('appointments')}
          >
            Mis Citas
          </button>
          <button
            className={`px-5 py-4 font-medium whitespace-nowrap ${
              activeTab === 'documents' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-medium-grey'
            }`}
            onClick={() => setActiveTab('documents')}
          >
            Documentos
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-4">
        {activeTab === 'personal' && (
          <>
            {isEditing ? (
              /* Formulario de edición */
              <>
                <ProfileSection title="Información de Contacto" isEditable={false}>
                  <div className="space-y-4">
                    <Input
                      label="Nombre completo"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                    <Input
                      label="Correo electrónico"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    <Input
                      label="Teléfono"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </ProfileSection>

                <ProfileSection title="Dirección" isEditable={false}>
                  <div className="space-y-4">
                    <Input
                      label="Calle y número"
                      id="street"
                      name="street"
                      value={formData.street || ''}
                      onChange={handleChange}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Ciudad"
                        id="city"
                        name="city"
                        value={formData.city || ''}
                        onChange={handleChange}
                      />
                      <Input
                        label="Código postal"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode || ''}
                        onChange={handleChange}
                      />
                    </div>
                    <Input
                      label="País"
                      id="country"
                      name="country"
                      value={formData.country || ''}
                      onChange={handleChange}
                    />
                  </div>
                </ProfileSection>

                <ProfileSection title="Contacto de emergencia" isEditable={false}>
                  <div className="space-y-4">
                    <Input
                      label="Nombre del contacto"
                      id="emergencyContactName"
                      name="emergencyContactName"
                      value={formData.emergencyContactName || ''}
                      onChange={handleChange}
                    />
                    <Input
                      label="Relación"
                      id="emergencyContactRelationship"
                      name="emergencyContactRelationship"
                      value={formData.emergencyContactRelationship || ''}
                      onChange={handleChange}
                    />
                    <Input
                      label="Teléfono de emergencia"
                      id="emergencyContactPhone"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone || ''}
                      onChange={handleChange}
                    />
                  </div>
                </ProfileSection>
              </>
            ) : (
              /* Vista de información */
              <>
                <ProfileSection 
                  title="Información de Contacto" 
                  onEdit={() => setIsEditing(true)}
                >
                  <InfoField
                    label="Nombre completo"
                    value={profile.name}
                    icon={<FiUser />}
                  />
                  <InfoField
                    label="Correo electrónico"
                    value={profile.email}
                    icon={<FiMail />}
                  />
                  <InfoField
                    label="Teléfono"
                    value={profile.phone}
                    icon={<FiPhone />}
                  />
                </ProfileSection>

                <ProfileSection 
                  title="Dirección" 
                  onEdit={() => setIsEditing(true)}
                >
                  <InfoField
                    label="Dirección completa"
                    value={profile.address?.street}
                    icon={<FiMapPin />}
                  />
                  <InfoField
                    label="Ciudad"
                    value={profile.address?.city}
                  />
                  <InfoField
                    label="Código postal"
                    value={profile.address?.postalCode}
                  />
                  <InfoField
                    label="País"
                    value={profile.address?.country}
                  />
                </ProfileSection>

                <ProfileSection 
                  title="Contacto de emergencia" 
                  onEdit={() => setIsEditing(true)}
                >
                  <InfoField
                    label="Nombre del contacto"
                    value={profile.emergencyContact?.name}
                    icon={<FiHeart />}
                  />
                  <InfoField
                    label="Relación"
                    value={profile.emergencyContact?.relationship}
                  />
                  <InfoField
                    label="Teléfono de emergencia"
                    value={profile.emergencyContact?.phone}
                    icon={<FiPhone />}
                  />
                </ProfileSection>
              </>
            )}
          </>
        )}

        {activeTab === 'medical' && (
          <>
            {isEditing ? (
              /* Formulario de edición de datos médicos */
              <>
                <ProfileSection title="Información médica básica" isEditable={false}>
                  <div className="space-y-4">
                    <div className="mb-4">
                      <label className="block text-dark-grey font-medium mb-1">
                        Tipo de sangre
                      </label>
                      <select
                        id="bloodType"
                        name="bloodType"
                        value={formData.bloodType || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-light-grey focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="">Seleccionar</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="block text-dark-grey font-medium mb-1">
                        Alergias (separadas por comas)
                      </label>
                      <textarea
                        id="allergies"
                        name="allergies"
                        rows={3}
                        value={formData.allergies || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-light-grey focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="Ejemplo: Penicilina, Polen, Frutos secos"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-dark-grey font-medium mb-1">
                        Condiciones crónicas (separadas por comas)
                      </label>
                      <textarea
                        id="chronicConditions"
                        name="chronicConditions"
                        rows={3}
                        value={formData.chronicConditions || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-light-grey focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="Ejemplo: Asma, Diabetes, Hipertensión"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-dark-grey font-medium mb-1">
                        Medicación actual (separada por comas)
                      </label>
                      <textarea
                        id="medications"
                        name="medications"
                        rows={3}
                        value={formData.medications || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-light-grey focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="Ejemplo: Salbutamol, Paracetamol"
                      />
                    </div>
                  </div>
                </ProfileSection>

                <ProfileSection title="Información de seguro médico" isEditable={false}>
                  <div className="space-y-4">
                    <Input
                      label="Proveedor de seguro"
                      id="insuranceProvider"
                      name="insuranceProvider"
                      value={formData.insuranceProvider || ''}
                      onChange={handleChange}
                    />
                    <Input
                      label="Número de póliza"
                      id="insurancePolicyNumber"
                      name="insurancePolicyNumber"
                      value={formData.insurancePolicyNumber || ''}
                      onChange={handleChange}
                    />
                    <Input
                      label="Fecha de expiración"
                      id="insuranceExpirationDate"
                      name="insuranceExpirationDate"
                      type="date"
                      value={formData.insuranceExpirationDate || ''}
                      onChange={handleChange}
                    />
                    <div className="mb-4">
                      <label className="block text-dark-grey font-medium mb-1">
                        Detalles de cobertura
                      </label>
                      <textarea
                        id="insuranceCoverageDetails"
                        name="insuranceCoverageDetails"
                        rows={3}
                        value={formData.insuranceCoverageDetails || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-light-grey focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>
                </ProfileSection>
              </>
            ) : (
              /* Vista de información médica */
              <>
                <ProfileSection 
                  title="Información médica básica" 
                  onEdit={() => setIsEditing(true)}
                >
                  <InfoField
                    label="Tipo de sangre"
                    value={profile.bloodType}
                    icon={<FiHeart />}
                  />
                  <InfoField
                    label="Alergias"
                    value={profile.allergies}
                    icon={<FiAlertTriangle />}
                    isList
                  />
                  <InfoField
                    label="Condiciones crónicas"
                    value={profile.chronicConditions}
                    icon={<FiClock />}
                    isList
                  />
                  <InfoField
                    label="Medicación actual"
                    value={profile.medications}
                    icon={<FiPlus />}
                    isList
                  />
                </ProfileSection>

                <ProfileSection 
                  title="Información de seguro médico" 
                  onEdit={() => setIsEditing(true)}
                >
                  <InfoField
                    label="Proveedor de seguro"
                    value={profile.insurance?.provider}
                    icon={<FiShield />}
                  />
                  <InfoField
                    label="Número de póliza"
                    value={profile.insurance?.policyNumber}
                  />
                  <InfoField
                    label="Fecha de expiración"
                    value={profile.insurance?.expirationDate}
                  />
                  <InfoField
                    label="Detalles de cobertura"
                    value={profile.insurance?.coverageDetails}
                    multiline
                  />
                </ProfileSection>
              </>
            )}
          </>
        )}

        {activeTab === 'documents' && (
          <ProfileSection 
            title="Mis documentos médicos" 
            isEditable={false}
          >
            {documents.length > 0 ? (
              <div>
                {documents.map(doc => (
                  <DocumentCard 
                    key={doc.id}
                    id={doc.id}
                    title={doc.title}
                    date={doc.date}
                    type={doc.type}
                    fileUrl={doc.fileUrl}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiFileText size={48} className="mx-auto text-medium-grey mb-4" />
                <p className="text-medium-grey mb-4">No tienes documentos guardados</p>
                <Button type="primary">
                  <span className="flex items-center">
                    <FiPlus className="mr-2" /> Subir documento
                  </span>
                </Button>
              </div>
            )}
          </ProfileSection>
        )}

        {activeTab === 'appointments' && (
          <div>
            <h3 className="font-semibold text-lg mb-4">Próximas citas</h3>
            {appointments.filter(apt => new Date(`${apt.date}T${apt.time}`) >= new Date()).length > 0 ? (
              <div className="mb-6">
                {appointments
                  .filter(apt => new Date(`${apt.date}T${apt.time}`) >= new Date())
                  .map(appointment => (
                    <AppointmentCard
                      key={appointment.id}
                      id={appointment.id}
                      doctorName={appointment.doctorName}
                      doctorSpecialty={appointment.doctorSpecialty}
                      date={appointment.date}
                      time={appointment.time}
                      status={appointment.status}
                      location={appointment.location}
                      isVirtual={appointment.isVirtual}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 mb-6 bg-white rounded-xl shadow-sm">
                <FiClock size={48} className="mx-auto text-medium-grey mb-4" />
                <p className="text-medium-grey mb-4">No tienes citas programadas</p>
                <Button type="primary">
                  <span className="flex items-center">
                    <FiPlus className="mr-2" /> Agendar cita
                  </span>
                </Button>
              </div>
            )}

            <h3 className="font-semibold text-lg mb-4">Historial de citas</h3>
            {appointments.filter(apt => new Date(`${apt.date}T${apt.time}`) < new Date()).length > 0 ? (
              <div>
                {appointments
                  .filter(apt => new Date(`${apt.date}T${apt.time}`) < new Date())
                  .map(appointment => (
                    <AppointmentCard
                      key={appointment.id}
                      id={appointment.id}
                      doctorName={appointment.doctorName}
                      doctorSpecialty={appointment.doctorSpecialty}
                      date={appointment.date}
                      time={appointment.time}
                      status="completed"
                      location={appointment.location}
                      isVirtual={appointment.isVirtual}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-xl shadow-sm">
                <p className="text-medium-grey">No hay historial de citas</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botón flotante para chat médico */}
      <div className="fixed bottom-20 right-4">
        <button className="bg-primary text-white p-4 rounded-full shadow-lg">
          <FiMessageSquare size={24} />
        </button>
      </div>
    </div>
  );
} 