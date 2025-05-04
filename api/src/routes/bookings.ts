import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { BookingService } from '../services/BookingService';
import { BookingCreateRequest } from '../types';
import { z } from 'zod';

// Request validation schema
const bookingCreateSchema = z.object({
  doctor_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  reason: z.string().optional(),
  notes: z.string().optional()
}).refine(data => new Date(data.end_time) > new Date(data.start_time), {
  message: 'End time must be after start time',
  path: ['end_time']
});

export default async function (fastify: FastifyInstance) {
  const bookingService = new BookingService();
  
  // Create a new booking
  fastify.post('/bookings', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const bookingData = request.body as BookingCreateRequest;
      
      // Validate request
      const result = bookingCreateSchema.safeParse(bookingData);
      if (!result.success) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid booking data',
          details: result.error.format()
        });
      }
      
      // Create booking
      const bookingResult = await bookingService.create(bookingData);
      
      if (!bookingResult.success) {
        return reply.code(409).send(bookingResult); // Conflict
      }
      
      return reply.code(201).send(bookingResult);
      
    } catch (error) {
      console.error('Error creating booking:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to create booking'
      });
    }
  });
  
  // Get booking by ID
  fastify.get('/bookings/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      
      const booking = await bookingService.getById(id);
      
      if (!booking) {
        return reply.code(404).send({
          success: false,
          error: 'Booking not found'
        });
      }
      
      return reply.code(200).send({
        success: true,
        data: booking
      });
      
    } catch (error) {
      console.error('Error retrieving booking:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to retrieve booking'
      });
    }
  });
  
  // Update booking status
  fastify.patch('/bookings/:id/status', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { status } = request.body as { status: string };
      
      // Validate status
      if (!['scheduled', 'confirmed', 'cancelled', 'completed'].includes(status)) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid status value'
        });
      }
      
      const booking = await bookingService.updateStatus(id, status);
      
      if (!booking) {
        return reply.code(404).send({
          success: false,
          error: 'Booking not found'
        });
      }
      
      return reply.code(200).send({
        success: true,
        data: booking
      });
      
    } catch (error) {
      console.error('Error updating booking status:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to update booking status'
      });
    }
  });
  
  // Route schemas for OpenAPI documentation
  fastify.post('/bookings', {
    schema: {
      body: {
        type: 'object',
        required: ['doctor_id', 'patient_id', 'start_time', 'end_time'],
        properties: {
          doctor_id: { type: 'string', format: 'uuid' },
          patient_id: { type: 'string', format: 'uuid' },
          start_time: { type: 'string', format: 'date-time' },
          end_time: { type: 'string', format: 'date-time' },
          reason: { type: 'string' },
          notes: { type: 'string' }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            booking: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                doctor_id: { type: 'string', format: 'uuid' },
                patient_id: { type: 'string', format: 'uuid' },
                start_time: { type: 'string', format: 'date-time' },
                end_time: { type: 'string', format: 'date-time' },
                status: { type: 'string' },
                reason: { type: 'string' },
                notes: { type: 'string' },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' }
              }
            }
          }
        }
      }
    }
  });
} 