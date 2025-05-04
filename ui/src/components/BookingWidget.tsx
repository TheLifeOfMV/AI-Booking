import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { SlotsApi, BookingsApi } from '@/utils/api';
import { useAuth } from '@/hooks/useAuth';

type TimeSlot = {
  start_time: string;
  end_time: string;
  available: boolean;
};

type BookingWidgetProps = {
  clinic_id?: string;
  doctor_id?: string;
};

export default function BookingWidget({ clinic_id, doctor_id = '' }: BookingWidgetProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Fetch available slots when date or doctor changes
  useEffect(() => {
    if (!doctor_id) return;
    
    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        // Format date as YYYY-MM-DD
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        
        // Get end date (same day for simplicity)
        const endDate = formattedDate;
        
        const response = await SlotsApi.getAvailableSlots(doctor_id, formattedDate, endDate);
        setSlots(response.data);
      } catch (err) {
        console.error('Error fetching slots:', err);
        setError('Could not load available time slots.');
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [doctor_id, selectedDate]);

  // Handle date selection
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  // Handle slot selection
  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  // Handle form submission
  const onSubmit = async (data: any) => {
    if (!selectedSlot || !user) {
      setError('Please select a time slot and ensure you are logged in.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const booking = {
        doctor_id,
        patient_id: user.id,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        reason: data.reason,
        notes: data.notes,
      };

      const response = await BookingsApi.createBooking(booking);
      
      if (response.success) {
        setSuccess(true);
        // Reset form
        setSelectedSlot(null);
      } else {
        setError('Failed to create booking. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating your booking.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="card">
        <h2>Booking Confirmed!</h2>
        <p>Your appointment has been successfully scheduled.</p>
        <p>Date: {format(selectedDate, 'MMMM dd, yyyy')}</p>
        <p>Time: {selectedSlot && format(new Date(selectedSlot.start_time), 'h:mm a')} - {selectedSlot && format(new Date(selectedSlot.end_time), 'h:mm a')}</p>
        <button className="btn" onClick={() => setSuccess(false)}>Book Another Appointment</button>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Book an Appointment</h2>
      
      {error && (
        <div className="bg-pink-100 text-error p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-5">
        <h3>1. Select a Date</h3>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const isSelected = selectedDate.toDateString() === date.toDateString();
            
            return (
              <button
                key={i}
                className={`p-2 rounded-md text-center ${isSelected ? 'bg-teal-300 text-white' : 'bg-gray-100'}`}
                onClick={() => handleDateChange(date)}
                type="button"
              >
                <div className="text-small">{format(date, 'EEE')}</div>
                <div className="font-bold">{format(date, 'd')}</div>
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="mb-5">
        <h3>2. Select a Time</h3>
        
        {loadingSlots ? (
          <div className="text-center py-4">Loading available times...</div>
        ) : slots.length === 0 ? (
          <div className="text-center py-4 text-gray-600">No available slots for this day.</div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {slots.map((slot, index) => (
              <button
                key={index}
                className={`p-2 rounded-md text-center ${
                  selectedSlot === slot
                    ? 'bg-teal-300 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => handleSlotSelect(slot)}
                disabled={!slot.available}
                type="button"
              >
                {format(new Date(slot.start_time), 'h:mm a')}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {selectedSlot && (
        <div className="mb-5">
          <h3>3. Your Information</h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block mb-2 text-small">Reason for Visit</label>
              <input
                {...register('reason', { required: 'Reason is required' })}
                className="input"
                placeholder="e.g., Annual checkup, Illness, etc."
              />
              {errors.reason && (
                <p className="text-error text-small mt-1">{errors.reason.message as string}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block mb-2 text-small">Additional Notes (optional)</label>
              <textarea
                {...register('notes')}
                className="input"
                rows={3}
                placeholder="Any additional information the doctor should know"
              />
            </div>
            
            <button
              type="submit"
              className="btn w-full"
              disabled={loading}
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
} 