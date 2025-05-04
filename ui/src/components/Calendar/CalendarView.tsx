import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { BookingsApi } from '@/utils/api';
import { useAuth } from '@/hooks/useAuth';

// Setup localizer for react-big-calendar
const localizer = momentLocalizer(moment);

export default function CalendarView({ doctorId }: { doctorId: string }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Fetch bookings for the selected doctor
  useEffect(() => {
    const fetchBookings = async () => {
      if (!doctorId) return;
      
      setLoading(true);
      try {
        // For this example, we'll use the current month as the date range
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        const startDate = firstDayOfMonth.toISOString().split('T')[0];
        const endDate = lastDayOfMonth.toISOString().split('T')[0];
        
        // This is a simplified example. In a real app, you'd create a dedicated API endpoint for this
        const response = await BookingsApi.getBookingsByDateRange(doctorId, startDate, endDate);
        
        if (response.success) {
          // Convert bookings to events format for the calendar
          const events = response.data.map((booking: any) => ({
            id: booking.id,
            title: booking.patient_name || 'Appointment',
            start: new Date(booking.start_time),
            end: new Date(booking.end_time),
            resource: booking,
          }));
          
          setBookings(events);
        } else {
          setError('Could not load bookings');
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load calendar data');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [doctorId]);

  // Handle event selection
  const handleSelectEvent = (event: any) => {
    // You could show a modal with booking details here
    console.log('Selected event:', event);
  };

  if (loading) return <div className="flex items-center justify-center h-64">Loading calendar...</div>;
  
  if (error) return <div className="bg-pink-100 text-error p-4 rounded-lg">{error}</div>;

  return (
    <div className="card h-[700px]">
      <h2>Appointment Calendar</h2>
      
      <div className="flex-1 overflow-hidden">
        <Calendar
          localizer={localizer}
          events={bookings}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectEvent={handleSelectEvent}
          views={['month', 'week', 'day']}
          defaultView="week"
          // Customize the appearance
          eventPropGetter={(event) => {
            const backgroundColor = event.resource?.status === 'confirmed' 
              ? '#4DB6AC' // teal-300
              : event.resource?.status === 'cancelled'
                ? '#EF9A9A' // pink-400
                : '#B2DFDB'; // teal-100
                
            return { style: { backgroundColor } };
          }}
          dayPropGetter={(date) => {
            // Grey out past days
            const isBeforeToday = moment(date).isBefore(moment(), 'day');
            if (isBeforeToday) {
              return {
                style: {
                  backgroundColor: '#F5F5F5', // gray-100
                },
              };
            }
            return {};
          }}
        />
      </div>
    </div>
  );
} 