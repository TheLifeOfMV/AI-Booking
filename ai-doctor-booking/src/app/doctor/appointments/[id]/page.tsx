"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { 
  FiArrowLeft, 
  FiClock, 
  FiMapPin, 
  FiVideo, 
  FiPhone,
  FiEdit,
  FiFileText,
  FiCamera,
  FiSave,
  FiUser,
  FiMail,
  FiCalendar,
  FiPaperclip
} from 'react-icons/fi';
import { ALL_MOCK_APPOINTMENTS, ExtendedAppointment } from '../mockAppointments';
import AppointmentActions from '../components/AppointmentActions';
import FileUpload, { UploadedFile } from '@/components/doctor/FileUpload';

const AppointmentDetailPage = () => {
  const params = useParams();
  const appointmentId = params.id as string;
  
  const [appointment, setAppointment] = useState<ExtendedAppointment | null>(null);
  const [notes, setNotes] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([]);

  useEffect(() => {
    // Simulate API call
    const found = ALL_MOCK_APPOINTMENTS.find(apt => apt.id === appointmentId);
    setAppointment(found || null);
    setNotes(found?.doctorNotes || '');
    setLoading(false);
  }, [appointmentId]);

  const handleSaveNotes = async () => {
    if (!appointment) return;
    
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAppointment({
        ...appointment,
        doctorNotes: notes
      });
      setEditingNotes(false);
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: ExtendedAppointment['status']) => {
    const statusConfig = {
      confirmed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmada' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completada' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelada' },
      'no-show': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'No asistió' }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E6F0FA' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-medium-grey">Cargando detalles de la cita...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E6F0FA' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark-grey mb-4">Cita no encontrada</h1>
          <p className="text-medium-grey mb-8">La cita que buscas no existe o ha sido eliminada.</p>
          <Link
            href="/doctor/appointments"
            className="inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors text-white"
            style={{ backgroundColor: '#007AFF' }}
          >
            <FiArrowLeft className="mr-2" size={18} />
            Volver a Citas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E6F0FA' }}>
      <div className="container max-w-4xl mx-auto py-8 px-6">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="p-6">
            {/* Top Navigation Row */}
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/doctor/appointments"
                className="inline-flex items-center px-4 py-2 rounded-lg text-primary hover:bg-blue-50 font-medium transition-all duration-200"
                style={{ color: '#007AFF' }}
              >
                <FiArrowLeft className="mr-2" size={18} />
                Volver a Citas
              </Link>
              {getStatusBadge(appointment.status)}
            </div>
            
            {/* Title Section */}
            <div className="border-t border-light-grey pt-6">
              <div>
                <h1 className="text-3xl font-bold text-dark-grey mb-2">Detalles de la Cita</h1>
                <div className="flex items-center text-medium-grey">
                  <span className="text-sm font-medium bg-light-grey/50 px-3 py-1 rounded-full">
                    ID: #{appointment.id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Patient Information */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-light-grey">
                <h2 className="text-xl font-semibold text-dark-grey flex items-center">
                  <FiUser className="mr-3" size={20} />
                  Información del Paciente
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-light-grey flex-shrink-0">
                    <Image 
                      src={appointment.patientAvatar} 
                      alt={appointment.patientName}
                      width={80}
                      height={80}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-dark-grey mb-2">
                      {appointment.patientName}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-medium-grey">
                      <div className="flex items-center">
                        <FiMail className="mr-2" size={16} />
                        <span>{appointment.patientEmail}</span>
                      </div>
                      <div className="flex items-center">
                        <FiPhone className="mr-2" size={16} />
                        <span>{appointment.patientPhone}</span>
                      </div>
                      <div className="flex items-center">
                        <FiCalendar className="mr-2" size={16} />
                        <span>Edad: {appointment.patientAge} años</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-light-grey">
                <h2 className="text-xl font-semibold text-dark-grey flex items-center">
                  <FiCalendar className="mr-3" size={20} />
                  Detalles de la Cita
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-medium-grey mb-2">
                      Fecha y Hora
                    </label>
                    <div className="flex items-center text-dark-grey">
                      <FiClock className="mr-2" size={16} />
                      <span className="font-medium">
                        {new Date(appointment.date).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-dark-grey mt-1">
                      {appointment.time} - {appointment.endTime}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-medium-grey mb-2">
                      Ubicación
                    </label>
                    <div className="flex items-center text-dark-grey">
                      {appointment.consultationType === 'virtual' ? (
                        <FiVideo className="mr-2" size={16} />
                      ) : (
                        <FiMapPin className="mr-2" size={16} />
                      )}
                      <span className="font-medium">{appointment.location}</span>
                    </div>
                    {appointment.roomNumber && (
                      <div className="text-medium-grey mt-1">
                        Sala {appointment.roomNumber}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-medium-grey mb-2">
                      Motivo de la consulta
                    </label>
                    <p className="text-dark-grey font-medium">{appointment.reason}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-medium-grey mb-2">
                      Duración
                    </label>
                    <span className="text-dark-grey font-medium">{appointment.duration} min</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Notes and Files */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-light-grey">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-dark-grey flex items-center">
                    <FiFileText className="mr-3" size={20} />
                    Notas del Doctor
                    {attachedFiles.length > 0 && (
                      <span className="ml-2 flex items-center text-sm text-primary">
                        <FiPaperclip className="mr-1" size={14} />
                        {attachedFiles.length}
                      </span>
                    )}
                  </h2>
                  <button
                    onClick={() => setEditingNotes(!editingNotes)}
                    className="flex items-center text-primary hover:text-blue-600 font-medium"
                  >
                    <FiEdit className="mr-2" size={16} />
                    {editingNotes ? 'Cancelar' : 'Editar'}
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {/* Notes Section */}
                <div>
                  {editingNotes ? (
                    <div>
                      <label className="block text-sm font-medium text-dark-grey mb-2">
                        Notas de la Consulta
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Agregar notas sobre la consulta, diagnóstico, tratamiento recomendado, etc."
                        className="w-full h-32 p-4 border border-light-grey rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-medium-grey mb-2">
                        Notas de la Consulta
                      </label>
                      {notes ? (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-dark-grey whitespace-pre-wrap">{notes}</p>
                        </div>
                      ) : (
                        <p className="text-medium-grey italic p-4 bg-gray-50 rounded-lg">
                          No hay notas para esta cita. Haz clic en "Editar" para agregar notas.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* File Upload Section */}
                {editingNotes && (
                  <div>
                    <label className="block text-sm font-medium text-dark-grey mb-3">
                      Documentos Médicos
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <FileUpload
                        appointmentId={appointment.id}
                        existingFiles={attachedFiles}
                        onFilesChange={setAttachedFiles}
                        maxFiles={5}
                        maxFileSize={10}
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}

                {/* Display attached files when not editing */}
                {!editingNotes && attachedFiles.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-medium-grey mb-3">
                      Documentos Adjuntos
                    </label>
                    <div className="space-y-2">
                      {attachedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 border border-light-grey rounded-lg bg-gray-50"
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="p-2 rounded-lg bg-white">
                              <FiFileText size={16} className="text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-dark-grey truncate">{file.name}</p>
                              <p className="text-sm text-medium-grey">
                                {new Date(file.uploadedAt).toLocaleDateString('es-ES')}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => window.open(file.url, '_blank')}
                            className="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver archivo"
                          >
                            <FiFileText size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save Button */}
                {editingNotes && (
                  <div className="flex items-center gap-3 pt-4 border-t border-light-grey">
                    <button
                      onClick={handleSaveNotes}
                      disabled={loading}
                      className="flex items-center px-4 py-2 rounded-lg font-medium transition-colors text-white disabled:opacity-50"
                      style={{ backgroundColor: '#007AFF' }}
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <FiSave className="mr-2" size={14} />
                      )}
                      Guardar
                    </button>
                    <p className="text-sm text-medium-grey">
                      Se guardarán las notas y los archivos adjuntos
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm overflow-visible">
              <div className="p-6 border-b border-light-grey">
                <h3 className="text-lg font-semibold text-dark-grey">Acciones</h3>
              </div>
              <div className="p-6 relative">
                <AppointmentActions 
                  appointment={appointment}
                  onConfirm={async (id) => console.log('Confirm', id)}
                  onCancel={async (id) => console.log('Cancel', id)}
                  onViewDetails={(id) => console.log('View details', id)}
                  onReschedule={(id) => console.log('Reschedule', id)}
                  compact={false}
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailPage; 