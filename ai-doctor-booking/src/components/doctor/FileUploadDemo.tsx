"use client";

import React, { useState } from 'react';
import FileUpload, { UploadedFile } from './FileUpload';
import { FiFileText, FiDownload, FiTrash2 } from 'react-icons/fi';

/**
 * Demo component to showcase file upload functionality
 * This can be used for testing and demonstration purposes
 */
const FileUploadDemo: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [appointmentId] = useState('demo-appointment-123');

  const handleFilesChange = (newFiles: UploadedFile[]) => {
    setFiles(newFiles);
    console.log('Files updated:', newFiles);
  };

  const clearAllFiles = () => {
    setFiles([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-light-grey">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-dark-grey flex items-center">
                <FiFileText className="mr-3" size={20} />
                Demo: Subida de Archivos Médicos
              </h2>
              <p className="text-medium-grey mt-1">
                Prueba la funcionalidad de subida de archivos para notas del doctor
              </p>
            </div>
            {files.length > 0 && (
              <button
                onClick={clearAllFiles}
                className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiTrash2 className="mr-2" size={16} />
                Limpiar Todo
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* Demo Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Información de la Demo</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• ID de Cita: <code className="bg-blue-100 px-2 py-1 rounded">{appointmentId}</code></li>
                <li>• Máximo 5 archivos por cita</li>
                <li>• Tamaño máximo: 10MB por archivo</li>
                <li>• Formatos soportados: PDF, DOC, DOCX, JPG, PNG, TXT</li>
                <li>• Los archivos se categorizan automáticamente según su nombre</li>
              </ul>
            </div>

            {/* File Upload Component */}
            <div>
              <h3 className="text-lg font-medium text-dark-grey mb-4">Subir Documentos</h3>
              <FileUpload
                appointmentId={appointmentId}
                existingFiles={files}
                onFilesChange={handleFilesChange}
                maxFiles={5}
                maxFileSize={10}
              />
            </div>

            {/* Files Summary */}
            {files.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-dark-grey mb-3">
                  Resumen de Archivos ({files.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="bg-white border border-light-grey rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-dark-grey truncate">
                            {file.name}
                          </p>
                          <div className="text-sm text-medium-grey space-y-1">
                            <p>Categoría: <span className="font-medium">{file.category}</span></p>
                            <p>Tamaño: {(file.size / 1024).toFixed(1)} KB</p>
                            <p>Tipo: {file.type}</p>
                            <p>Subido: {new Date(file.uploadedAt).toLocaleString('es-ES')}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => window.open(file.url, '_blank')}
                          className="ml-3 p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                          title="Ver archivo"
                        >
                          <FiDownload size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Usage Instructions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-dark-grey mb-3">Instrucciones de Uso</h3>
              <div className="text-sm text-medium-grey space-y-2">
                <p><strong>1. Subir archivos:</strong> Arrastra archivos al área de subida o haz clic para seleccionar</p>
                <p><strong>2. Categorización automática:</strong> Los archivos se categorizan según su nombre:</p>
                <ul className="ml-4 space-y-1">
                  <li>• Archivos con "orden" → Orden Médica</li>
                  <li>• Archivos con "receta" → Receta</li>
                  <li>• Archivos con "laboratorio" → Resultado de Laboratorio</li>
                  <li>• Imágenes → Imagen Médica</li>
                  <li>• Otros → Documento</li>
                </ul>
                <p><strong>3. Gestión:</strong> Puedes ver y descargar archivos subidos</p>
                <p><strong>4. Validación:</strong> Se valida tipo y tamaño de archivo automáticamente</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadDemo; 