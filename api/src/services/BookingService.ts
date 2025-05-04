import { BookingCreateRequest, BookingResponse, Appointment } from '../types';
import sql, { queries, transaction, handleDatabaseError } from '../db';

/**
 * BookingService handles appointment booking operations
 * 
 * Responsible for:
 * - Creating new bookings with conflict detection
 * - Managing booking transactions
 * - Emitting booking events
 */
export class BookingService {
  /**
   * Create a new booking with conflict detection
   * 
   * Uses a transaction to:
   * 1. Lock the doctor row
   * 2. Check for conflicts
   * 3. Create the booking if no conflicts
   */
  async create(request: BookingCreateRequest): Promise<BookingResponse> {
    const { doctor_id, patient_id, start_time, end_time } = request;
    
    try {
      // Use a transaction for atomicity
      return await transaction(async (tx) => {
        // 1. Lock the doctor row (SELECT FOR UPDATE)
        const lockDoctor = tx`
          SELECT id FROM doctors 
          WHERE id = ${doctor_id} 
          FOR UPDATE
        `;
        
        const doctorRows = await lockDoctor;
        if (doctorRows.length === 0) {
          return { 
            success: false, 
            error: 'Doctor not found' 
          };
        }
        
        // 2. Check for conflicts
        const conflicts = await tx`
          SELECT COUNT(*) as count FROM appointments 
          WHERE doctor_id = ${doctor_id}
          AND status != 'cancelled'
          AND (
            (start_time <= ${start_time}::timestamptz AND end_time > ${start_time}::timestamptz) OR
            (start_time < ${end_time}::timestamptz AND end_time >= ${end_time}::timestamptz) OR
            (start_time >= ${start_time}::timestamptz AND end_time <= ${end_time}::timestamptz)
          )
        `;
        
        if (conflicts[0].count > 0) {
          return { 
            success: false, 
            error: 'Time slot is no longer available' 
          };
        }
        
        // 3. Create the booking
        const newBooking = await tx`
          INSERT INTO appointments (
            doctor_id, patient_id, start_time, end_time, 
            status, reason, notes
          ) VALUES (
            ${doctor_id}, ${patient_id},
            ${start_time}, ${end_time},
            'scheduled', ${request.reason || null}, ${request.notes || null}
          ) RETURNING *
        `;
        
        return { 
          success: true, 
          booking: newBooking[0] as Appointment 
        };
      });
      
    } catch (error) {
      console.error('Error creating booking:', error);
      return { 
        success: false, 
        error: 'Failed to create booking' 
      };
    }
  }
  
  /**
   * Emit booking events through Supabase Realtime
   * This would be implemented with Supabase client
   */
  private async emitBookingEvent(booking: Appointment): Promise<void> {
    try {
      // In a real implementation, this would use Supabase Realtime
      // to broadcast events to connected clients
      console.log('Booking event emitted:', booking.id);
    } catch (error) {
      console.error('Error emitting booking event:', error);
    }
  }
  
  /**
   * Get booking details by ID
   */
  async getById(id: string): Promise<Appointment | null> {
    try {
      const bookings = await sql`
        SELECT * FROM appointments WHERE id = ${id}
      `;
      
      return bookings.length > 0 ? bookings[0] as Appointment : null;
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }
  
  /**
   * Update booking status
   */
  async updateStatus(id: string, status: string): Promise<Appointment | null> {
    try {
      const bookings = await sql`
        UPDATE appointments 
        SET status = ${status}, updated_at = now() 
        WHERE id = ${id}
        RETURNING *
      `;
      
      const booking = bookings.length > 0 ? bookings[0] as Appointment : null;
      
      if (booking) {
        await this.emitBookingEvent(booking);
      }
      
      return booking;
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }
} 