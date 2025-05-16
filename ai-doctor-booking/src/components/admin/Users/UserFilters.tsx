'use client';

import { useState, useCallback, useEffect } from 'react';
import { UserFilter, UserRole, UserStatus } from '@/types/user';
import { debounce } from '@/utils/helpers';

// Crear un objeto global para compartir el estado de los filtros entre componentes
// Esta es una solución simple que evita pasar funciones desde Server Components
export const userFiltersState = {
  filters: {} as UserFilter,
  listeners: new Set<(filters: UserFilter) => void>(),
  
  setFilters(newFilters: UserFilter) {
    this.filters = newFilters;
    this.notifyListeners();
  },
  
  subscribe(listener: (filters: UserFilter) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  },
  
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.filters));
  }
};

interface UserFiltersProps {
  onFilterChange?: (filters: UserFilter) => void;
  initialFilters?: UserFilter;
}

export default function UserFilters({ onFilterChange, initialFilters = {} }: UserFiltersProps) {
  const [filters, setFilters] = useState<UserFilter>(initialFilters);
  
  // Setup debounced filter change to avoid too many API requests
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFilterChange = useCallback(
    debounce((newFilters: UserFilter) => {
      // Si se proporciona onFilterChange, úsalo
      if (onFilterChange) {
        onFilterChange(newFilters);
      }
      
      // Actualizar estado global
      userFiltersState.setFilters(newFilters);
    }, 300),
    [onFilterChange]
  );
  
  // Handle filter changes and propagate to parent
  const handleFilterChange = (newFilters: Partial<UserFilter>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    debouncedFilterChange(updatedFilters);
  };
  
  // Sync with initial filters when they change (e.g., from URL params)
  useEffect(() => {
    // Use JSON stringification to do a deep comparison to avoid unnecessary updates
    const currentFiltersStr = JSON.stringify(filters);
    const initialFiltersStr = JSON.stringify(initialFilters);
    
    // Only update if the filters are actually different to prevent infinite loops
    if (currentFiltersStr !== initialFiltersStr) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Search input */}
        <div className="col-span-1 md:col-span-1 lg:col-span-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-medium-grey" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar usuarios..."
              className="block w-full pl-10 pr-3 py-2 border border-light-grey rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
            />
          </div>
        </div>
        
        {/* Status filter */}
        <div>
          <select
            className="block w-full pl-3 pr-10 py-2 border border-light-grey rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            value={filters.status || ''}
            onChange={(e) => {
              const value = e.target.value as UserStatus | '';
              handleFilterChange({ status: value || undefined });
            }}
          >
            <option value="">Todos los Estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="pending">Pendiente</option>
          </select>
        </div>
        
        {/* Role filter */}
        <div>
          <select
            className="block w-full pl-3 pr-10 py-2 border border-light-grey rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            value={filters.role || ''}
            onChange={(e) => {
              const value = e.target.value as UserRole | '';
              handleFilterChange({ role: value || undefined });
            }}
          >
            <option value="">Todos los Roles</option>
            <option value="patient">Paciente</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
      </div>
    </div>
  );
} 