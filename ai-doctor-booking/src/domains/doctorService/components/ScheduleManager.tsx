"use client";

import React, { useState } from 'react';
import { FiPlusCircle, FiTrash, FiClock } from 'react-icons/fi';

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  dayOfWeek: number;
  isAvailable: boolean;
  slots: TimeSlot[];
}

interface ScheduleManagerProps {
  initialSchedule?: DaySchedule[];
  onChange: (schedule: DaySchedule[]) => void;
}

const DAYS_OF_WEEK = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo'
];

const DEFAULT_SCHEDULE: DaySchedule[] = DAYS_OF_WEEK.map((_, index) => ({
  dayOfWeek: index,
  isAvailable: index < 5, // Por defecto lunes a viernes disponible
  slots: index < 5 ? [{ start: '09:00', end: '17:00' }] : []
}));

const ScheduleManager: React.FC<ScheduleManagerProps> = ({
  initialSchedule = DEFAULT_SCHEDULE,
  onChange
}) => {
  const [schedule, setSchedule] = useState<DaySchedule[]>(initialSchedule);

  const handleDayToggle = (dayIndex: number) => {
    const updatedSchedule = [...schedule];
    const day = { ...updatedSchedule[dayIndex] };
    
    day.isAvailable = !day.isAvailable;
    
    // Si se activa un día sin horarios, agregar uno por defecto
    if (day.isAvailable && day.slots.length === 0) {
      day.slots = [{ start: '09:00', end: '17:00' }];
    }
    
    updatedSchedule[dayIndex] = day;
    setSchedule(updatedSchedule);
    onChange(updatedSchedule);
  };

  const handleAddTimeSlot = (dayIndex: number) => {
    const updatedSchedule = [...schedule];
    const day = { ...updatedSchedule[dayIndex] };
    
    // Encontrar el último horario y crear uno nuevo a continuación
    const lastSlot = day.slots[day.slots.length - 1];
    const newEndHour = parseInt(lastSlot.end.split(':')[0]) + 1;
    
    const newSlot = {
      start: lastSlot.end,
      end: newEndHour < 10 ? `0${newEndHour}:00` : `${newEndHour < 24 ? newEndHour : 23}:00`
    };
    
    day.slots = [...day.slots, newSlot];
    updatedSchedule[dayIndex] = day;
    
    setSchedule(updatedSchedule);
    onChange(updatedSchedule);
  };

  const handleRemoveTimeSlot = (dayIndex: number, slotIndex: number) => {
    const updatedSchedule = [...schedule];
    const day = { ...updatedSchedule[dayIndex] };
    
    day.slots = day.slots.filter((_, index) => index !== slotIndex);
    updatedSchedule[dayIndex] = day;
    
    setSchedule(updatedSchedule);
    onChange(updatedSchedule);
  };

  const handleTimeChange = (
    dayIndex: number,
    slotIndex: number,
    field: 'start' | 'end',
    value: string
  ) => {
    const updatedSchedule = [...schedule];
    const day = { ...updatedSchedule[dayIndex] };
    const slot = { ...day.slots[slotIndex] };
    
    slot[field] = value;
    day.slots[slotIndex] = slot;
    updatedSchedule[dayIndex] = day;
    
    setSchedule(updatedSchedule);
    onChange(updatedSchedule);
  };

  return (
    <div className="w-full">
      <div className="bg-light-grey p-4 rounded-lg mb-4">
        <h3 className="font-medium mb-2 flex items-center">
          <FiClock className="mr-2" /> Horario de Atención
        </h3>
        <p className="text-sm text-medium-grey">
          Configura tus días y horarios disponibles para consultas. Puedes agregar múltiples franjas horarias por día.
        </p>
      </div>
      
      <div className="space-y-4">
        {schedule.map((day, dayIndex) => (
          <div 
            key={day.dayOfWeek} 
            className={`border rounded-lg overflow-hidden transition-all ${
              day.isAvailable ? 'border-primary/30' : 'border-light-grey'
            }`}
          >
            <div className="flex items-center justify-between p-3 bg-light-grey/30">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`day-${day.dayOfWeek}`}
                  checked={day.isAvailable}
                  onChange={() => handleDayToggle(dayIndex)}
                  className="mr-3 h-4 w-4 text-primary rounded focus:ring-primary"
                />
                <label 
                  htmlFor={`day-${day.dayOfWeek}`}
                  className={`font-medium ${day.isAvailable ? 'text-dark-grey' : 'text-medium-grey'}`}
                >
                  {DAYS_OF_WEEK[day.dayOfWeek]}
                </label>
              </div>
            </div>
            
            {day.isAvailable && (
              <div className="p-3 space-y-3">
                {day.slots.map((slot, slotIndex) => (
                  <div key={slotIndex} className="flex items-center gap-2">
                    <select
                      value={slot.start}
                      onChange={(e) => handleTimeChange(dayIndex, slotIndex, 'start', e.target.value)}
                      className="border border-light-grey rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {generateTimeOptions().map(time => (
                        <option key={`start-${time}`} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    <span className="text-medium-grey">a</span>
                    <select
                      value={slot.end}
                      onChange={(e) => handleTimeChange(dayIndex, slotIndex, 'end', e.target.value)}
                      className="border border-light-grey rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {generateTimeOptions().map(time => (
                        <option key={`end-${time}`} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    
                    <button
                      onClick={() => handleRemoveTimeSlot(dayIndex, slotIndex)}
                      className="text-medium-grey hover:text-red-500 transition-colors ml-auto"
                      disabled={day.slots.length === 1}
                      title={day.slots.length === 1 ? "No puedes eliminar el único horario" : "Eliminar horario"}
                    >
                      <FiTrash size={16} />
                    </button>
                  </div>
                ))}
                
                <button
                  onClick={() => handleAddTimeSlot(dayIndex)}
                  className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  <FiPlusCircle className="mr-1" /> Agregar franja horaria
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Genera opciones de tiempo para los selectores (formato 24h)
function generateTimeOptions() {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour < 10 ? `0${hour}` : `${hour}`;
      const formattedMinute = minute === 0 ? '00' : `${minute}`;
      options.push(`${formattedHour}:${formattedMinute}`);
    }
  }
  return options;
}

export default ScheduleManager; 