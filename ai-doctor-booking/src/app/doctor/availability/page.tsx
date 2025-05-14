"use client";

import React, { useState } from 'react';
import ScheduleManager from '@/components/doctor/ScheduleManager';
import Button from '@/components/Button';
import { FiSave, FiClock, FiCalendar, FiCheck } from 'react-icons/fi';

// Horario por defecto
const DEFAULT_SCHEDULE = [
  {
    dayOfWeek: 0,
    isAvailable: true,
    slots: [
      { start: '09:00', end: '13:00' },
      { start: '16:00', end: '19:00' }
    ]
  },
  {
    dayOfWeek: 1,
    isAvailable: true,
    slots: [
      { start: '09:00', end: '14:00' }
    ]
  },
  {
    dayOfWeek: 2,
    isAvailable: true,
    slots: [
      { start: '09:00', end: '13:00' },
      { start: '16:00', end: '19:00' }
    ]
  },
  {
    dayOfWeek: 3,
    isAvailable: true,
    slots: [
      { start: '16:00', end: '20:00' }
    ]
  },
  {
    dayOfWeek: 4,
    isAvailable: true,
    slots: [
      { start: '09:00', end: '13:00' }
    ]
  },
  { dayOfWeek: 5, isAvailable: false, slots: [] },
  { dayOfWeek: 6, isAvailable: false, slots: [] }
];

// Ejemplo de fechas bloqueadas (vacaciones, días especiales, etc.)
const BLOCKED_DATES = [
  { date: '2023-07-15', reason: 'Vacaciones' },
  { date: '2023-07-16', reason: 'Vacaciones' },
  { date: '2023-07-17', reason: 'Vacaciones' },
  { date: '2023-08-05', reason: 'Conferencia Médica' }
];

const DoctorAvailabilityPage = () => {
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [blockedDates, setBlockedDates] = useState(BLOCKED_DATES);
  const [newBlockDate, setNewBlockDate] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  const handleScheduleChange = (updatedSchedule: typeof DEFAULT_SCHEDULE) => {
    setSchedule(updatedSchedule);
  };
  
  const handleAddBlockedDate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newBlockDate && newBlockReason) {
      setBlockedDates([
        ...blockedDates,
        {
          date: newBlockDate,
          reason: newBlockReason
        }
      ]);
      
      // Limpiar el formulario
      setNewBlockDate('');
      setNewBlockReason('');
    }
  };
  
  const handleRemoveBlockedDate = (dateToRemove: string) => {
    setBlockedDates(blockedDates.filter(item => item.date !== dateToRemove));
  };
  
  const handleSaveAvailability = () => {
    setIsSaving(true);
    
    // Simulación de guardado
    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
      
      // Ocultar notificación después de 3 segundos
      setTimeout(() => {
        setSavedSuccess(false);
      }, 3000);
      
      // Aquí iría el código real para guardar en el backend
    }, 1000);
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Gestión de Disponibilidad</h1>
      
      {/* Notificación de guardado exitoso */}
      {savedSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-6 flex items-center">
          <FiCheck className="text-green-600 mr-2" />
          Tu disponibilidad ha sido actualizada correctamente.
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="p-4 border-b border-light-grey bg-light-grey/20">
              <h2 className="text-lg font-semibold flex items-center">
                <FiClock className="mr-2" /> Horario Regular
              </h2>
              <p className="text-sm text-medium-grey">
                Configura tus horas disponibles para cada día de la semana.
              </p>
            </div>
            
            <div className="p-6">
              <ScheduleManager
                initialSchedule={schedule}
                onChange={handleScheduleChange}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              type="primary"
              onClick={handleSaveAvailability}
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
        </div>
        
        <div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="p-4 border-b border-light-grey bg-light-grey/20">
              <h2 className="text-lg font-semibold flex items-center">
                <FiCalendar className="mr-2" /> Días Bloqueados
              </h2>
              <p className="text-sm text-medium-grey">
                Añade días específicos en los que no estarás disponible.
              </p>
            </div>
            
            <div className="p-4">
              <form onSubmit={handleAddBlockedDate} className="mb-4">
                <div className="mb-4">
                  <label htmlFor="block-date" className="block text-dark-grey font-medium mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    id="block-date"
                    value={newBlockDate}
                    onChange={(e) => setNewBlockDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-light-grey focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="block-reason" className="block text-dark-grey font-medium mb-1">
                    Motivo
                  </label>
                  <input
                    type="text"
                    id="block-reason"
                    value={newBlockReason}
                    onChange={(e) => setNewBlockReason(e.target.value)}
                    placeholder="Vacaciones, conferencia, etc."
                    className="w-full px-4 py-2 rounded-lg border border-light-grey focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>
                
                <Button
                  type="primary"
                  htmlType="submit"
                  fullWidth
                >
                  Añadir Día Bloqueado
                </Button>
              </form>
              
              <div className="border-t border-light-grey pt-4">
                <h3 className="font-medium mb-2">Días Bloqueados Programados</h3>
                
                {blockedDates.length > 0 ? (
                  <ul className="space-y-2 max-h-80 overflow-y-auto">
                    {blockedDates.map((blockedDate, index) => {
                      // Formatear la fecha para mostrarla
                      const date = new Date(blockedDate.date);
                      const formattedDate = date.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      });
                      
                      return (
                        <li 
                          key={index} 
                          className="bg-light-grey/30 rounded-lg p-3 flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium capitalize">{formattedDate}</p>
                            <p className="text-sm text-medium-grey">{blockedDate.reason}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveBlockedDate(blockedDate.date)}
                            className="text-red-500 hover:text-red-700"
                            title="Eliminar"
                          >
                            ✕
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-medium-grey text-center p-4">
                    No tienes días bloqueados configurados.
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h3 className="font-medium mb-2 text-primary">¿Sabías que?</h3>
            <p className="text-sm">
              Mantener tu disponibilidad actualizada mejora la satisfacción de tus pacientes y reduce las cancelaciones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAvailabilityPage; 