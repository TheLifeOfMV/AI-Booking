project:
  name: "medai-doctor-booking"
  description: "Multi-channel platform for patients to book medical appointments with doctors."

principles:
  pragmatism:
    summary: "Leverages Node.js and Next.js API routes for alignment with existing frontend and streamlined deployment. Supabase provides battle-tested Auth, DB, and Storage out-of-the-box, accelerating development significantly. Focuses on delivering core features rapidly with minimal overhead."
  separation_of_concerns:
    summary: "Clearly defines distinct layers for API handling (Next.js API Routes), business logic (Service modules), and data persistence/authentication (Supabase). This allows independent development, testing, and scaling of each component."

framework_choices:
  backend: "Node.js (with Next.js API Routes)"
  frontend: "Next.js (React)"
  rationale: |
    Node.js/Next.js provides a unified language and framework across frontend and backend layers for the MVP, simplifying development and deployment (Vercel). Supabase is chosen for its managed BaaS offering (PostgreSQL, Auth, Storage), removing the need to build these complex components from scratch. This combination balances rapid development with a clear separation of concerns through API routes and service modules.

architecture:
  backend:
    layers:
      logic: |
        Service Modules (src/services/): Encapsulate all core business rules and logic (e.g., booking creation validation, doctor schedule management, user data processing, subscription handling, notification triggering). Interact with the database exclusively via the Supabase client instance.
      interface: |
        Next.js API Routes (src/app/api/): Provide HTTP endpoints for all client and webhook interactions. Handle request parsing, validation, authentication/authorization (using middleware), and delegate specific tasks to the appropriate Service Modules. Format responses in JSON.
    state: |
      Persistent State: Primarily stored in Supabase PostgreSQL database (users, doctors, bookings, schedules, specialties, subscriptions) and Supabase Storage (doctor credentials, files).
      Authentication State: Managed by Supabase GoTrue (JWTs). Backend validates JWTs per request.
      Request State: Handled within API route scope and passed to Service Modules.
    connections: |
      Frontend/External Clients -> HTTP -> Next.js API Routes (src/app/api/)
      API Routes -> Function Calls -> Service Modules (src/services/)
      Service Modules -> Supabase Client (src/lib/supabaseClient.ts) -> Supabase DB/Auth/Storage
      External Webhooks (e.g., Twilio) -> HTTP POST -> Specific Webhook API Routes (src/app/api/webhook/)
  frontend:
    layers:
      logic: |
        Zustand Store (src/store/): Client-side state management for user session, booking flow data, user bookings, admin views.
        Service Hooks/Utilities (src/hooks/, src/services/ - client): Abstract API calls and client-side business logic (e.g., fetching doctors, managing booking steps, handling user profile display). Interact with backend API routes.
      interface: |
        React Components (src/components/): Reusable UI elements (Buttons, Inputs, Cards, Modals).
        Next.js Pages (src/app/): Define routes and compose components for specific views (patient, doctor, admin).
        Layouts (src/app/layout.tsx, src/app/[role]/layout.tsx): Define common UI structures (headers, navigation).
        Styling: Tailwind CSS for utility-first styling.
    communication:
      pattern: "REST"
      error_strategy: |
        Backend: Standard HTTP status codes and JSON error bodies. Service layer throws errors, API layer catches and formats them.
        Frontend: API calls caught in hooks/services, update store state with error message. UI components react to error state (display message, retry option). Client-side validation provides immediate feedback.
        Supabase errors: Handled via Supabase client error objects.

