import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import slotRoutes from './routes/slots';
import bookingRoutes from './routes/bookings';

// Initialize Fastify with logging
const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

// Register plugins
async function setupServer() {
  // CORS
  await server.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });
  
  // JWT authentication
  await server.register(jwt, {
    secret: process.env.JWT_SECRET || 'development-secret-do-not-use-in-production',
  });
  
  // Authentication hook
  server.addHook('onRequest', async (request, reply) => {
    try {
      // Skip auth for specific routes
      const publicRoutes = ['/health', '/slots'];
      if (publicRoutes.some(route => request.routeOptions.url?.includes(route))) {
        return;
      }
      
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
  
  // Register routes
  server.register(slotRoutes, { prefix: '/api' });
  server.register(bookingRoutes, { prefix: '/api' });
  
  // Health check route
  server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });
  
  // Error handler
  server.setErrorHandler((error, request, reply) => {
    server.log.error(error);
    
    reply.status(error.statusCode || 500).send({
      error: error.name,
      message: error.message,
      statusCode: error.statusCode || 500,
    });
  });
}

// Start server
async function start() {
  try {
    await setupServer();
    
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    const host = process.env.HOST || '0.0.0.0';
    
    await server.listen({ port, host });
    
    console.log(`Server running at http://${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

// Handle termination signals
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await server.close();
  process.exit(0);
});

// Start the server
start(); 