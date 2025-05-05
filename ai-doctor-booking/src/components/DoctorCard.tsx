import React from 'react';
import Image from 'next/image';
import { Doctor, TimeSlot } from '../types/booking';
import { useBookingStore } from '../store/bookingStore';

interface DoctorCardProps {
  doctor: Doctor;
  isSelected: boolean;
  onSelect: (doctor: Doctor) => void;
  onSlotSelect: (slot: TimeSlot) => void;
  selectedSlotId?: string;
}

const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  isSelected,
  onSelect,
  onSlotSelect,
  selectedSlotId,
}) => {
  const handleCardClick = () => {
    onSelect(doctor);
  };

  const handleSlotClick = (slot: TimeSlot) => {
    onSlotSelect(slot);
  };

  return (
    <div 
      className={`p-4 bg-white rounded-xl shadow-sm transition-transform ${
        isSelected ? 'border-2 border-primary ring-2 ring-primary/20' : ''
      }`}
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-4 mb-3">
        <div className="w-12 h-12 rounded-full bg-light-grey overflow-hidden">
          {doctor.avatarUrl ? (
            <Image 
              src={doctor.avatarUrl} 
              alt={doctor.name} 
              width={48} 
              height={48} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-medium-grey">
              {doctor.name.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-dark-grey">{doctor.name}</h3>
          <div className="flex items-center text-sm text-medium-grey">
            <span className="text-yellow-400 mr-1">★</span> {doctor.rating}
          </div>
        </div>
      </div>
      <div className="text-sm text-medium-grey mb-3">{doctor.experience}</div>
      
      <div className="flex flex-wrap gap-2">
        {doctor.availableSlots.map((slot) => (
          <button
            key={slot.id}
            className={`py-2 px-3 rounded-lg text-sm font-medium ${
              selectedSlotId === slot.id 
                ? 'bg-primary text-white' 
                : 'bg-light-grey text-dark-grey'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              handleSlotClick(slot);
            }}
          >
            {slot.time}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DoctorCard; 