batches:
  - name: "core_essential"
    approx_loc: 800
    objectives: |
      • Enable user authentication (signup/login/logout) for patient and doctor roles.
      • Allow patients to view their own profile.
      • Implement public API endpoints for browsing medical specialties.
      • Implement public API endpoints for searching/listing approved doctors by specialty and date.
      • Implement public API endpoints for fetching available time slots for a doctor on a given date.
      • Enable patients to create a new booking (auto-confirmed for doctors).
      • Allow patients to view their upcoming and past bookings.
      • Allow patients to view details of a specific booking.
      • Set up core Supabase database tables and basic RLS policies.
    instructions: |
      Backend Layer (Database - Supabase):
      • Define `auth.users` table (provided by Supabase Auth).
      • Create `profiles` table: `user_id (UUID PK, FK auth.users, ON DELETE CASCADE)`, `full_name`, `phone_number`, `avatar_url`, `role (ENUM: patient, doctor, admin)`.
      • Create `specialties` table: `id (SERIAL PK)`, `name`, `icon_url`, `description`.
      • Create `doctors` table: `user_id (UUID PK, FK profiles)`, `specialty_id (INT FK specialties)`, `experience_years`, `rating`, `consultation_fee`, `location`, `approval_status (BOOLEAN)`, `is_accepting_new_patients`.
      • Create `doctor_schedules` table: `id (SERIAL PK)`, `doctor_user_id (UUID FK doctors)`, `day_of_week (INT)`, `start_time (TIME)`, `end_time (TIME)`. Define unique constraint on `(doctor_user_id, day_of_week, start_time)`.
      • Create `bookings` table: `id (SERIAL PK)`, `patient_user_id (UUID FK profiles)`, `doctor_user_id (UUID FK doctors)`, `specialty_id (INT FK specialties)`, `appointment_time (TIMESTAMPTZ)`, `duration_minutes`, `status (ENUM: pending, confirmed, cancelled_by_patient, cancelled_by_doctor, completed, no_show)`, `channel (ENUM: app, whatsapp, phone, admin)`.
      • Define initial RLS policies: Users can read/update their own `profiles` row (`auth.uid() = user_id`). Public read access on `specialties`. Limited read access on `doctors` (only approved ones).
      • Implement initial seed data for `specialties`.

      Backend Layer (Service - src/services/*.server.ts):
      • Create `authService.server.ts`: Implement `signup`, `login`, `logout` functions using Supabase Auth client. Return user object including role from `profiles`.
      • Create `patientService.server.ts`: Implement `getPatientProfile(userId)`, `updatePatientProfile(userId, data)`. Interact with `profiles` table.
      • Create `specialtyService.server.ts`: Implement `getSpecialties()`. Interact with `specialties` table.
      • Create `doctorService.server.ts`: Implement `getApprovedDoctors(specialtyId, date)`, `getDoctorAvailableSlots(doctorId, date)`. Query `doctors`, `doctor_schedules`. Simulate availability logic.
      • Create `bookingService.server.ts`: Implement `createBooking(bookingData)` (set status to 'confirmed' if doctor approved/available), `getPatientBookings(patientId)`, `getBookingById(bookingId)`. Interact with `bookings` table. Simulate auto-confirmation logic based on `doctor_schedules`.

      Backend Layer (API - src/app/api/):
      • Create `src/lib/supabaseClient.ts`: Initialize Supabase client for server-side (using service key or row-level policy context).
      • Create `src/lib/authMiddleware.ts`: Middleware to verify JWT and attach user/role to request.
      • Create `src/lib/errorHandler.ts`: Utility for consistent API error responses.
      • Create `src/app/api/auth/signup/route.ts` (POST): Call `authService.signup`.
      • Create `src/app/api/auth/login/route.ts` (POST): Call `authService.login`.
      • Create `src/app/api/auth/logout/route.ts` (POST): Call `authService.logout`.
      • Create `src/app/api/auth/me/route.ts` (GET): Use auth middleware, return user from request.
      • Create `src/app/api/public/specialties/route.ts` (GET): Call `specialtyService.getSpecialties`. No auth middleware.
      • Create `src/app/api/public/doctors/route.ts` (GET): Call `doctorService.getApprovedDoctors`. No auth middleware.
      • Create `src/app/api/public/slots/route.ts` (GET): Call `doctorService.getDoctorAvailableSlots`. No auth middleware.
      • Create `src/app/api/patient/profile/route.ts` (GET, PUT): Use auth middleware, call `patientService.getPatientProfile` and `updatePatientProfile` with user ID from auth context.
      • Create `src/app/api/patient/bookings/route.ts` (GET, POST): Use auth middleware. GET calls `bookingService.getPatientBookings`. POST calls `bookingService.createBooking` with user ID from auth context.
      • Create `src/app/api/patient/bookings/[id]/route.ts` (GET): Use auth middleware, call `bookingService.getBookingById` ensuring user ID matches.

      Frontend Integration Logic (src/store/, src/hooks/, src/services/):
      • Update `authStore.ts` to use the new auth API routes for login/signup/logout. Store JWT/user in localStorage. Add `initializeAuth` function to hydrate from localStorage.
      • Create `userBookingsStore.ts`: Zustand store to manage patient's bookings list and selected booking details. Implement `fetchUserBookings`, `fetchBookingById`, `cancelBooking` (calls relevant backend APIs).
      • Update `bookingStore.ts` to use public API routes for fetching specialties, doctors, and slots. Use `bookingService` (client-side logic layer or direct API call wrapper) for `createDraftBooking` and triggering the backend POST.
      • Update/create client-side services (e.g., `src/services/patientService.ts`, `src/services/doctorService.ts` - these might become thin wrappers around `fetch` calls to `/api`) to interact with the new API routes. Ensure separation from server-side services.

  - name: "core_important"
    approx_loc: 1000
    objectives: |
      • Implement the Doctor Registration flow (personal, professional, credentials upload, bio).
      • Allow doctors to manage their professional profile (specialty, experience, bio, location).
      • Allow doctors to manage their weekly availability schedule.
      • Implement Admin login.
      • Implement Admin dashboards for listing users, doctors, and bookings with basic details.
      • Allow Admins to approve/unapprove doctors (control visibility in public APIs).
      • Allow Admins to update doctor credential status.
      • Stub out AI/Channel webhook endpoints with basic logging.
    instructions: |
      Backend Layer (Database - Supabase):
      • Add `credentials` JSONB column to `doctors` table (or create `doctor_credentials` table with `doctor_user_id`, `document_type`, `storage_path`, `status (ENUM pending_review, verified, rejected)`). Using a separate table is better for SoC.
      • Add `bio` TEXT column to `doctors` table.
      • Refine RLS: Doctors can read/update their own `doctors` and `doctor_schedules` rows. Admins can read all user, doctor, booking data and update relevant fields (approval, credential status).
      • Set up Supabase Storage bucket for doctor credentials with RLS to allow doctors to upload their own files and admins to view/manage.

      Backend Layer (Service - src/services/*.server.ts):
      • Enhance `authService.server.ts`: Add specific signup logic for 'doctor' role, including initial `doctors` table entry creation.
      • Enhance `doctorService.server.ts`: Implement `createDoctor(data)`, `updateDoctor(doctorId, data)`. Include logic for updating specialties, experience, bio, location. Implement `handleCredentialUpload(doctorId, fileData)` (integrate with storage service), `updateCredentialStatus(doctorId, status)`, `toggleDoctorApproval(doctorId, approved)`.
      • Create `adminService.server.ts`: Implement `listUsers(filters, pagination)`, `listDoctors(filters, pagination)`, `listBookings(filters, pagination)`. Implement `getDoctorById(doctorId)`, `getUserById(userId)`, `getBookingById(bookingId)` (with admin-level access).

      Backend Layer (API - src/app/api/):
      • Create `src/services/storageService.server.ts`: Implement file upload logic using Supabase Storage SDK. Generate signed URLs for uploads/downloads if needed.
      • Create `src/lib/adminAuthMiddleware.ts`: Middleware to ensure user is authenticated AND has 'admin' role.
      • Create `src/app/api/doctor/register/route.ts` (POST): Handle doctor registration data, call `authService.signup` and `doctorService.createDoctor`.
      • Create `src/app/api/doctor/profile/route.ts` (GET, PUT): Use auth middleware (doctor role), call `doctorService.getDoctorById` and `updateDoctor` with user ID from auth context. Handle nested updates (specialties, bio, location).
      • Create `src/app/api/doctor/schedule/route.ts` (GET, PUT): Use auth middleware (doctor role), call `doctorService.getDoctorAvailableTimes` and `updateAvailableTimes` with user ID from auth context.
      • Create `src/app/api/doctor/credentials/route.ts` (POST): Use auth middleware (doctor role), call `storageService.handleCredentialUpload`.
      • Create `src/app/api/admin/login/route.ts` (POST): Call `authService.login` specifically for 'admin' role.
      • Create `src/app/api/admin/users/route.ts` (GET): Use admin auth middleware, call `adminService.listUsers`.
      • Create `src/app/api/admin/doctors/route.ts` (GET): Use admin auth middleware, call `adminService.listDoctors`.
      • Create `src/app/api/admin/bookings/route.ts` (GET): Use admin auth middleware, call `adminService.listBookings`.
      • Create `src/app/api/admin/doctors/[id]/approval/route.ts` (PATCH): Use admin auth middleware, call `doctorService.toggleDoctorApproval`.
      • Create `src/app/api/admin/doctors/[id]/credentials/route.ts` (PATCH): Use admin auth middleware, call `doctorService.updateCredentialStatus`.
      • Create `src/app/api/webhook/twilio/whatsapp/route.ts` (POST): Stub with logging - receive Twilio payload, log it.
      • Create `src/app/api/webhook/twilio/voice/route.ts` (POST): Stub with logging - receive Twilio payload, log it.

      Frontend Integration Logic:
      • Update `authStore.ts` for doctor registration flow. Add logic to handle role selection on login page.
      • Implement doctor registration pages (`src/app/doctor/register/page.tsx`) and components (`SpecialtySelector`, `CredentialUpload`), call relevant API routes.
      • Implement doctor profile page (`src/app/doctor/profile/page.tsx`) and components (`ScheduleEditor`, `PlanChangeModal` - *modal integration stubbed*), call relevant API routes.
      • Implement admin pages (`src/app/admin/.../page.tsx`) and components (`DoctorsTable`, `UsersTable`, `BookingsTable`, `FilterPanel`, `ApprovalToggle`, `CredentialStatusBadge`, `DoctorEditModal`), call relevant API routes. Use context/hooks (`useAdminBookings`, `useAdminMetrics`) to manage state and API calls in admin components.

  - name: "non_core_important"
    approx_loc: 900
    objectives: |
      • Implement Doctor Subscription functionality (model plans, allow doctors to view/change plans).
      • Integrate with a payment gateway (simulate using `subscriptionService`).
      • Implement basic subscription payment processing hooks/webhooks (simulate payment gateway response).
      • Implement automated appointment reminders/notifications (email/WhatsApp/SMS) via `notificationService` using Twilio SDK.
      • Implement Admin oversight of subscriptions.
    instructions: |
      Backend Layer (Database - Supabase):
      • Create `subscription_plans` table: `id (TEXT PK)`, `name`, `monthly_fee_cop`, `yearly_fee_cop`, `features (JSONB)`, `limitations (JSONB)`, `recommended (BOOLEAN)`, `color`, `description`, `max_appointments`, `support_level`, `analytics`, `api_access`, `custom_integrations`. Seed with data from PRD/constants.
      • Create `doctor_subscriptions` table: `id (SERIAL PK)`, `doctor_user_id (UUID FK doctors, UNIQUE)`, `plan_id (TEXT FK subscription_plans)`, `status (ENUM trialing, active, past_due, cancelled, unpaid)`, `current_period_start (TIMESTAMPTZ)`, `current_period_end (TIMESTAMPTZ)`, `payment_gateway_subscription_id (TEXT NULLABLE)`, `last_payment_date (TIMESTAMPTZ NULLABLE)`, `next_payment_date (TIMESTAMPTZ NULLABLE)`, `failed_payment_attempts (INT)`.
      • Create `payment_methods` table (optional, if storing payment details): `id (TEXT PK)`, `doctor_user_id (UUID FK profiles)`, `type`, `details (JSONB)`, `is_default`.
      • Refine RLS: Doctors can read/update their own `doctor_subscriptions` and `payment_methods`. Admins can read/manage all.

      Backend Layer (Service - src/services/*.server.ts):
      • Create `subscriptionService.server.ts`: Implement `getDoctorSubscription(doctorId)`, `changePlan(doctorId, newPlanId, billingCycle)`, `processPayment(subscriptionId, amount, paymentMethodId)`, `cancelSubscription(subscriptionId)`. Simulate interactions with a payment gateway API. Implement proration logic.
      • Create `notificationService.server.ts`: Implement `sendAppointmentReminder(bookingId, channel)`, `sendAppointmentConfirmation(bookingId, channel)`. Integrate with Twilio SDK (WhatsApp/SMS/Voice). Integrate with email service (Supabase Auth or other). Triggered by booking changes or scheduled jobs.

      Backend Layer (API - src/app/api/):
      • Create `src/app/api/doctor/subscription/route.ts` (GET, POST): Use auth middleware (doctor role). GET calls `subscriptionService.getDoctorSubscription`. POST calls `subscriptionService.changePlan`.
      • Create `src/app/api/webhook/payment/stripe/route.ts` (POST): Stub webhook endpoint for payment gateway events. Parse payload, verify signature, call relevant `subscriptionService` functions (e.g., handle payment success/failure, subscription updates).

      Scheduled Jobs (Consider implementation outside Next.js API routes, e.g., Supabase Edge Functions cron job or a separate worker):
      • Schedule job to trigger `notificationService.sendAppointmentReminder` for upcoming appointments.

      Frontend Integration Logic:
      • Implement plans page (`src/app/plans/page.tsx`) and components (`PlanCard`, `PlanComparison`, `PlanSelector`), display plan details, call relevant API routes.
      • Update doctor profile page (`src/app/doctor/profile/page.tsx`) to display subscription info and integrate `PlanChangeModal` (calls `subscriptionService`).
      • Update booking confirmation page (`src/app/booking/confirm/page.tsx`) to integrate with `notificationService` for confirmation message (or handle via backend after booking creation).
      • Implement basic Admin subscription list/view.

  - name: "non_core_optional"
    approx_loc: 600
    objectives: |
      • Implement Admin Impersonation feature (securely view the platform from a user's perspective).
      • Implement basic Admin Audit Logging (log sensitive admin actions).
      • Implement Admin Metrics API for basic dashboard KPIs (bookings/day, utilization).
      • Enhance existing APIs/Services with rate limiting, input validation schemas (e.g., Zod).
    instructions: |
      Backend Layer (Database - Supabase):
      • Create `admin_audit_logs` table: `id (BIGSERIAL PK)`, `admin_user_id (UUID FK profiles)`, `action (TEXT)`, `target_type (TEXT)`, `target_id (TEXT NULLABLE)`, `details (JSONB NULLABLE)`, `timestamp (TIMESTAMPTZ)`.
      • Refine RLS: Admins can read `admin_audit_logs`. System inserts logs.

      Backend Layer (Service - src/services/*.server.ts):
      • Enhance `adminService.server.ts`: Implement `impersonateUser(adminId, targetUserId)` (simulates session change/token generation for the target user), `getPlatformMetrics(dateRange)` (aggregates data from bookings, users, doctors tables). Implement `logAdminAction(adminId, action, targetType, targetId, details)`.

      Backend Layer (API - src/app/api/):
      • Create `src/lib/validationSchemas.ts`: Define Zod schemas for validating incoming request bodies and query parameters. Apply validation in API routes.
      • Create `src/lib/rateLimiter.ts`: Implement rate limiting logic. Apply to relevant public and potentially authenticated endpoints.
      • Create `src/app/api/admin/impersonate/route.ts` (POST): Use admin auth middleware, call `adminService.impersonateUser`.
      • Create `src/app/api/admin/metrics/route.ts` (GET): Use admin auth middleware, call `adminService.getPlatformMetrics`.
      • Enhance all relevant admin API routes to call `adminService.logAdminAction` after successful sensitive operations (e.g., doctor approval, user edit, booking cancellation/refund).
      • Enhance public APIs (`doctors`, `slots`, `bookings`) with rate limiting.
      • Implement input validation using schemas in relevant API routes.

      Frontend Integration Logic:
      • Implement Admin Impersonation button/workflow (`ImpersonationButton` component). On click, call the impersonation API and handle the response (e.g., receive a temporary token for the impersonated user, potentially redirect to their view).
      • Implement Admin Dashboard KPIs using data from the metrics API endpoint (`useAdminMetrics` hook, KPI components).
      • Ensure consistent error display using `ToastProvider` across the application, triggered by API errors caught in hooks/services.

implementation_guidance:
  planning: |
    • Catalogue failure modes: Identify potential failures at each layer (e.g., DB connection errors, API input validation failures, external service timeouts, file upload errors, payment gateway errors). Define fallbacks (retry logic, graceful degradation like showing mock data or error messages).
    • Define runtime & SLA constraints: Node.js environment. Aim for sub-200ms API latency for core operations. Ensure Supabase is monitored for performance. Document required environment variables (Supabase keys, Twilio credentials).
    • Draft example tests/specs: Define sample requests/responses for each API endpoint. Outline expected data states after service calls (e.g., what a booking object looks like after creation, what a doctor object looks like after approval).
  coding: |
    • Emit structured logs: Use a library or simple JSON logging for key events in API routes and Services.
    • Pin dependencies: Use `package-lock.json` and specify exact versions.
    • Build smallest usable slice: Implement auth, then public specialty listing, then public doctor listing, etc., verifying each step works before moving on.
    • Extend iteratively: After completing a batch, review, test, and refine before starting the next. Use feature flags for larger new features if needed.
  debugging: |
    • Reproduce bugs with minimal scripts: Use `curl` or simple Node.js scripts to isolate API call issues. Use Jest tests for service logic.
    • Instrument before editing: Add `console.log` or use a structured logger around suspected areas to understand data flow and state changes.
    • Add a regression test per fix: Write a unit or integration test that captures the specific scenario causing the bug. Document the fix and link it to the test.

output_format: "YAML"