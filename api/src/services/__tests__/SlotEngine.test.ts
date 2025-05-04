import { SlotEngine } from '../SlotEngine';
import sql, { queries } from '../../db';

// Mock the database module
jest.mock('../../db', () => {
  const mockQueries = {
    availability: {
      getRules: jest.fn(),
      getBlackoutDates: jest.fn(),
    },
    appointments: {
      getByDoctor: jest.fn(),
    },
    settings: {
      get: jest.fn(),
    },
    holidays: {
      getInRange: jest.fn(),
    },
  };
  
  return {
    __esModule: true,
    default: jest.fn(),
    queries: mockQueries,
  };
});

describe('SlotEngine', () => {
  let slotEngine: SlotEngine;
  
  beforeEach(() => {
    slotEngine = new SlotEngine();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Default mock implementations
    (queries.availability.getRules as jest.Mock).mockResolvedValue([
      {
        id: '12345',
        doctor_id: 'doctor-123',
        day_of_week: 1, // Monday
        start_time: '09:00:00',
        end_time: '17:00:00',
        slot_duration_minutes: 30,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
    ]);
    
    (queries.availability.getBlackoutDates as jest.Mock).mockResolvedValue([]);
    (queries.appointments.getByDoctor as jest.Mock).mockResolvedValue([]);
    (queries.settings.get as jest.Mock).mockResolvedValue([
      {
        id: 1,
        business_hours_start: '09:00:00',
        business_hours_end: '17:00:00',
        timezone: 'UTC',
        slot_duration: 30,
        min_booking_notice: 24,
        updated_at: '2023-01-01T00:00:00Z',
      },
    ]);
    (queries.holidays.getInRange as jest.Mock).mockResolvedValue([]);
  });
  
  describe('getAvailableSlots', () => {
    it('should fetch all required data for slot calculation', async () => {
      // Setup
      const request = {
        doctor_id: 'doctor-123',
        start_date: '2023-05-01',
        end_date: '2023-05-07',
      };
      
      // Execute
      await slotEngine.getAvailableSlots(request);
      
      // Verify
      expect(queries.availability.getRules).toHaveBeenCalledWith('doctor-123');
      expect(queries.availability.getBlackoutDates).toHaveBeenCalledWith(
        'doctor-123',
        '2023-05-01',
        '2023-05-07'
      );
      expect(queries.appointments.getByDoctor).toHaveBeenCalledWith(
        'doctor-123',
        '2023-05-01',
        '2023-05-07'
      );
      expect(queries.settings.get).toHaveBeenCalled();
      expect(queries.holidays.getInRange).toHaveBeenCalledWith(
        '2023-05-01',
        '2023-05-07'
      );
    });
    
    it('should handle errors gracefully', async () => {
      // Setup
      const request = {
        doctor_id: 'doctor-123',
        start_date: '2023-05-01',
        end_date: '2023-05-07',
      };
      
      // Make one of the queries throw an error
      (queries.availability.getRules as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );
      
      // Execute & Verify
      await expect(slotEngine.getAvailableSlots(request)).rejects.toThrow(
        'Failed to retrieve available slots'
      );
    });
    
    // Add more test cases for specific scenarios
  });
}); 