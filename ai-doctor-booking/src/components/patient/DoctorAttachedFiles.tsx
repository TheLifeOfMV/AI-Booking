"use client";

import React from 'react';
import { FiPaperclip, FiDownload, FiFileText } from 'react-icons/fi';

// Types for attached files
export interface DoctorAttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
  category: 'medical_order' | 'prescription' | 'lab_result' | 'image' | 'document' | 'other';
}

interface DoctorAttachedFilesProps {
  files: DoctorAttachedFile[];
  appointmentId: string;
  className?: string;
}

/**
 * Component to display doctor's attached files for patients
 * Following MONOCODE principles with structured logging and explicit error handling
 */
const DoctorAttachedFiles: React.FC<DoctorAttachedFilesProps> = ({
  files,
  appointmentId,
  className = ""
}) => {
  // Observable Implementation: Structured logging for file interactions
  const handleFileDownload = (file: DoctorAttachedFile) => {
    console.log('Patient file download initiated', {
      appointmentId,
      fileId: file.id,
      fileName: file.name,
      fileCategory: file.category,
      timestamp: new Date().toISOString()
    });
  };

  // Helper functions with explicit error handling
  const formatFileSize = (bytes: number): string => {
    try {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    } catch (error) {
      console.error('Error formatting file size', { bytes, error });
      return 'Tamaño desconocido';
    }
  };

  const getFileIcon = (): JSX.Element => {
    return <FiFileText className="text-gray-600" size={24} />;
  };

  const getCategoryLabel = (category: string): string => {
    const labels = {
      'medical_order': 'Orden Médica',
      'prescription': 'Receta',
      'lab_result': 'Resultado Lab',
      'image': 'Imagen',
      'document': 'Documento',
      'other': 'Archivo'
    };
    return labels[category as keyof typeof labels] || labels.other;
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch (error) {
      console.error('Error formatting date', { dateString, error });
      return 'Fecha desconocida';
    }
  };

  // Explicit Error Handling: Early return for empty files
  if (!files || files.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center mb-3">
        <FiPaperclip className="mr-2 text-blue-600" size={20} />
        <h2 className="font-semibold text-lg">Archivos del Doctor</h2>
      </div>
      
      <p className="text-medium-grey text-sm mb-4">
        Documentos y archivos adjuntados por el doctor durante tu consulta.
      </p>
      
      {/* Files List */}
      <div className="space-y-3">
        {files.map((file) => (
          <div 
            key={file.id} 
            className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1 min-w-0">
                <div className="mr-3 flex-shrink-0">
                  {getFileIcon()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-dark-grey text-sm truncate">
                    {file.name}
                  </h3>
                  <p className="text-xs text-medium-grey">
                    {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                  </p>
                </div>
              </div>
              <a
                href={file.url}
                download={file.name}
                onClick={() => handleFileDownload(file)}
                className="ml-3 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                title="Descargar archivo"
              >
                <FiDownload size={16} />
              </a>
            </div>
          </div>
        ))}
      </div>
      
      {/* Important Notice */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-2">
          <FiFileText className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
          <div>
            <p className="text-sm text-blue-800 font-medium">Importante</p>
            <p className="text-xs text-blue-700">
              Guarda estos archivos en un lugar seguro. Son documentos importantes para tu historial médico.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAttachedFiles; 