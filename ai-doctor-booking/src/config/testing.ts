/**
 * Testing Configuration
 * 
 * This file contains configuration for testing mode where authentication
 * can be temporarily bypassed for development and testing purposes.
 * 
 * IMPORTANT: Make sure to set ENABLE_TESTING_MODE to false before deployment!
 */

export const testingConfig = {
  // Main toggle for testing mode
  ENABLE_TESTING_MODE: true,
  
  // Default role to simulate when authentication is bypassed
  // Options: 'admin', 'doctor', 'patient', 'client'
  DEFAULT_TESTING_ROLE: 'admin' as const,
  
  // Whether to show testing mode indicators in console
  SHOW_TESTING_LOGS: true,
  
  // Bypass specific auth checks (for more granular control)
  BYPASS_AUTH_VERIFICATION: true,
  BYPASS_ROLE_RESTRICTIONS: false, // Keep role restrictions even in testing
  
  // Test user simulation
  SIMULATED_USER: {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'admin' as const,
    name: 'Test User'
  }
};

export type TestingRole = 'admin' | 'doctor' | 'patient' | 'client';

/**
 * Utility function to check if testing mode is enabled
 */
export const isTestingMode = (): boolean => {
  return testingConfig.ENABLE_TESTING_MODE && process.env.NODE_ENV !== 'production';
};

/**
 * Get the current testing role
 */
export const getTestingRole = (): TestingRole => {
  return testingConfig.DEFAULT_TESTING_ROLE;
};

/**
 * Log testing mode messages (only if enabled)
 */
export const logTestingMode = (message: string, ...args: any[]): void => {
  if (testingConfig.SHOW_TESTING_LOGS && isTestingMode()) {
    console.log(`🧪 TESTING MODE: ${message}`, ...args);
  }
}; 