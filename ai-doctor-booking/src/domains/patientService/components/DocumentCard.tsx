import React from 'react';
import { FiDownload, FiFileText, FiClipboard, FiActivity } from 'react-icons/fi';

interface DocumentCardProps {
  id: string;
  title: string;
  date: string;
  type: 'report' | 'prescription' | 'labResult' | 'other';
  fileUrl: string;
}

/**
 * Componente que muestra una tarjeta de documento médico
 */
const DocumentCard: React.FC<DocumentCardProps> = ({
  id,
  title,
  date,
  type,
  fileUrl
}) => {
  // Determinar el icono según el tipo de documento
  const getIcon = () => {
    switch (type) {
      case 'report':
        return <FiFileText size={24} />;
      case 'prescription':
        return <FiClipboard size={24} />;
      case 'labResult':
        return <FiActivity size={24} />;
      default:
        return <FiFileText size={24} />;
    }
  };

  // Formatear la fecha a un formato más legible
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white border border-light-grey rounded-lg p-3 flex items-center justify-between mb-3">
      <div className="flex items-center">
        <div className="p-2 bg-light-grey rounded-lg text-primary mr-3">
          {getIcon()}
        </div>
        <div>
          <h4 className="font-medium text-dark-grey">{title}</h4>
          <p className="text-sm text-medium-grey">{formatDate(date)}</p>
        </div>
      </div>
      <button 
        className="p-2 hover:bg-light-grey rounded-full transition-colors"
        aria-label="Descargar documento"
        onClick={() => window.open(fileUrl, '_blank')}
      >
        <FiDownload className="text-primary" size={20} />
      </button>
    </div>
  );
};

export default DocumentCard; 