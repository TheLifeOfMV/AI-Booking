"use client";

import React, { useState, useRef, useCallback } from 'react';
import { FiUpload, FiFile, FiX, FiDownload, FiImage, FiFileText, FiAlertCircle } from 'react-icons/fi';

// Types for file upload
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
  category: 'medical_order' | 'prescription' | 'lab_result' | 'image' | 'document' | 'other';
}

interface FileUploadProps {
  appointmentId: string;
  existingFiles?: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  disabled?: boolean;
}

// File type categories with icons and colors
const FILE_CATEGORIES = {
  medical_order: { 
    label: 'Orden Médica', 
    icon: FiFileText, 
    color: '#007AFF',
    bgColor: '#E6F0FA'
  },
  prescription: { 
    label: 'Receta', 
    icon: FiFile, 
    color: '#34C759',
    bgColor: '#E8F5E8'
  },
  lab_result: { 
    label: 'Resultado de Laboratorio', 
    icon: FiFileText, 
    color: '#FF9500',
    bgColor: '#FFF4E6'
  },
  image: { 
    label: 'Imagen Médica', 
    icon: FiImage, 
    color: '#AF52DE',
    bgColor: '#F3E8FF'
  },
  document: { 
    label: 'Documento', 
    icon: FiFileText, 
    color: '#8E8E93',
    bgColor: '#F2F2F7'
  },
  other: { 
    label: 'Otro', 
    icon: FiFile, 
    color: '#8E8E93',
    bgColor: '#F2F2F7'
  }
};

/**
 * FileUpload Component
 * 
 * Allows doctors to upload medical documents and files alongside their notes.
 * Features:
 * - Drag and drop support
 * - File type validation
 * - Size limits
 * - File categorization
 * - Preview and download
 * - Progress tracking
 */
