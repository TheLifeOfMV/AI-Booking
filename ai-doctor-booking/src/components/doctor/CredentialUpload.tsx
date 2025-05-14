"use client";

import React, { useState } from 'react';
import { FiUpload, FiFile, FiTrash, FiCheck } from 'react-icons/fi';
import Button from '../Button';

interface CredentialUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  uploadedFiles?: { name: string; url: string }[];
  isVerified?: boolean;
}

const CredentialUpload: React.FC<CredentialUploadProps> = ({
  onFilesSelected,
  maxFiles = 5,
  uploadedFiles = [],
  isVerified = false
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      
      if (files.length + newFiles.length <= maxFiles) {
        const updatedFiles = [...files, ...newFiles];
        setFiles(updatedFiles);
        onFilesSelected(updatedFiles);
      } else {
        alert(`Puedes subir un máximo de ${maxFiles} archivos.`);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      if (files.length + newFiles.length <= maxFiles) {
        const updatedFiles = [...files, ...newFiles];
        setFiles(updatedFiles);
        onFilesSelected(updatedFiles);
      } else {
        alert(`Puedes subir un máximo de ${maxFiles} archivos.`);
      }
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  };

  return (
    <div className="w-full">
      {isVerified ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center">
          <div className="bg-green-100 p-2 rounded-full mr-3">
            <FiCheck className="text-green-600" />
          </div>
          <div>
            <p className="text-green-800 font-medium">Credenciales verificadas</p>
            <p className="text-green-600 text-sm">Tus documentos han sido revisados y aprobados</p>
          </div>
        </div>
      ) : (
        <div 
          className={`border-2 border-dashed rounded-lg p-6 mb-4 text-center transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-light-grey'}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <FiUpload className="mx-auto text-primary text-3xl mb-3" />
          <p className="text-dark-grey mb-2">
            Arrastra tus documentos aquí o
          </p>
          <input
            type="file"
            id="credential-upload"
            multiple
            className="hidden"
            onChange={handleFileChange}
            accept="application/pdf,image/jpeg,image/png"
          />
          <Button 
            type="secondary" 
            onClick={() => document.getElementById('credential-upload')?.click()}
          >
            Seleccionar archivos
          </Button>
          <p className="text-medium-grey text-sm mt-3">
            Formatos aceptados: PDF, JPG, PNG (Máx. {maxFiles} archivos)
          </p>
        </div>
      )}

      {/* Lista de archivos subidos */}
      {(files.length > 0 || uploadedFiles.length > 0) && (
        <div className="border border-light-grey rounded-lg">
          <h4 className="font-medium p-3 border-b border-light-grey">
            Documentos subidos
          </h4>
          <ul className="divide-y divide-light-grey">
            {files.map((file, index) => (
              <li key={`local-${index}`} className="flex items-center justify-between p-3">
                <div className="flex items-center">
                  <FiFile className="text-primary mr-3" />
                  <span className="text-sm text-dark-grey">
                    {file.name} <span className="text-xs text-medium-grey ml-1">({Math.round(file.size / 1024)} KB)</span>
                  </span>
                </div>
                <button 
                  onClick={() => removeFile(index)}
                  className="text-medium-grey hover:text-red-500 transition-colors"
                >
                  <FiTrash size={16} />
                </button>
              </li>
            ))}
            
            {uploadedFiles.map((file, index) => (
              <li key={`uploaded-${index}`} className="flex items-center justify-between p-3">
                <div className="flex items-center">
                  <FiFile className="text-green-600 mr-3" />
                  <span className="text-sm text-dark-grey">
                    {file.name} <span className="text-xs text-green-600 ml-1">(Ya subido)</span>
                  </span>
                </div>
                {!isVerified && (
                  <button 
                    className="text-medium-grey hover:text-red-500 transition-colors"
                  >
                    <FiTrash size={16} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CredentialUpload; 