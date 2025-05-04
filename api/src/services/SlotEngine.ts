import { TimeSlot, SlotRequest, AvailabilityRule, BlackoutDate, Appointment, Settings, Holiday } from '../types';
import sql, { queries } from '../db';
import { addDays, format, parse, isWithinInterval, isAfter, isBefore, addMinutes } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

/**
 * SlotEngine service for calculating available appointment slots
 * 
 * Responsible for:
 * - Finding available slots based on doctor availability
 * - Respecting blackout dates
 * - Accounting for existing appointments
 * - Applying business rules and settings
 */
export class SlotEngine {
  /**
   * Get available time slots for a doctor within a date range
   */
  async getAvailableSlots(request: SlotRequest): Promise<TimeSlot[]> {
    const { doctor_id, start_date, end_date } = request;
    
    try {
      // 1. Get all the data we need for slot calculation
      const [
        availabilityRules,
        blackoutDates,
        appointments,
        settings,
        holidays
      ] = await Promise.all([
        this.getDoctorAvailabilityRules(doctor_id),
        this.getBlackoutDates(doctor_id, start_date, end_date),
        this.getExistingAppointments(doctor_id, start_date, end_date),
        this.getSettings(),
        this.getHolidays(start_date, end_date)
      ]);
      
      // 2. Generate all potential slots based on availability rules
      const allSlots = this.generatePotentialSlots(
        availabilityRules,
        start_date,
        end_date,
        settings.slot_duration,
        settings.timezone
      );
      
      // 3. Filter out unavailable slots
      const availableSlots = this.filterAvailableSlots(
        allSlots,
        blackoutDates,
        appointments,
        holidays,
        settings
      );
      
      return availableSlots;
      
    } catch (error) {
      console.error('Error getting available slots:', error);
      throw new Error('Failed to retrieve available slots');
    }
  }
  
  /**
   * Get doctor's availability rules from the database
   */
  private async getDoctorAvailabilityRules(doctorId: string): Promise<AvailabilityRule[]> {
    return await queries.availability.getRules(doctorId) as AvailabilityRule[];
  }
  
  /**
   * Get blackout dates for a doctor in a specified date range
   */
  private async getBlackoutDates(
    doctorId: string, 
    startDate: string, 
    endDate: string
  ): Promise<BlackoutDate[]> {
    return await queries.availability.getBlackoutDates(doctorId, startDate, endDate) as BlackoutDate[];
  }
  
  /**
   * Get existing appointments for a doctor in a specified date range
   */
  private async getExistingAppointments(
    doctorId: string, 
    startDate: string, 
    endDate: string
  ): Promise<Appointment[]> {
    return await queries.appointments.getByDoctor(doctorId, startDate, endDate) as Appointment[];
  }
  
  /**
   * Get global settings from the database
   */
  private async getSettings(): Promise<Settings> {
    const settings = await queries.settings.get() as Settings[];
    return settings[0] || {
      id: 1,
      business_hours_start: '09:00:00',
      business_hours_end: '17:00:00',
      timezone: 'UTC',
      slot_duration: 30,
      min_booking_notice: 24,
      updated_at: new Date().toISOString()
    };
  }
  
  /**
   * Get holidays in a specific date range
   */
  private async getHolidays(startDate: string, endDate: string): Promise<Holiday[]> {
    return await queries.holidays.getInRange(startDate, endDate) as Holiday[];
  }
  
  /**
   * Generate potential time slots based on availability rules
   */
  private generatePotentialSlots(
    rules: AvailabilityRule[],
    startDate: string,
    endDate: string,
    defaultSlotDuration: number,
    timezone: string
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // For each day in the range
    for (let day = new Date(start); day <= end; addDays(day, 1)) {
      const dayOfWeek = day.getDay(); // 0-6, Sunday-Saturday
      
      // Find rules for this day of week
      const dayRules = rules.filter(rule => rule.day_of_week === dayOfWeek);
      
      if (dayRules.length === 0) continue; // No availability for this day
      
      // For each rule on this day
      for (const rule of dayRules) {
        const duration = rule.slot_duration_minutes || defaultSlotDuration;
        
        // Parse start and end times from rule
        const ruleStartTime = parse(rule.start_time, 'HH:mm:ss', new Date());
        const ruleEndTime = parse(rule.end_time, 'HH:mm:ss', new Date());
        
        // Set current day's date part but keep rule's time part
        const currentDate = format(day, 'yyyy-MM-dd');
        const startDateTime = parse(`${currentDate} ${rule.start_time}`, 'yyyy-MM-dd HH:mm:ss', new Date());
        const endDateTime = parse(`${currentDate} ${rule.end_time}`, 'yyyy-MM-dd HH:mm:ss', new Date());
        
        // Generate slots at regular intervals
        for (
          let slotStart = startDateTime;
          isBefore(slotStart, endDateTime);
          slotStart = addMinutes(slotStart, duration)
        ) {
          const slotEnd = addMinutes(slotStart, duration);
          
          // Don't add slots that extend beyond the rule's end time
          if (isAfter(slotEnd, endDateTime)) continue;
          
          // Convert to UTC for consistent storage
          const slotStartUtc = zonedTimeToUtc(slotStart, timezone);
          const slotEndUtc = zonedTimeToUtc(slotEnd, timezone);
          
          slots.push({
            start_time: slotStartUtc.toISOString(),
            end_time: slotEndUtc.toISOString(),
            available: true // Initially all slots are available
          });
        }
      }
    }
    
    return slots;
  }
  
  /**
   * Filter out unavailable slots
   */
  private filterAvailableSlots(
    allSlots: TimeSlot[],
    blackoutDates: BlackoutDate[],
    appointments: Appointment[],
    holidays: Holiday[],
    settings: Settings
  ): TimeSlot[] {
    const minBookingNoticeMs = settings.min_booking_notice * 60 * 60 * 1000; // Convert hours to ms
    const now = new Date();
    const minBookingTime = new Date(now.getTime() + minBookingNoticeMs);
    
    // Convert blackout dates to simple date strings for easier checking
    const blackoutDateStrings = blackoutDates.map(bd => bd.date.substring(0, 10));
    const holidayDateStrings = holidays.map(h => h.date.substring(0, 10));
    
    // Filter the slots
    return allSlots.filter(slot => {
      const slotStart = new Date(slot.start_time);
      const slotEnd = new Date(slot.end_time);
      const slotDate = slot.start_time.substring(0, 10); // YYYY-MM-DD part
      
      // Ensure minimum booking notice
      if (isBefore(slotStart, minBookingTime)) {
        return false;
      }
      
      // Check if slot is on a blackout date
      if (blackoutDateStrings.includes(slotDate)) {
        return false;
      }
      
      // Check if slot is on a holiday
      if (holidayDateStrings.includes(slotDate)) {
        return false;
      }
      
      // Check for conflicting appointments
      for (const appointment of appointments) {
        const appointmentStart = new Date(appointment.start_time);
        const appointmentEnd = new Date(appointment.end_time);
        
        // Check for overlap
        if (
          isWithinInterval(slotStart, { start: appointmentStart, end: appointmentEnd }) ||
          isWithinInterval(slotEnd, { start: appointmentStart, end: appointmentEnd }) ||
          (isBefore(slotStart, appointmentStart) && isAfter(slotEnd, appointmentEnd))
        ) {
          return false;
        }
      }
      
      return true;
    });
  }
} 