const FileUpload: React.FC<FileUploadProps> = ({
  appointmentId,
  existingFiles = [],
  onFilesChange,
  maxFiles = 10,
  maxFileSize = 10, // 10MB default
  acceptedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ],
  disabled = false
}) => {
  // State management
  const [files, setFiles] = useState<UploadedFile[]>(existingFiles);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<string[]>([]);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Determine file category based on type and name
  const determineFileCategory = (file: File): UploadedFile['category'] => {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();

    if (fileType.startsWith('image/')) return 'image';
    if (fileType === 'application/pdf') {
      if (fileName.includes('orden') || fileName.includes('order')) return 'medical_order';
      if (fileName.includes('receta') || fileName.includes('prescription')) return 'prescription';
      if (fileName.includes('laboratorio') || fileName.includes('lab')) return 'lab_result';
      return 'document';
    }
    if (fileName.includes('orden') || fileName.includes('order')) return 'medical_order';
    if (fileName.includes('receta') || fileName.includes('prescription')) return 'prescription';
    if (fileName.includes('laboratorio') || fileName.includes('lab')) return 'lab_result';
    
    return 'document';
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return `Tipo de archivo no permitido: ${file.type}`;
    }

    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `El archivo es demasiado grande. Máximo: ${maxFileSize}MB`;
    }

    // Check total files limit
    if (files.length >= maxFiles) {
      return `Máximo ${maxFiles} archivos permitidos`;
    }

    return null;
  };

  // Upload file to server
  const uploadFile = async (file: File): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('appointmentId', appointmentId);
    formData.append('category', determineFileCategory(file));

    // Track upload progress
    const fileId = `temp-${Date.now()}-${Math.random()}`;
    setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

    try {
      // Make actual API call
      const response = await fetch('/api/appointments/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir el archivo');
      }

      const result = await response.json();
      
      // Update progress to 100%
      setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));

      // Create uploaded file object
      const uploadedFile: UploadedFile = {
        id: result.file.id,
        name: result.file.name,
        size: result.file.size,
        type: result.file.type,
        url: result.file.url,
        uploadedAt: result.file.uploadedAt,
        category: result.file.category as UploadedFile['category']
      };

      // Clean up progress tracking
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      }, 1000);

      return uploadedFile;

    } catch (error) {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileId];
        return newProgress;
      });
      throw error instanceof Error ? error : new Error('Error al subir el archivo');
    }
  };

  // Handle file selection
  const handleFiles = useCallback(async (selectedFiles: FileList | File[]) => {
    if (disabled) return;

    const fileArray = Array.from(selectedFiles);
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    // Validate each file
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    setErrors(newErrors);

    if (validFiles.length === 0) return;

    // Start uploading valid files
    const uploadPromises = validFiles.map(async (file) => {
      const tempId = `uploading-${Date.now()}-${Math.random()}`;
      setUploading(prev => [...prev, tempId]);

      try {
        const uploadedFile = await uploadFile(file);
        setUploading(prev => prev.filter(id => id !== tempId));
        return uploadedFile;
      } catch (error) {
        setUploading(prev => prev.filter(id => id !== tempId));
        setErrors(prev => [...prev, `Error al subir ${file.name}`]);
        return null;
      }
    });

    const uploadedFiles = (await Promise.all(uploadPromises)).filter(Boolean) as UploadedFile[];
    
    if (uploadedFiles.length > 0) {
      const updatedFiles = [...files, ...uploadedFiles];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
    }
  }, [files, disabled, appointmentId, maxFiles, maxFileSize, acceptedTypes, onFilesChange]);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Remove file
  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  // Get file icon and color
  const getFileDisplay = (file: UploadedFile) => {
    const category = FILE_CATEGORIES[file.category];
    const IconComponent = category.icon;
    
    return {
      icon: <IconComponent size={20} style={{ color: category.color }} />,
      bgColor: category.bgColor,
      color: category.color,
      label: category.label
    };
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
          ${isDragging 
            ? 'border-primary bg-blue-50' 
            : 'border-light-grey hover:border-primary hover:bg-gray-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="flex flex-col items-center space-y-2">
          <FiUpload size={32} className={isDragging ? 'text-primary' : 'text-medium-grey'} />
          <div>
            <p className="text-dark-grey font-medium">
              {isDragging ? 'Suelta los archivos aquí' : 'Arrastra archivos aquí o haz clic para seleccionar'}
            </p>
            <p className="text-sm text-medium-grey mt-1">
              Máximo {maxFiles} archivos, {maxFileSize}MB cada uno
            </p>
            <p className="text-xs text-medium-grey mt-1">
              Formatos: PDF, DOC, DOCX, JPG, PNG, TXT
            </p>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <FiAlertCircle className="text-red-500 mr-2 flex-shrink-0" size={16} />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-dark-grey">Archivos Adjuntos ({files.length})</h4>
          <div className="space-y-2">
            {files.map((file) => {
              const display = getFileDisplay(file);
              return (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border border-light-grey rounded-lg bg-white"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div 
                      className="p-2 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: display.bgColor }}
                    >
                      {display.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-dark-grey truncate">{file.name}</p>
                      <div className="flex items-center space-x-2 text-sm text-medium-grey">
                        <span>{display.label}</span>
                        <span>•</span>
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{new Date(file.uploadedAt).toLocaleDateString('es-ES')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => window.open(file.url, '_blank')}
                      className="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors"
                      title="Descargar archivo"
                    >
                      <FiDownload size={16} />
                    </button>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar archivo"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-dark-grey">Subiendo archivos...</h4>
          {uploading.map((uploadId) => (
            <div key={uploadId} className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-dark-grey">Subiendo archivo...</span>
                  <span className="text-sm text-medium-grey">
                    {uploadProgress[uploadId] || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress[uploadId] || 0}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Categories Legend */}
      {files.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-medium text-dark-grey mb-3">Categorías de Archivos</h5>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {Object.entries(FILE_CATEGORIES).map(([key, category]) => {
              const IconComponent = category.icon;
              return (
                <div key={key} className="flex items-center space-x-2">
                  <div 
                    className="p-1 rounded"
                    style={{ backgroundColor: category.bgColor }}
                  >
                    <IconComponent size={12} style={{ color: category.color }} />
                  </div>
                  <span className="text-medium-grey">{category.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 