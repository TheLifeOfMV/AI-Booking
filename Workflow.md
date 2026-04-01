# Plan de Pruebas Manuales de Workflows

## Objetivo

Validar manualmente los workflows principales de la aplicación para identificar errores funcionales, fallos de navegación, problemas de permisos, datos incompletos y comportamientos simulados que aún no estén completamente conectados a Supabase, Stripe o WhatsApp.

Este plan cubre:

- Paciente
- Doctor
- Administrador
- Seguridad de rutas y APIs
- Validación de datos en base de datos
- Registro de bugs

---

## Alcance

### Páginas revisadas

- `/`
- `/intro`
- `/login`
- `/admin/login`
- `/channel`
- `/booking/unified`
- `/booking/confirm`
- `/booking/success`
- `/bookings`
- `/bookings/[id]`
- `/patient/profile`
- `/doctor/register`
- `/doctor/register/success`
- `/doctor/dashboard`
- `/doctor/appointments`
- `/doctor/appointments/[id]`
- `/doctor/appointments/calendar`
- `/doctor/profile`
- `/plans`
- `/doctor/subscription/success`
- `/admin`
- `/admin/users`
- `/admin/doctors`
- `/admin/bookings`

### APIs revisadas

- `/api/auth/login`
- `/api/auth/signup`
- `/api/auth/logout`
- `/api/auth/verify`
- `/api/auth/refresh`
- `/api/doctors`
- `/api/doctors/[id]`
- `/api/doctors/[id]/slots`
- `/api/doctors/register`
- `/api/doctors/me/appointments`
- `/api/specialties`
- `/api/patients/[id]`
- `/api/bookings`
- `/api/bookings/[id]`
- `/api/admin/users`
- `/api/admin/users/[id]`
- `/api/admin/doctors`
- `/api/admin/doctors/[id]`
- `/api/admin/doctors/[id]/approval`
- `/api/admin/doctors/[id]/credentials`
- `/api/admin/doctors/specialties`
- `/api/admin/bookings`
- `/api/admin/metrics`
- `/api/subscriptions`
- `/api/subscriptions/cancel`
- `/api/webhooks/stripe`
- `/api/whatsapp/webhook`

---

## Hallazgos Previos Importantes

Antes de probar, tener presentes estos riesgos detectados en el código:

1. El flujo visible de `/doctor/register` sigue viéndose parcialmente simulado.
2. La navegación de booking todavía referencia rutas antiguas como:
   - `/booking/specialty`
   - `/booking/date`
   - `/booking/doctor`
3. Algunas pantallas del doctor siguen usando datos mock o híbridos.
4. Varias rutas `/api/admin/*` podrían no estar protegiendo correctamente el acceso con validación server-side.
5. El dashboard del doctor usa notificaciones mock.
6. El perfil del doctor parece seguir arrancando con datos mock en varias secciones.
7. El signup desde `/login` crea cuentas de paciente; el flujo doctor debe revisarse por separado.

---

## Prerrequisitos

Antes de empezar las pruebas, confirmar:

1. Las dependencias están instaladas.
2. La app corre localmente sin error fatal.
3. Las variables de entorno de Supabase están configuradas:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Si se va a probar suscripciones, también están configuradas:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PREMIUM_PRICE_ID`
   - `STRIPE_ELITE_PRICE_ID`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_APP_URL`
5. Si se va a probar WhatsApp, también están configuradas:
   - `NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER`
   - `WHATSAPP_VERIFY_TOKEN`
   - `WHATSAPP_API_TOKEN`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `OPENAI_API_KEY`
6. La base de datos tiene creadas estas tablas:
   - `profiles`
   - `specialties`
   - `doctors`
   - `doctor_schedules`
   - `bookings`
   - `doctor_credentials`
   - `subscriptions`
   - `payments`
7. Existen usuarios de prueba:
   - 1 paciente
   - 1 doctor
   - 1 administrador
8. Existe al menos 1 doctor aprobado con:
   - especialidad
   - ubicación
   - horarios disponibles

---

## Herramientas de Apoyo Durante QA

Usar durante las pruebas:

- DevTools del navegador
- Pestaña `Network`
- Pestaña `Console`
- Panel de Supabase
- Panel de Stripe
- Logs de webhook de WhatsApp si aplica

Para cada error registrar:

- URL
- rol usado
- datos ingresados
- request afectado
- status HTTP
- response body
- error de consola
- captura de pantalla
- evidencia en base de datos

---

## Smoke Test General

### 1. Arranque de la aplicación

- Abrir `/`
- Confirmar que no queda pantalla en blanco
- Confirmar que no hay errores fatales en consola
- Confirmar que las redirecciones iniciales funcionan

### 2. Navegación pública

Probar acceso a:

- `/login`
- `/admin/login`
- `/plans`
- `/intro`

Validar:

- las páginas cargan
- no redirigen de forma incorrecta
- no hay errores de render

### 3. Sanidad básica de APIs públicas

Probar:

- `GET /api/specialties`
- `GET /api/doctors`
- `GET /api/doctors/[id]`
- `GET /api/doctors/[id]/slots?date=YYYY-MM-DD`

Validar:

- responden con `200` si corresponde
- la estructura JSON es usable por el front
- no vienen campos vacíos críticos

### 4. Persistencia de sesión

- Iniciar sesión con un usuario válido
- Recargar la página
- Cerrar y reabrir pestaña
- Validar que la sesión se restaure correctamente

---

## Workflow Paciente

### P1. Registro de paciente por email

1. Ir a `/login`
2. Abrir el modal de registro
3. Crear cuenta con datos válidos
4. Validar:
   - la cuenta se crea