# AI Medical Booking API

API backend for the AI-powered medical booking platform. Built with Fastify and Supabase.

## Features

- Doctor availability tracking
- Smart appointment scheduling
- Conflict detection and prevention
- Blackout dates and holidays
- Transaction support for booking operations

## Tech Stack

- **Fastify**: Fast and low overhead web framework
- **TypeScript**: Type-safe JavaScript
- **Supabase**: PostgreSQL database, authentication, and realtime features
- **postgres.js**: Low-level PostgreSQL client
- **Zod**: Request validation
- **date-fns**: Date manipulation and timezone handling
- **Jest**: Testing framework

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository
2. Navigate to the API directory:
   ```
   cd api
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Set up environment variables:
   Create a `.env` file in the root of the API directory based on `.env.example`.

### Configuration

The main configuration is in `src/config/index.ts`. This includes:

- Server settings
- Authentication options
- Database connection
- Business rules

### Database Setup

The API uses Supabase for the database. The schema migrations are in the `migrations` directory.

```bash
# Apply initial schema
npm run migrate
```

### Running the API

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API Documentation

The API endpoints are documented using OpenAPI. You can access the documentation at `/docs` when the server is running.

### Main Endpoints

- `GET /api/slots`: Get available slots for a doctor
- `POST /api/bookings`: Create a new booking
- `GET /api/bookings/:id`: Get a booking by ID
- `PATCH /api/bookings/:id/status`: Update booking status

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Deployment

The API can be deployed to any Node.js hosting platform that supports ES modules.

## License

This project is licensed under the MIT License. 