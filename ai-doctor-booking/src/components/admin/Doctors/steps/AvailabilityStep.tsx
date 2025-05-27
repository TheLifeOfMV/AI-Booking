"use client";

import React, { useState } from 'react';
import { Doctor } from '@/types/doctor';

interface AvailabilityStepProps {
  formData: Doctor;
  errors: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleAvailabilityChange: (availableTimes: Doctor['availableTimes']) => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

/**
 * AvailabilityStep component
 * 
 * Third step in the doctor edit modal for availability settings and consultation details.
 */
const AvailabilityStep: React.FC<AvailabilityStepProps> = ({
  formData,
  errors,
  handleChange,
  handleAvailabilityChange,
}) => {
  // State for new time slot
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: 1,
    start: '09:00',
    end: '10:00',
  });

  // Handle adding a new time slot
  const handleAddTimeSlot = () => {
    const { dayOfWeek, start, end } = newSlot;
    
    // Check if valid times
    if (!start || !end || start >= end) {
      return;
    }

    // Clone current available times
    const updatedTimes = [...(formData.availableTimes || [])];
    
    // Find if day already exists
    const dayIndex = updatedTimes.findIndex(d => d.dayOfWeek === dayOfWeek);
    
    if (dayIndex >= 0) {
      // Add slot to existing day
      updatedTimes[dayIndex] = {
        ...updatedTimes[dayIndex],
        slots: [
          ...updatedTimes[dayIndex].slots,
          { start, end }
        ]
      };
    } else {
      // Add new day with slot
      updatedTimes.push({
        dayOfWeek,
        slots: [{ start, end }]
      });
    }
    
    // Sort by day of week
    updatedTimes.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    
    // Update parent component
    handleAvailabilityChange(updatedTimes);
    
    // Reset form
    setNewSlot({
      dayOfWeek: dayOfWeek,
      start: '09:00',
      end: '10:00',
    });
  };

  // Handle removing a time slot
  const handleRemoveTimeSlot = (dayIndex: number, slotIndex: number) => {
    const updatedTimes = [...(formData.availableTimes || [])];
    
    // Remove the slot
    updatedTimes[dayIndex].slots.splice(slotIndex, 1);
    
    // If no slots left for this day, remove the day
    if (updatedTimes[dayIndex].slots.length === 0) {
      updatedTimes.splice(dayIndex, 1);
    }
    
    // Update parent component
    handleAvailabilityChange(updatedTimes);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-dark-grey mb-4">Availability & Settings</h2>
        <p className="text-medium-grey mb-6">
          Configure the doctor's availability schedule and consultation settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="consultationFee" className="block text-sm font-medium text-dark-grey mb-1">
            Consultation Fee ($)*
          </label>
          <input
            id="consultationFee"
            name="consultationFee"
            type="number"
            min="0"
            step="5"
            value={formData.consultationFee}
            onChange={handleChange}
            className={`w-full p-3 border ${
              errors.consultationFee ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:ring-primary focus:border-primary transition-colors duration-200`}
            placeholder="100"
          />
          {errors.consultationFee && (
            <p className="mt-1 text-sm text-red-500">{errors.consultationFee}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-dark-grey mb-1">
            Primary Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            value={formData.location || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary transition-colors duration-200"
            placeholder="City Medical Center"
          />
        </div>
      </div>

      <div className="flex flex-col space-y-2 mt-4">
        <div className="flex items-center space-x-2">
          <input
            id="approvalStatus"
            name="approvalStatus"
            type="checkbox"
            checked={formData.approvalStatus}
            onChange={handleChange}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="approvalStatus" className="text-sm font-medium text-dark-grey">
            Approved for Booking (Visible to Patients)
          </label>
        </div>
        

      </div>

      <div className="border-t pt-6 mt-2">
        <h3 className="text-lg font-medium text-dark-grey mb-4">Availability Schedule</h3>
        
        {errors.availableTimes && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {errors.availableTimes}
          </div>
        )}
        
        {/* Display current availability */}
        <div className="mb-6">
          <h4 className="text-medium-grey mb-3 font-medium">Current Schedule</h4>
          
          {formData.availableTimes && formData.availableTimes.length > 0 ? (
            <div className="space-y-4">
              {formData.availableTimes.map((daySchedule, dayIndex) => (
                <div key={dayIndex} className="border border-gray-200 rounded-md p-4">
                  <div className="font-medium mb-2">
                    {DAYS_OF_WEEK.find(d => d.value === daySchedule.dayOfWeek)?.label}
                  </div>
                  <div className="space-y-2">
                    {daySchedule.slots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="flex items-center justify-between bg-light-grey p-2 px-3 rounded-md">
                        <div>
                          {slot.start} - {slot.end}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTimeSlot(dayIndex, slotIndex)}
                          className="text-medium-grey hover:text-red-500 transition-colors duration-200"
                          aria-label="Remove time slot"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-medium-grey bg-light-grey p-4 rounded-md text-center">
              No availability slots configured yet
            </div>
          )}
        </div>
        
        {/* Add new availability */}
        <div className="bg-light-grey p-4 rounded-md">
          <h4 className="text-medium-grey mb-4 font-medium">Add Availability</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="dayOfWeek" className="block text-sm font-medium text-dark-grey mb-1">
                Day
              </label>
              <select
                id="dayOfWeek"
                value={newSlot.dayOfWeek}
                onChange={(e) => setNewSlot({ ...newSlot, dayOfWeek: parseInt(e.target.value) })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-dark-grey mb-1">
                Start Time
              </label>
              <input
                id="startTime"
                type="time"
                value={newSlot.start}
                onChange={(e) => setNewSlot({ ...newSlot, start: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-dark-grey mb-1">
                End Time
              </label>
              <input
                id="endTime"
                type="time"
                value={newSlot.end}
                onChange={(e) => setNewSlot({ ...newSlot, end: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleAddTimeSlot}
            className="w-full p-3 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
              <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Add Time Slot
          </button>
        </div>
      </div>

      <div className="pt-4 border-t">
        <p className="text-sm text-medium-grey mb-2">
          * Required fields
        </p>
      </div>
    </div>
  );
};

export default AvailabilityStep; 