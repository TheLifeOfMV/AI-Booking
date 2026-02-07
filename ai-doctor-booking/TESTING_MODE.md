# Testing Mode - Authentication Bypass

This document explains how to use the temporary testing mode that bypasses authentication for development and testing purposes.

## Overview

The testing mode allows you to access the application without going through the authentication process. This is useful for:
- Development testing
- UI/UX testing
- Feature testing without authentication complexity
- Quick access to different user roles

## How to Enable/Disable

### Quick Toggle
Edit `src/config/testing.ts`:
```typescript
export const testingConfig = {
  ENABLE_TESTING_MODE: true, // Set to false to disable testing mode
  // ... other settings
};
```

### Environment Safety
Testing mode is automatically disabled in production environment (`NODE_ENV === 'production'`).

## Configuration Options

In `src/config/testing.ts`:

```typescript
export const testingConfig = {
  // Main toggle for testing mode
  ENABLE_TESTING_MODE: true,
  
  // Default role to simulate when authentication is bypassed
  // Options: 'admin', 'doctor', 'patient', 'client'
  DEFAULT_TESTING_ROLE: 'admin',
  
  // Whether to show testing mode indicators in console
  SHOW_TESTING_LOGS: true,
  
  // Bypass specific auth checks (for more granular control)
  BYPASS_AUTH_VERIFICATION: true,
  BYPASS_ROLE_RESTRICTIONS: false, // Keep role restrictions even in testing
  
  // Test user simulation
  SIMULATED_USER: {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'admin',
    name: 'Test User'
  }
};
```

## Testing Different User Roles

To test different user roles, change the `DEFAULT_TESTING_ROLE`:

- `'admin'` - Access to admin dashboard and all features
- `'doctor'` - Access to doctor dashboard and doctor-specific features  
- `'patient'` - Access to patient features and booking
- `'client'` - Access to client features

## What Testing Mode Does

When enabled, testing mode:

1. **Bypasses Authentication**: Skips login verification and token checks
2. **Simulates User Role**: Acts as if a user with the specified role is logged in
3. **Maintains Route Protection**: Still enforces role-based access restrictions
4. **Preserves Code Structure**: All authentication code remains intact and functional
5. **Console Logging**: Shows testing mode indicators in browser console
6. **Login Form Bypass**: Automatically redirects from login page based on role
7. **Visual Indicators**: Shows testing mode banner and messages

## What Testing Mode Does NOT Do

- Does not modify database authentication
- Does not affect API authentication (backend still requires valid tokens for API calls)
- Does not disable role-based route restrictions (unless specifically configured)
- Does not persist user sessions

## How to Re-enable Authentication

1. Set `ENABLE_TESTING_MODE: false` in `src/config/testing.ts`
2. Or simply delete/comment out the testing configuration import in `RouteGuard.tsx`

## Important Notes

⚠️ **IMPORTANT**: Always disable testing mode before production deployment!

⚠️ **API Calls**: Backend API calls may still require authentication. Testing mode only bypasses frontend route protection.

⚠️ **Data Persistence**: Testing mode doesn't create real user sessions, so some features requiring user data may not work correctly.

## Console Messages

When testing mode is active, you'll see console messages like:
```
🧪 TESTING MODE: Authentication bypassed
🧪 TESTING MODE: Simulating authenticated user with role: admin
🧪 TESTING MODE: Route access granted
```

## Files Modified

- `src/components/RouteGuard.tsx` - Main route protection logic
- `src/config/testing.ts` - Testing configuration (new file)
- `TESTING_MODE.md` - This documentation (new file)

## Reverting Changes

To completely remove testing mode:

1. Delete `src/config/testing.ts`
2. Remove testing-related imports and logic from `src/components/RouteGuard.tsx`
3. Delete `TESTING_MODE.md`

The original authentication flow will be fully restored. 