MedAI Backend Architecture with Supabase MCP (Model Context Protocol) & Next.js
This architecture focuses on a robust, scalable, and secure backend to power all MedAI platform features for patients, doctors, and administrators.
1. Core Principles & Technology
Database & Authentication: Supabase (PostgreSQL, GoTrue for Auth, Storage for files).
API Layer: Next.js API Routes (TypeScript).
Realtime (Optional but good with Supabase): Supabase Realtime for live updates (e.g., new bookings, doctor availability changes).
External Services:
Twilio: For WhatsApp and AI-guided Voice interactions.
Payment Gateway (Future): Stripe, MercadoPago, etc.
Deployment: Vercel (for Next.js app including API routes) and Supabase Cloud.
2. File & Folder Structure (Backend Focused)
medai-app/
├── supabase/                    # Supabase project specific files (migrations, RLS policies)
│   ├── migrations/              # Database schema migrations (YYYYMMDDHHMMSS_description.sql)
│   │   ├── 0000_init_schema.sql
│   │   ├── 0001_rls_policies.sql
│   │   └── ...
│   ├── functions/               # Supabase Edge Functions (optional, for tasks needing proximity to DB)
│   │   └── some-critical-webhook/
│   │       └── index.ts
│   └── seed.sql                 # Initial seed data (specialties, admin user etc.)
│
├── src/
│   ├── app/
│   │   └── api/                 # NEXT.JS API ROUTES (THE API LAYER)
│   │       ├── admin/           # Admin-specific routes
│   │       │   ├── doctors/
│   │       │   │   ├── [id]/
│   │       │   │   │   ├── approval/route.ts    # PATCH - Toggle doctor approval
│   │       │   │   │   ├── credentials/route.ts # PATCH - Update credential status
│   │       │   │   │   └── route.ts             # GET (doctor by id), PUT (update doctor), DELETE
│   │       │   │   ├── route.ts                 # GET (list doctors), POST (create doctor)
│   │       │   │   └── specialties/route.ts     # GET, POST, PUT, DELETE admin specialties
│   │       │   ├── users/
│   │       │   │   ├── [id]/route.ts            # GET, PUT, DELETE user
│   │       │   │   └── route.ts                 # GET (list users)
│   │       │   ├── bookings/
│   │       │   │   ├── [id]/route.ts            # GET (booking details for admin)
│   │       │   │   └── route.ts                 # GET (list all bookings with filters)
│   │       │   ├── metrics/route.ts             # GET (platform metrics: bookings/day, doctor utilization)
│   │       │   └── impersonate/route.ts         # POST (start impersonation session for admin)
│   │       │
│   │       ├── auth/                            # Authentication routes
│   │       │   ├── login/route.ts               # POST (handles login via Supabase)
│   │       │   ├── signup/route.ts              # POST (handles signup via Supabase)
│   │       │   ├── logout/route.ts              # POST (handles logout via Supabase)
│   │       │   ├── me/route.ts                  # GET (get current authenticated user's profile)
│   │       │   └── password-reset/route.ts      # POST (initiate), PUT (confirm)
│   │       │
│   │       ├── patient/                         # Patient-specific routes
│   │       │   ├── bookings/
│   │       │   │   ├── [id]/route.ts            # GET (booking detail), PUT (cancel/reschedule)
│   │       │   │   └── route.ts                 # GET (patient's bookings), POST (create booking)
│   │       │   ├── profile/route.ts             # GET, PUT (patient profile)
│   │       │   └── insurance/route.ts           # GET, POST, PUT (patient insurance details)
│   │       │
│   │       ├── doctor/                          # Doctor-specific routes
│   │       │   ├── profile/route.ts             # GET, PUT (doctor profile, includes credentials upload URLs)
│   │       │   ├── schedule/route.ts            # GET, PUT (doctor schedule/availability)
│   │       │   ├── bookings/route.ts            # GET (doctor's bookings for dashboard)
│   │       │   ├── dashboard-kpis/route.ts      # GET (KPIs like daily bookings, slot utilization)
│   │       │   └── subscription/route.ts        # GET (current sub), POST (change sub)
│   │       │
│   │       ├── public/                          # Publicly accessible data (e.g., for booking flow before login)
│   │       │   ├── specialties/route.ts         # GET (list all active specialties)
│   │       │   ├── doctors/route.ts             # GET (search active/approved doctors by specialty, date)
│   │       │   └── slots/route.ts               # GET (available slots for a doctor on a date)
│   │       │
│   │       └── webhook/                         # Webhooks from external services
│   │           ├── twilio/
│   │           │   ├── whatsapp/route.ts        # POST (receives WhatsApp messages from Twilio)
│   │           │   └── voice/route.ts           # POST (receives voice call events from Twilio)
│   │           └── payment/                     # Example for future payment gateway
│   │               └── stripe/route.ts          # POST (receives events from Stripe)
│   │
│   ├── lib/                               # Shared libraries/utilities for backend
│   │   ├── supabaseClient.ts            # Initializes and exports Supabase client instance for server-side use
│   │   ├── authMiddleware.ts            # Middleware for API routes to protect and get user session
│   │   ├── errorHandler.ts              # Centralized error handling for API routes
│   │   ├── validationSchemas.ts         # Zod schemas for validating API request bodies/params
│   │   └── rateLimiter.ts               # Utility for rate limiting API requests
│   │
│   ├── services/                          # BACKEND BUSINESS LOGIC SERVICES
│   │   ├── bookingService.server.ts       # Handles booking creation, management, conflicts
│   │   ├── doctorService.server.ts        # Manages doctor profiles, verification, schedules
│   │   ├── patientService.server.ts       # Manages patient profiles
│   │   ├── notificationService.server.ts  # Sends email/SMS/WhatsApp reminders (using Twilio SDK)
│   │   ├── nlpService.server.ts           # Processes natural language requests from WhatsApp/Voice
│   │   ├── subscriptionService.server.ts  # Manages doctor subscriptions & payments
│   │   ├── adminService.server.ts         # Admin-specific operations (verification, impersonation)
│   │   └── storageService.server.ts       # Handles file uploads to Supabase Storage (credentials)
│   │
│   ├── types/                             # Shared TypeScript types (can be same as frontend if monorepo)
│   │   ├── index.ts                     # Barrel file
│   │   ├── auth.ts
│   │   ├── booking.ts
│   │   ├── doctor.ts
│   │   ├── patient.ts
│   │   ├── admin.ts
│   │   └── user.ts
│   │
│   └── config/                            # Backend configuration
│       └── index.ts                     # Environment variables, service keys (server-side)
│
├── public/                            # Frontend public assets (images, etc.)
├── ...                                # Other Next.js frontend files (components, pages, store etc.)
└── package.json
Use code with caution.
Markdown
3. Component Descriptions & Responsibilities
supabase/
What it does: Contains all Supabase-specific configurations.
migrations/: SQL files defining database schema, tables, relationships, indexes, and Row Level Security (RLS) policies. This is the source of truth for the database structure.
functions/: (Optional) TypeScript/JavaScript Supabase Edge Functions. These can be used for performance-critical operations, direct database interactions, or tasks that benefit from being geographically close to the database (e.g., processing Twilio webhooks if direct DB writes are frequent).
seed.sql: SQL script to populate the database with initial/default data (e.g., list of medical specialties, an initial admin user).
State: This directory and its execution via Supabase CLI define and manage the primary persistent state (database structure and data).
Connections: Migrations are applied to the Supabase database. Edge Functions (if used) interact directly with the Supabase DB and can be invoked via HTTP.
src/app/api/ (Next.js API Routes)
What it does: This is the main API layer of the backend. Each file/folder under api/ corresponds to an HTTP endpoint.
Handles incoming HTTP requests from the frontend, mobile app, WhatsApp/Voice channels (via Twilio webhooks), and potentially third-party integrations.
Uses authMiddleware to authenticate requests and authorize based on user roles.
Validates request data using schemas from src/lib/validationSchemas.ts.
Delegates business logic to the appropriate backend services in src/services/.
Formats and returns JSON responses.
State: Primarily request-scoped. It fetches and manipulates persistent state via services.
Connections:
Receives HTTP requests from clients.
Uses src/lib/authMiddleware.ts for security.
Calls functions/methods in src/services/*.server.ts.
Uses src/lib/errorHandler.ts for consistent error responses.
src/lib/ (Backend Libraries/Utilities)
supabaseClient.ts:
What it does: Initializes and exports a singleton instance of the Supabase JavaScript client configured for server-side use (using service role key or appropriate environment variables).
Connections: Used by backend services and API routes to interact with the Supabase database, auth, and storage.
authMiddleware.ts:
What it does: A Next.js API middleware (or a higher-order function for route handlers) that inspects incoming requests for a Supabase JWT (typically in the Authorization header). It verifies the token with Supabase Auth and attaches the authenticated user object (and their roles) to the request, or rejects unauthenticated/unauthorized requests.
Connections: Used by most API routes to protect endpoints. Interacts with Supabase Auth for token verification.
errorHandler.ts:
What it does: Provides a standardized way to handle errors within API routes, ensuring consistent JSON error responses with appropriate HTTP status codes.
Connections: Used by API route handlers.
validationSchemas.ts:
What it does: Contains schemas (e.g., using Zod) for validating the structure and types of incoming request bodies and query parameters.
Connections: Used by API route handlers for input validation.
rateLimiter.ts:
What it does: Implements rate limiting logic for API endpoints to prevent abuse (e.g., using an in-memory store for simple cases or Redis/Supabase table for distributed environments).
Connections: Used by API route handlers, potentially as middleware.
src/services/ (Backend Business Logic Services - *.server.ts)
What it does: This layer encapsulates the core business logic of the application, ensuring separation of concerns from the API routing layer. Files are suffixed with .server.ts to clearly distinguish them from any frontend services.
bookingService.server.ts: Logic for creating, fetching, updating (cancel/reschedule), checking slot availability, handling insurance details related to bookings.
doctorService.server.ts: Manages doctor profiles, registration process (excluding auth which is Supabase), credential submission links, verification status updates, schedule management.
patientService.server.ts: Manages patient profiles, fetching related data.
notificationService.server.ts: Sends appointment reminders, confirmations, etc., via WhatsApp (Twilio), email (Supabase Auth or other provider), or SMS.
nlpService.server.ts: Processes text from WhatsApp/Voice, extracts intent (e.g., book appointment, find doctor), and entities (specialty, date, time).
subscriptionService.server.ts: Manages doctor subscription tiers, payments (integrating with a payment gateway in the future), and feature access based on subscription.
adminService.server.ts: Handles admin-specific logic like doctor verification, user management actions, platform metrics aggregation, impersonation logic.
storageService.server.ts: Manages uploads (e.g., doctor credentials) to Supabase Storage, generating signed URLs if needed.
State: These services are generally stateless but operate on data fetched from and persisted to Supabase.
Connections:
Called by API route handlers in src/app/api/.
Use the supabaseClient from src/lib/ for all database and Supabase Storage interactions.
May call other services (e.g., BookingService might use NotificationService).
NotificationService interacts with Twilio SDK.
SubscriptionService would interact with a Payment Gateway SDK.
src/types/
What it does: Defines shared TypeScript interfaces and types for data structures (User, Doctor, Booking, Specialty, etc.) used across the backend. This ensures type safety and consistency.
Connections: Imported by API routes, services, and potentially database interaction logic.
src/config/
What it does: Centralizes access to environment variables and backend configurations (e.g., Supabase URL, Supabase Service Role Key, Twilio credentials, API keys for other services).
Connections: Imported by modules that require configuration, such as supabaseClient.ts or service modules interacting with external APIs.
4. State Management and Service Connections
Persistent State:
Primary Database: Supabase (PostgreSQL) stores all core application data (users, doctors, bookings, schedules, etc.).
File Storage: Supabase Storage for doctor credentials, profile pictures, and other static assets.
Authentication State:
Managed by Supabase GoTrue. JWTs are issued upon login/signup.
Frontend clients store the JWT and send it with API requests.
Backend API routes (src/app/api/) use authMiddleware.ts to validate JWTs and identify the user.
Data Flow & Service Interactions:
Client (Frontend/Mobile/Twilio) -> Next.js API Route:
HTTP request is made to an endpoint in src/app/api/.
API Route Processing:
authMiddleware.ts verifies JWT, extracts user info and roles.
Request body/params are validated using schemas from validationSchemas.ts.
The route handler calls the appropriate backend service function from src/services/*.server.ts, passing validated data.
Backend Service Logic:
The service function executes business logic.
It uses supabaseClient.ts to query or mutate data in the Supabase database.
For file operations, it uses storageService.server.ts which internally uses supabaseClient for Supabase Storage.
For notifications, it might call notificationService.server.ts (which uses Twilio SDK).
For NLP, it calls nlpService.server.ts.
API Route Response:
The service function returns data or a status to the API route handler.
The API route handler formats a JSON response and sends it back to the client.
errorHandler.ts ensures consistent error responses.
Webhook Handling (e.g., Twilio):
Twilio sends an HTTP POST request to a designated webhook endpoint (e.g., /api/webhook/twilio/whatsapp/route.ts).
The webhook handler in Next.js API Routes receives the payload.
It may call nlpService.server.ts to understand the user's intent.
Based on the intent, it interacts with bookingService.server.ts or doctorService.server.ts.
It may use notificationService.server.ts (Twilio SDK) to send a response back to the user via WhatsApp/Voice.
5. Database Schema (Supabase - Key Tables)
auth.users (Built-in by Supabase): Stores user credentials and basic auth info. id is UUID.
profiles:
user_id (UUID, PK, FK to auth.users.id ON DELETE CASCADE)
full_name (TEXT)
phone_number (TEXT, unique)
avatar_url (TEXT, nullable)
role (ENUM: patient, doctor, admin, default patient)
created_at (TIMESTAMPTZ, default now())
updated_at (TIMESTAMPTZ, default now())
specialties:
id (SERIAL, PK)
name (TEXT, unique, not null)
icon_url (TEXT, nullable)
description (TEXT, nullable)
doctors:
user_id (UUID, PK, FK to profiles.user_id ON DELETE CASCADE)
specialty_id (INT, FK to specialties.id)
experience_years (INT)
bio (TEXT, nullable)
consultation_fee (DECIMAL, nullable)
office_location_address (TEXT, nullable)
office_location_city (TEXT, nullable)
license_number (TEXT, nullable)
credential_status (ENUM: pending, verified, rejected, default pending)
approval_status (BOOLEAN, default false)
is_accepting_new_patients (BOOLEAN, default true)
doctor_credentials:
id (SERIAL, PK)
doctor_user_id (UUID, FK to doctors.user_id ON DELETE CASCADE)
document_type (TEXT)
file_name (TEXT)
storage_path (TEXT) // Path in Supabase Storage
uploaded_at (TIMESTAMPTZ, default now())
doctor_schedules: (Defines recurring availability)
id (SERIAL, PK)
doctor_user_id (UUID, FK to doctors.user_id ON DELETE CASCADE)
day_of_week (INT, 0 for Sunday, 6 for Saturday)
start_time (TIME)
end_time (TIME)
is_available (BOOLEAN, default true)
UNIQUE (doctor_user_id, day_of_week, start_time)
doctor_availability_overrides: (For specific date exceptions/additions)
id (SERIAL, PK)
doctor_user_id (UUID, FK to doctors.user_id ON DELETE CASCADE)
date (DATE)
start_time (TIME, nullable)
end_time (TIME, nullable)
is_unavailable_all_day (BOOLEAN, default false)
reason (TEXT, nullable)
UNIQUE (doctor_user_id, date, start_time)
insurance_providers:
id (SERIAL, PK)
name (TEXT, unique, not null)
patient_insurance:
patient_user_id (UUID, PK, FK to profiles.user_id ON DELETE CASCADE)
insurance_provider_id (INT, PK, FK to insurance_providers.id)
policy_number (TEXT)
details (JSONB, nullable)
bookings:
id (SERIAL, PK)
patient_user_id (UUID, FK to profiles.user_id)
doctor_user_id (UUID, FK to doctors.user_id)
specialty_id (INT, FK to specialties.id)
appointment_time (TIMESTAMPTZ)
duration_minutes (INT, default 30)
status (ENUM: pending_confirmation, confirmed, cancelled_by_patient, cancelled_by_doctor, completed, no_show, default pending_confirmation)
channel (ENUM: app, whatsapp, phone, admin)
insurance_provider_id (INT, FK to insurance_providers.id, nullable)
notes (TEXT, nullable)
created_at (TIMESTAMPTZ, default now())
updated_at (TIMESTAMPTZ, default now())
subscription_plans:
id (TEXT, PK, e.g., basic, premium, enterprise)
name (TEXT, not null)
monthly_fee_cop (INT, not null)
yearly_fee_cop (INT, not null)
features (JSONB)
doctor_subscriptions:
id (SERIAL, PK)
doctor_user_id (UUID, FK to doctors.user_id ON DELETE CASCADE, unique)
plan_id (TEXT, FK to subscription_plans.id)
status (ENUM: active, past_due, cancelled, trialing)
current_period_start (TIMESTAMPTZ)
current_period_end (TIMESTAMPTZ)
payment_gateway_subscription_id (TEXT, nullable)
RLS policies will be crucial:
Patients can only see/manage their own profile and bookings.
Doctors can only see/manage their own profile, schedule, and bookings assigned to them.
Admins have broader access (but still with audit trails).
6. Security Considerations
Authentication: Handled by Supabase Auth (robust and secure).
Authorization:
Row Level Security (RLS) in Supabase is the primary mechanism for data access control.
API route middleware (authMiddleware.ts) will check roles for endpoint access before hitting business logic.
Input Validation: Zod schemas in src/lib/validationSchemas.ts for all API inputs.
Rate Limiting: Implemented in src/lib/rateLimiter.ts and applied in API routes.
Secure File Uploads: Supabase Storage handles this well, use appropriate bucket policies.
Secrets Management: Use environment variables (e.g., .env.local for development, Vercel environment variables for production).
Webhook Security: Verify signatures for webhooks (e.g., Twilio request validation).
This architecture provides a solid foundation for MedAI, clearly separating concerns and leveraging Supabase's BaaS capabilities effectively within a Next.js environment. The transition to FastAPI for the API layer in the future would primarily involve rewriting the src/app/api/ handlers and potentially restructuring src/services/ if a different ORM or data access pattern is chosen, but the core database schema and business logic concepts would remain largely transferable.```markdown
MedAI Backend Architecture
1. Overview
This document outlines the backend architecture for MedAI, a multi-channel healthcare booking and management platform. The backend is designed to support patients, doctors, and administrators, leveraging Supabase for database and authentication, and Next.js API Routes for the API layer.
Core Technologies:
Database & Authentication: Supabase (PostgreSQL, Supabase Auth, Supabase Storage)
API Layer: Next.js API Routes
External Integrations: Twilio (for WhatsApp & Voice AI)
Deployment: Vercel (for Next.js app & API routes), Supabase Cloud.
2. Directory Structure (Backend Focused)
medai-app/
├── supabase/                    # Supabase project specific files
│   ├── migrations/              # Database schema migrations (SQL files)
│   │   ├── 0000_initial_schema.sql
│   │   ├── 0001_roles_and_profiles.sql
│   │   ├── 0002_doctors_and_specialties.sql
│   │   ├── 0003_schedules_and_bookings.sql
│   │   ├── 0004_subscriptions.sql
│   │   └── RLS_POLICIES.sql     # Contains all RLS policies
│   ├── functions/               # Optional: Supabase Edge Functions (e.g., for Twilio webhook processing)
│   │   └── twilio-webhook-handler/
│   │       └── index.ts
│   └── seed.sql                 # Initial data for specialties, admin user, etc.
│
├── src/
│   ├── app/
│   │   └── api/                 # NEXT.JS API ROUTES (API Layer)
│   │       ├── admin/           # Admin-only endpoints
│   │       │   ├── doctors/
│   │       │   │   ├── [id]/
│   │       │   │   │   ├── approval/route.ts    # PATCH: Toggle doctor approval
│   │       │   │   │   ├── credentials/route.ts # PATCH: Update credential status
│   │       │   │   │   └── route.ts             # GET, PUT, DELETE doctor by ID
│   │       │   │   ├── route.ts                 # GET doctors, POST new doctor
│   │       │   │   └── specialties/route.ts     # CRUD for specialties by admin
│   │       │   ├── users/
│   │       │   │   ├── [id]/route.ts            # GET, PUT user by ID
│   │       │   │   └── route.ts                 # GET all users
│   │       │   ├── bookings/route.ts            # GET all bookings (admin view)
│   │       │   └── metrics/route.ts             # GET platform metrics
│   │       │
│   │       ├── auth/                            # Authentication
│   │       │   ├── login/route.ts
│   │       │   ├── signup/route.ts
│   │       │   ├── logout/route.ts
│   │       │   └── me/route.ts                  # GET current user profile
│   │       │
│   │       ├── patient/                         # Patient-specific actions
│   │       │   ├── bookings/
│   │       │   │   ├── [id]/route.ts            # GET, PUT (cancel/reschedule) patient booking
│   │       │   │   └── route.ts                 # GET patient's bookings, POST new booking
│   │       │   └── profile/route.ts             # GET, PUT patient profile
│   │       │
│   │       ├── doctor/                          # Doctor-specific actions
│   │       │   ├── profile/route.ts             # GET, PUT doctor profile
│   │       │   ├── schedule/route.ts            # GET, PUT doctor schedule
│   │       │   ├── bookings/route.ts            # GET doctor's bookings
│   │       │   └── subscription/route.ts        # GET, POST doctor subscription
│   │       │
│   │       ├── public/                          # Publicly accessible data
│   │       │   ├── specialties/route.ts         # GET active specialties
│   │       │   ├── doctors/route.ts             # GET (search) active doctors
│   │       │   └── slots/route.ts               # GET available slots
│   │       │
│   │       └── webhook/                         # External service webhooks
│   │           ├── twilio-whatsapp/route.ts
│   │           └── twilio-voice/route.ts
│   │
│   ├── lib/                               # Shared server-side libraries/utilities
│   │   ├── supabaseClient.ts            # Supabase client instance (server-side)
│   │   ├── authMiddleware.ts            # API route middleware for auth & role checks
│   │   ├── errorHandler.ts              # Standardized API error handling
│   │   └── validationSchemas.ts         # Zod/Yup schemas for API input validation
│   │
│   ├── services/                          # Backend Business Logic Services (server-side)
│   │   ├── bookingService.server.ts
│   │   ├── doctorService.server.ts
│   │   ├── patientService.server.ts
│   │   ├── notificationService.server.ts  # Integrates with Twilio SDK
│   │   ├── nlpService.server.ts
│   │   ├── subscriptionService.server.ts
│   │   ├── adminService.server.ts
│   │   └── storageService.server.ts       # For Supabase Storage interactions
│   │
│   ├── types/                             # Shared TypeScript types
│   │   └── ...                            # (auth.ts, booking.ts, doctor.ts, etc.)
│   │
│   └── config/                            # Backend configuration
│       └── server.ts                    # Server-side environment variables & constants
│
├── ... (other frontend files)
└── package.json
Use code with caution.
3. Component Descriptions
3.1. supabase/ Directory
What it does: Manages the Supabase project's database schema, Row Level Security (RLS) policies, and optional Edge Functions.
migrations/: Contains SQL files for database schema evolution. Each file represents a migration step. RLS_POLICIES.sql will define security rules for data access.
functions/: (Optional) If used, these are serverless functions deployed to Supabase for tasks like complex database triggers or direct webhook processing that benefits from proximity to the database.
seed.sql: Populates the database with initial data (e.g., predefined medical specialties, roles, an initial admin account).
State: Defines and manages the persistent state of the application (database schema and initial data).
Connections: Interacts directly with the Supabase PostgreSQL database. Migrations are applied via Supabase CLI.
3.2. src/app/api/ - Next.js API Routes
What it does: Forms the primary API layer. Each file/folder structure maps to an HTTP endpoint (e.g., /api/patient/bookings).
Handles incoming HTTP requests from all clients (web app, mobile app, Twilio webhooks).
Uses authMiddleware.ts to authenticate and authorize requests.
Validates request payloads using schemas from src/lib/validationSchemas.ts.
Delegates business logic to appropriate services in src/services/.
Formats and returns JSON responses, utilizing errorHandler.ts for consistent error handling.
State: Manages request-scoped state. Interacts with persistent state via the service layer.
Connections: Receives HTTP requests. Uses authMiddleware (which interacts with Supabase Auth). Calls backend services.
3.3. src/lib/ - Shared Server-Side Libraries
supabaseClient.ts: Initializes and exports a Supabase client instance for server-side operations (using service role key for admin tasks or user-scoped client for user-specific operations).
authMiddleware.ts: A Next.js API middleware that:
Extracts the JWT from the Authorization header.
Verifies the JWT using Supabase Auth.
Retrieves user details and roles.
Attaches user information to the request object.
Performs role-based access control for the endpoint.
Rejects unauthenticated or unauthorized requests.
errorHandler.ts: A utility function to standardize error responses from API routes, sending appropriate HTTP status codes and JSON error messages.
validationSchemas.ts: Contains validation schemas (e.g., using Zod) for request bodies and parameters, ensuring data integrity.
Connections: These utilities are imported and used by API route handlers and potentially by backend services.
3.4. src/services/ - Backend Business Logic Services
What it does: Encapsulates the core business logic, keeping it separate from the API routing and data access layers. Named with *.server.ts to distinguish from potential frontend services.
bookingService.server.ts: Handles logic related to appointment creation, validation of slots, conflict resolution, fetching booking details, cancellation, and rescheduling. Interacts with doctorService for availability and patientService for patient data.
doctorService.server.ts: Manages doctor profiles, registration data processing (excluding authentication itself), credential status updates, schedule definition, and fetching doctor-specific information.
patientService.server.ts: Manages patient profiles and related data.
notificationService.server.ts: Responsible for sending notifications (appointment reminders, confirmations) via various channels. Integrates with Twilio SDK for WhatsApp/SMS.
nlpService.server.ts: Processes natural language input from WhatsApp/Voice channels, extracts intent and entities for booking or information retrieval.
subscriptionService.server.ts: Manages doctor subscription plans, handles payment events (future), and checks feature access based on subscription levels.
adminService.server.ts: Contains logic for administrative tasks like doctor verification, user management (ban/unban, role changes), platform metric aggregation, and managing impersonation sessions.
storageService.server.ts: Handles uploads of files like doctor credentials to Supabase Storage, manages access permissions, and generates secure download URLs if needed.
State: Generally stateless; they operate on data retrieved from and persisted to Supabase via supabaseClient.ts.
Connections: Called by API route handlers. Use supabaseClient for database interactions. Can call other services (e.g., bookingService might call notificationService).
3.5. src/types/ - Shared TypeScript Types
What it does: Defines data structures (interfaces, types) for entities like User, Doctor, Patient, Booking, Specialty, SubscriptionPlan, etc. This ensures type safety and consistency across the backend.
Connections: Imported by API routes, services, and any module handling these data structures.
3.6. src/config/ - Backend Configuration
What it does: Manages server-side configurations, primarily through environment variables (e.g., Supabase URL, Supabase Service Role Key, Twilio Account SID/Auth Token, API keys for other services).
Connections: Read by modules that need to initialize clients or access secure credentials (e.g., supabaseClient.ts, notificationService.server.ts).
4. State Management and Service Connections Summary
Persistent State:
Database: Supabase (PostgreSQL) is the single source of truth for all application data (users, doctors, appointments, schedules, specialties, subscriptions, insurance details, etc.).
File Storage: Supabase Storage is used for doctor credentials, profile pictures, and any other binary large objects.
Authentication State:
Managed by Supabase Auth. JWTs are issued upon successful login/signup.
Client applications (web, mobile) are responsible for storing and sending the JWT with each authenticated API request.
The backend's authMiddleware.ts validates these JWTs.
Data Flow Example (Patient Booking):
Client Request: Patient app sends a POST request to /api/patient/bookings/route.ts with booking details.
API Route (bookings/route.ts):
authMiddleware verifies the patient's JWT and role.
Request payload is validated using Zod schemas.
Calls bookingService.server.ts -> createBooking(patientId, bookingDetails).
Service Layer (bookingService.server.ts):
Checks doctor's availability for the requested slot (queries doctor_schedules and doctor_availability_overrides via supabaseClient).
Validates insurance details if provided.
Creates a new booking record in the bookings table via supabaseClient.
Potentially calls notificationService.server.ts to send a confirmation.
Returns the created booking object or success status.
API Route Response: The API route handler sends a JSON response (e.g., the created booking or a success message) back to the patient app.
Webhook Flow (Twilio WhatsApp):
Twilio receives a WhatsApp message from a user and forwards it via HTTP POST to /api/webhook/twilio-whatsapp/route.ts.
The webhook handler verifies the Twilio signature.
Payload (message content, sender ID) is passed to nlpService.server.ts.
nlpService.server.ts processes the text, identifies intent (e.g., "book appointment for cardiology tomorrow afternoon").
Based on intent, the handler might call doctorService.server.ts to find doctors or bookingService.server.ts to check availability.
notificationService.server.ts (using Twilio SDK) sends a response back to the user via WhatsApp.
5. Database Schema (Key Supabase Tables & RLS Considerations)
Core Tables:
auth.users (Supabase Built-in)
Stores user authentication data. id is UUID.
profiles
user_id (UUID, PK, FK to auth.users.id, ON DELETE CASCADE)
full_name (TEXT, NOT NULL)
phone_number (TEXT, UNIQUE)
avatar_url (TEXT)
role (ENUM: patient, doctor, admin, DEFAULT 'patient', NOT NULL)
created_at (TIMESTAMPTZ, DEFAULT now())
updated_at (TIMESTAMPTZ, DEFAULT now())
RLS: Users can read/update their own profile. Admins can manage all.
specialties
id (SERIAL, PK)
name (TEXT, UNIQUE, NOT NULL)
icon_url (TEXT)
description (TEXT)
RLS: Public read access. Admins can CRUD.
doctors
user_id (UUID, PK, FK to profiles.user_id ON DELETE CASCADE)
specialty_id (INT, FK to specialties.id, NOT NULL)
experience_years (INT, NOT NULL)
bio (TEXT)
consultation_fee (NUMERIC(10, 2))
office_address (TEXT)
license_number (TEXT, NOT NULL)
credential_status (ENUM: pending_review, verified, rejected, DEFAULT 'pending_review', NOT NULL)
approval_status (BOOLEAN, DEFAULT false, NOT NULL) -- Admin controlled
is_accepting_new_patients (BOOLEAN, DEFAULT true)
RLS: Doctors can read/update their own data. Public read for approved doctors. Admins can manage all.
doctor_credentials
id (SERIAL, PK)
doctor_user_id (UUID, FK to doctors.user_id ON DELETE CASCADE, NOT NULL)
file_name (TEXT, NOT NULL)
storage_path (TEXT, NOT NULL) -- Path in Supabase Storage
uploaded_at (TIMESTAMPTZ, DEFAULT now())
verified_by_admin_id (UUID, FK to profiles.user_id, NULLABLE)
verification_notes (TEXT, NULLABLE)
RLS: Doctors can manage their own. Admins can read all and update verification fields.
schedules (Stores default weekly availability)
id (SERIAL, PK)
doctor_user_id (UUID, FK to doctors.user_id ON DELETE CASCADE, NOT NULL)
day_of_week (INT, NOT NULL, 0=Sunday, 6=Saturday, CHECK day_of_week BETWEEN 0 AND 6)
start_time (TIME, NOT NULL)
end_time (TIME, NOT NULL)
is_available (BOOLEAN, DEFAULT true)
UNIQUE (doctor_user_id, day_of_week, start_time)
RLS: Doctors can manage their own. Public/Patients can read.
availability_overrides (For specific date exceptions or one-off availability)
id (SERIAL, PK)
doctor_user_id (UUID, FK to doctors.user_id ON DELETE CASCADE, NOT NULL)
override_date (DATE, NOT NULL)
start_time (TIME) -- Nullable if blocking the whole day
end_time (TIME) -- Nullable if blocking the whole day
is_unavailable (BOOLEAN, DEFAULT false) -- True if blocking time, false if adding extra time
reason (TEXT)
UNIQUE (doctor_user_id, override_date, start_time)
RLS: Doctors can manage their own. Public/Patients can read.
insurance_providers
id (SERIAL, PK)
name (TEXT, UNIQUE, NOT NULL)
RLS: Public read. Admins can CRUD.
patient_insurance_details
patient_user_id (UUID, PK, FK to profiles.user_id ON DELETE CASCADE)
insurance_provider_id (INT, PK, FK to insurance_providers.id ON DELETE CASCADE)
policy_number (TEXT, NOT NULL)
details (JSONB) -- Other relevant details
RLS: Patients can manage their own. Doctors (of booked appointments) might get read access. Admins for support.
bookings
id (SERIAL, PK)
patient_user_id (UUID, FK to profiles.user_id ON DELETE CASCADE, NOT NULL)
doctor_user_id (UUID, FK to doctors.user_id ON DELETE CASCADE, NOT NULL)
specialty_id (INT, FK to specialties.id, NOT NULL)
appointment_time (TIMESTAMPTZ, NOT NULL)
duration_minutes (INT, DEFAULT 30, NOT NULL)
status (ENUM: pending, confirmed, cancelled_by_patient, cancelled_by_doctor, completed, no_show, DEFAULT 'pending', NOT NULL)
cancellation_reason (TEXT)
channel (ENUM: app, whatsapp, phone, admin_manual, DEFAULT 'app', NOT NULL)
insurance_provider_id (INT, FK to insurance_providers.id, NULLABLE)
patient_notes (TEXT)
doctor_notes (TEXT) -- For doctor to add post-consultation notes
created_at (TIMESTAMPTZ, DEFAULT now())
updated_at (TIMESTAMPTZ, DEFAULT now())
RLS: Patients see their own. Doctors see theirs. Admins see all.
subscription_plans
id (TEXT, PK, e.g., basic, premium, enterprise)
name (TEXT, UNIQUE, NOT NULL)
monthly_fee_cop (INT NOT NULL)
yearly_fee_cop (INT NOT NULL)
max_appointments_per_month (INT, NULLABLE) -- NULL for unlimited
features (JSONB) -- List of feature descriptions
is_active (BOOLEAN, DEFAULT true)
RLS: Public read. Admins can CRUD.
doctor_subscriptions
id (SERIAL, PK)
doctor_user_id (UUID, FK to doctors.user_id ON DELETE CASCADE, UNIQUE, NOT NULL)
plan_id (TEXT, FK to subscription_plans.id, NOT NULL)
status (ENUM: trialing, active, past_due, cancelled, unpaid, DEFAULT 'trialing')
current_period_start (TIMESTAMPTZ, NOT NULL)
current_period_end (TIMESTAMPTZ, NOT NULL)
payment_gateway_subscription_id (TEXT) -- e.g., Stripe Subscription ID
last_payment_date (TIMESTAMPTZ)
failed_payment_attempts (INT, DEFAULT 0)
RLS: Doctors see their own. Admins can manage all.
admin_audit_logs
id (BIGSERIAL, PK)
admin_user_id (UUID, FK to profiles.user_id, NOT NULL)
action (TEXT, NOT NULL) -- e.g., "verified_doctor", "updated_user_role", "impersonated_user_start"
target_type (TEXT) -- e.g., "doctor", "patient", "booking"
target_id (TEXT) -- ID of the entity affected
details (JSONB) -- Additional context or old/new values
timestamp (TIMESTAMPTZ, DEFAULT now())
RLS: Admins can read. System inserts.
Row Level Security (RLS) Strategy:
RLS policies will be defined in supabase/migrations/RLS_POLICIES.sql. Examples:
A patient can only select/update their own profiles row: auth.uid() = user_id.
A doctor can only update their doctors row: auth.uid() = user_id.
A patient can only view bookings where bookings.patient_user_id = auth.uid().
A doctor can only view bookings where bookings.doctor_user_id = auth.uid().
Admins will have policies that grant wider access, often checked via a helper function like is_admin() that queries a user_roles table or checks a custom claim in the JWT.
6. Scalability and Future Considerations
FastAPI Migration: If API performance becomes a bottleneck or more complex background tasks are needed, migrating the Next.js API routes to a dedicated FastAPI backend (Python) could be considered. The service layer logic (src/services/*.server.ts) would be largely reusable conceptually.
Database Read Replicas: Supabase supports read replicas for scaling read-heavy workloads.
Caching: Implement caching (e.g., Redis, or in-memory for Next.js API routes if appropriate) for frequently accessed, less dynamic data like specialties or doctor listings.
Background Jobs: For tasks like sending bulk notifications or processing large data sets, consider Supabase Edge Functions or a separate worker service (e.g., using BullMQ with Redis).
NLP Service Evolution: The nlpService.server.ts could evolve into a dedicated microservice if NLP processing becomes complex or resource-intensive, allowing independent scaling.
Monitoring and Logging: Integrate with logging services (e.g., Sentry, Logtail) and APM tools for production monitoring.
This architecture provides a comprehensive backend for MedAI, prioritizing security with Supabase RLS and leveraging the Next.js ecosystem for API development.