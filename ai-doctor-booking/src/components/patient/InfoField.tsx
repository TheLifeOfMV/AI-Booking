import React from 'react';

interface InfoFieldProps {
  label: string;
  value?: string | string[] | null;
  icon?: React.ReactNode;
  multiline?: boolean;
  isList?: boolean;
}

/**
 * Componente para mostrar un campo de información con etiqueta y valor
 */
const InfoField: React.FC<InfoFieldProps> = ({
  label,
  value,
  icon,
  multiline = false,
  isList = false
}) => {
  // Si no hay valor, mostrar un mensaje de "No disponible"
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return (
      <div className="mb-3 last:mb-0">
        <div className="flex items-start">
          {icon && <span className="text-primary mr-2 mt-1">{icon}</span>}
          <div>
            <p className="text-sm text-medium-grey">{label}</p>
            <p className="text-sm text-medium-grey italic">No disponible</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-start">
        {icon && <span className="text-primary mr-2 mt-1">{icon}</span>}
        <div>
          <p className="text-sm text-medium-grey">{label}</p>
          {isList && Array.isArray(value) ? (
            <ul className="list-disc pl-4 mt-1">
              {value.map((item, index) => (
                <li key={index} className="text-dark-grey">{item}</li>
              ))}
            </ul>
          ) : multiline ? (
            <p className="text-dark-grey whitespace-pre-line">{value}</p>
          ) : (
            <p className="text-dark-grey">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoField; 