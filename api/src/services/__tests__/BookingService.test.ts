import { BookingService } from '../BookingService';
import sql, { transaction } from '../../db';

// Mock the database module
jest.mock('../../db', () => {
  const mockTransaction = jest.fn();
  
  return {
    __esModule: true,
    default: jest.fn(),
    transaction: mockTransaction,
    handleDatabaseError: jest.fn((error) => error),
  };
});

describe('BookingService', () => {
  let bookingService: BookingService;
  
  beforeEach(() => {
    bookingService = new BookingService();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    (transaction as jest.Mock).mockImplementation(async (callback) => {
      // Mock transaction object with tagged template literal capability
      const mockTx = jest.fn((strings: TemplateStringsArray, ...values: any[]) => {
        // Just return an array with a count of 0 for conflict checks by default
        return [{ count: 0 }];
      });
      
      // Add specific query mock for doctor locking
      mockTx.mockImplementationOnce(() => {
        return [{ id: 'doctor-123' }]; // Doctor exists
      });
      
      // Add specific mock for booking creation
      mockTx.mockImplementationOnce(() => {
        return [{
          id: 'booking-123',
          doctor_id: 'doctor-123',
          patient_id: 'patient-123',
          start_time: '2023-05-10T10:00:00Z',
          end_time: '2023-05-10T10:30:00Z',
          status: 'scheduled',
          created_at: '2023-05-01T00:00:00Z',
          updated_at: '2023-05-01T00:00:00Z',
        }];
      });
      
      return await callback(mockTx);
    });
  });
  
  describe('create', () => {
    it('should create a booking successfully when no conflicts exist', async () => {
      // Setup
      const request = {
        doctor_id: 'doctor-123',
        patient_id: 'patient-123',
        start_time: '2023-05-10T10:00:00Z',
        end_time: '2023-05-10T10:30:00Z',
      };
      
      // Execute
      const result = await bookingService.create(request);
      
      // Verify
      expect(result.success).toBe(true);
      expect(result.booking).toBeDefined();
      expect(result.booking?.id).toBe('booking-123');
      expect(transaction).toHaveBeenCalled();
    });
    
    it('should return an error when doctor is not found', async () => {
      // Setup
      const request = {
        doctor_id: 'nonexistent-doctor',
        patient_id: 'patient-123',
        start_time: '2023-05-10T10:00:00Z',
        end_time: '2023-05-10T10:30:00Z',
      };
      
      // Override the transaction mock for this test
      (transaction as jest.Mock).mockImplementationOnce(async (callback) => {
        const mockTx = jest.fn(() => {
          return []; // Empty result means doctor not found
        });
        
        return await callback(mockTx);
      });
      
      // Execute
      const result = await bookingService.create(request);
      
      // Verify
      expect(result.success).toBe(false);
      expect(result.error).toBe('Doctor not found');
    });
    
    it('should return an error when there is a time slot conflict', async () => {
      // Setup
      const request = {
        doctor_id: 'doctor-123',
        patient_id: 'patient-123',
        start_time: '2023-05-10T10:00:00Z',
        end_time: '2023-05-10T10:30:00Z',
      };
      
      // Override the transaction mock for this test
      (transaction as jest.Mock).mockImplementationOnce(async (callback) => {
        const mockTx = jest.fn((strings: TemplateStringsArray, ...values: any[]) => {
          // Default return for other queries
          return [];
        });
        
        // Mock for doctor lock
        mockTx.mockImplementationOnce(() => {
          return [{ id: 'doctor-123' }]; // Doctor exists
        });
        
        // Mock for conflict check
        mockTx.mockImplementationOnce(() => {
          return [{ count: 1 }]; // Conflict exists
        });
        
        return await callback(mockTx);
      });
      
      // Execute
      const result = await bookingService.create(request);
      
      // Verify
      expect(result.success).toBe(false);
      expect(result.error).toBe('Time slot is no longer available');
    });
    
    it('should handle database errors gracefully', async () => {
      // Setup
      const request = {
        doctor_id: 'doctor-123',
        patient_id: 'patient-123',
        start_time: '2023-05-10T10:00:00Z',
        end_time: '2023-05-10T10:30:00Z',
      };
      
      // Make the transaction throw an error
      (transaction as jest.Mock).mockRejectedValueOnce(new Error('Database connection error'));
      
      // Execute
      const result = await bookingService.create(request);
      
      // Verify
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create booking');
    });
  });
}); 