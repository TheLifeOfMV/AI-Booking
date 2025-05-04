import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SlotEngine } from '../services/SlotEngine';
import { SlotRequest } from '../types';
import { z } from 'zod';

// Request validation schema
const slotRequestSchema = z.object({
  doctor_id: z.string().uuid(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

export default async function (fastify: FastifyInstance) {
  const slotEngine = new SlotEngine();
  
  // Get available slots for a doctor
  fastify.get('/slots', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.query as SlotRequest;
      
      // Validate request
      const result = slotRequestSchema.safeParse(params);
      if (!result.success) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid request parameters',
          details: result.error.format()
        });
      }
      
      // Get slots from SlotEngine
      const slots = await slotEngine.getAvailableSlots(params);
      
      return reply.code(200).send({
        success: true,
        data: slots
      });
      
    } catch (error) {
      console.error('Error retrieving slots:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to retrieve slots'
      });
    }
  });
  
  // Route schema for OpenAPI documentation
  fastify.get('/slots', {
    schema: {
      querystring: {
        type: 'object',
        required: ['doctor_id', 'start_date', 'end_date'],
        properties: {
          doctor_id: { type: 'string', format: 'uuid' },
          start_date: { type: 'string', format: 'date' },
          end_date: { type: 'string', format: 'date' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  start_time: { type: 'string', format: 'date-time' },
                  end_time: { type: 'string', format: 'date-time' },
                  available: { type: 'boolean' }
                }
              }
            }
          }
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            details: { type: 'object' }
          }
        },
        500: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' }
          }
        }
      }
    }
  });
} 