"use client";

import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiClock } from 'react-icons/fi';

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  dayOfWeek: number;
  isAvailable: boolean;
  slots: TimeSlot[];
}

interface ScheduleEditorProps {
  schedule: DaySchedule[];
  onChange: (schedule: DaySchedule[]) => void;
  disabled?: boolean;
}

const ScheduleEditor: React.FC<ScheduleEditorProps> = ({
  schedule,
  onChange,
  disabled = false
}) => {
  const [localSchedule, setLocalSchedule] = useState<DaySchedule[]>(schedule);

  const dayNames = [
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 
    'Viernes', 'Sábado', 'Domingo'
  ];

  // Mapeo para convertir índices de array a días de la semana reales
  const arrayIndexToDayOfWeek = (arrayIndex: number): number => {
    // Lunes=1, Martes=2, ..., Sábado=6, Domingo=0
    return arrayIndex === 6 ? 0 : arrayIndex + 1;
  };

  const dayOfWeekToArrayIndex = (dayOfWeek: number): number => {
    // Domingo=0 -> índice 6, Lunes=1 -> índice 0, etc.
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  };

  const updateSchedule = (newSchedule: DaySchedule[]) => {
    setLocalSchedule(newSchedule);
    onChange(newSchedule);
  };

  const toggleDayAvailability = (arrayIndex: number) => {
    if (disabled) return;
    
    const realDayOfWeek = arrayIndexToDayOfWeek(arrayIndex);
    const newSchedule = localSchedule.map(day => {
      if (day.dayOfWeek === realDayOfWeek) {
        return {
          ...day,
          isAvailable: !day.isAvailable,
          slots: !day.isAvailable ? [{ start: '09:00', end: '17:00' }] : []
        };
      }
      return day;
    });
    
    updateSchedule(newSchedule);
  };

  const addTimeSlot = (arrayIndex: number) => {
    if (disabled) return;
    
    const realDayOfWeek = arrayIndexToDayOfWeek(arrayIndex);
    const newSchedule = localSchedule.map(day => {
      if (day.dayOfWeek === realDayOfWeek) {
        const newSlot = { start: '09:00', end: '17:00' };
        return {
          ...day,
          slots: [...day.slots, newSlot]
        };
      }
      return day;
    });
    
    updateSchedule(newSchedule);
  };

  const removeTimeSlot = (arrayIndex: number, slotIndex: number) => {
    if (disabled) return;
    
    const realDayOfWeek = arrayIndexToDayOfWeek(arrayIndex);
    const newSchedule = localSchedule.map(day => {
      if (day.dayOfWeek === realDayOfWeek) {
        const newSlots = day.slots.filter((_, index) => index !== slotIndex);
        return {
          ...day,
          slots: newSlots,
          isAvailable: newSlots.length > 0
        };
      }
      return day;
    });
    
    updateSchedule(newSchedule);
  };

  const updateTimeSlot = (arrayIndex: number, slotIndex: number, field: 'start' | 'end', value: string) => {
    if (disabled) return;
    
    const realDayOfWeek = arrayIndexToDayOfWeek(arrayIndex);
    const newSchedule = localSchedule.map(day => {
      if (day.dayOfWeek === realDayOfWeek) {
        const newSlots = day.slots.map((slot, index) => {
          if (index === slotIndex) {
            return { ...slot, [field]: value };
          }
          return slot;
        });
        return { ...day, slots: newSlots };
      }
      return day;
    });
    
    updateSchedule(newSchedule);
  };

  const validateTimeSlot = (start: string, end: string): boolean => {
    return start < end;
  };

  return (
    <div className="space-y-4">
      <div className="bg-light-grey/50 p-4 rounded-lg mb-6">
        <h3 className="font-medium mb-2 flex items-center">
          <FiClock className="mr-2" /> Configurar Horarios de Atención
        </h3>
        <p className="text-sm text-medium-grey">
          Define los días y horarios en los que estarás disponible para consultas.
          Puedes agregar múltiples bloques de tiempo para cada día.
        </p>
      </div>

      {dayNames.map((dayName, arrayIndex) => {
        const realDayOfWeek = arrayIndexToDayOfWeek(arrayIndex);
        const daySchedule = localSchedule.find(d => d.dayOfWeek === realDayOfWeek) || {
          dayOfWeek: realDayOfWeek,
          isAvailable: false,
          slots: []
        };

        return (
          <div key={arrayIndex} className="bg-white rounded-lg border border-light-grey p-4">
            {/* Day Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`day-${arrayIndex}`}
                  checked={daySchedule.isAvailable}
                  onChange={() => toggleDayAvailability(arrayIndex)}
                  disabled={disabled}
                  className="h-4 w-4 text-primary border-light-grey rounded focus:ring-primary mr-3"
                />
                <label 
                  htmlFor={`day-${arrayIndex}`}
                  className={`font-medium ${daySchedule.isAvailable ? 'text-dark-grey' : 'text-medium-grey'}`}
                >
                  {dayName}
                </label>
              </div>
              
              {daySchedule.isAvailable && !disabled && (
                <button
                  onClick={() => addTimeSlot(arrayIndex)}
                  className="flex items-center text-primary hover:text-blue-600 text-sm"
                >
                  <FiPlus className="w-4 h-4 mr-1" />
                  Agregar horario
                </button>
              )}
            </div>

            {/* Time Slots */}
            {daySchedule.isAvailable && (
              <div className="space-y-3">
                {daySchedule.slots.length === 0 ? (
                  <p className="text-medium-grey text-sm italic">
                    No hay horarios configurados para este día
                  </p>
                ) : (
                  daySchedule.slots.map((slot, slotIndex) => {
                    const isValidSlot = validateTimeSlot(slot.start, slot.end);
                    
                    return (
                      <div 
                        key={slotIndex} 
                        className={`p-3 rounded-lg ${
                          isValidSlot ? 'bg-light-grey/30' : 'bg-red-50 border border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1 max-w-xs">
                            <label className="text-sm text-medium-grey block mb-1">Desde:</label>
                            <input
                              type="time"
                              value={slot.start}
                              onChange={(e) => updateTimeSlot(arrayIndex, slotIndex, 'start', e.target.value)}
                              disabled={disabled}
                              className="w-full px-3 py-2 border border-light-grey rounded focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                          </div>
                          
                          {!disabled && (
                            <button
                              onClick={() => removeTimeSlot(arrayIndex, slotIndex)}
                              className="text-red-500 hover:text-red-700 p-2 ml-3"
                              title="Eliminar horario"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="flex-1 max-w-xs">
                          <label className="text-sm text-medium-grey block mb-1">Hasta:</label>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) => updateTimeSlot(arrayIndex, slotIndex, 'end', e.target.value)}
                            disabled={disabled}
                            className="w-full px-3 py-2 border border-light-grey rounded focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>

                        {!isValidSlot && (
                          <div className="mt-2">
                            <span className="text-red-600 text-xs">
                              La hora de inicio debe ser menor que la hora de fin
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {!daySchedule.isAvailable && (
              <p className="text-medium-grey text-sm italic">
                No disponible este día
              </p>
            )}
          </div>
        );
      })}

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h4 className="font-medium text-blue-900 mb-2">Resumen de Disponibilidad</h4>
        <div className="text-sm text-blue-700">
          <p>
            Días disponibles: {localSchedule.filter(d => d.isAvailable).length} de 7
          </p>
          <p>
            Total de bloques de tiempo: {localSchedule.reduce((total, day) => total + day.slots.length, 0)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScheduleEditor; 