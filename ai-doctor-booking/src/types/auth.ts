/**
 * Authentication Types - Unified Role System
 * CRITICAL FIX: Resolving type mismatch between server and client
 * 
 * Server was using: 'patient' | 'doctor' | 'admin'
 * Client was using: 'client' | 'doctor' | 'admin'
 * 
 * Resolution: Unify to a single role system with backwards compatibility
 */

// Unified role system - this is the single source of truth
export type UserRole = 'patient' | 'doctor' | 'admin';

// Legacy client role for backwards compatibility
export type LegacyClientRole = 'client' | 'doctor' | 'admin';

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role?: UserRole; // Using unified role system
}

export interface LoginCredentials {
  identifier: string; // Can be email or phone
  password: string;
  role?: UserRole; // Using unified role system
}

export interface SignupCredentials {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  role?: UserRole; // Using unified role system
}

// API Response Types for Frontend Integration
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  correlationId?: string;
}

export interface AuthApiResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface TokenRefreshResponse {
  access_token: string;
  expires_in: number;
}

// Error Types
export interface AuthError {
  message: string;
  code?: string;
  statusCode?: number;
}

// Role mapping utilities for compatibility
export const RoleMapper = {
  /**
   * Convert legacy client role to unified role
   */
  fromLegacyClient: (legacyRole: LegacyClientRole): UserRole => {
    if (legacyRole === 'client') {
      return 'patient';
    }
    return legacyRole as UserRole;
  },

  /**
   * Convert unified role to legacy client role for backwards compatibility
   */
  toLegacyClient: (role: UserRole): LegacyClientRole => {
    if (role === 'patient') {
      return 'client';
    }
    return role as LegacyClientRole;
  },

  /**
   * Check if role is valid
   */
  isValidRole: (role: string): role is UserRole => {
    return ['patient', 'doctor', 'admin'].includes(role);
  },

  /**
   * Check if legacy role is valid
   */
  isValidLegacyRole: (role: string): role is LegacyClientRole => {
    return ['client', 'doctor', 'admin'].includes(role);
  }
};

// Role-based permissions
export const RolePermissions = {
  patient: {
    canBookAppointments: true,
    canViewOwnAppointments: true,
    canManageProfile: true,
    canAccessPatientPortal: true,
    canAccessDoctorPortal: false,
    canAccessAdminPortal: false
  },
  doctor: {
    canBookAppointments: false,
    canViewOwnAppointments: true,
    canManageProfile: true,
    canAccessPatientPortal: false,
    canAccessDoctorPortal: true,
    canAccessAdminPortal: false,
    canManagePatients: true,
    canManageSchedule: true
  },
  admin: {
    canBookAppointments: true,
    canViewOwnAppointments: true,
    canManageProfile: true,
    canAccessPatientPortal: true,
    canAccessDoctorPortal: true,
    canAccessAdminPortal: true,
    canManageUsers: true,
    canManageSystem: true
  }
} as const;

// Type guards for role checking
export const isPatient = (role?: UserRole): boolean => role === 'patient';
export const isDoctor = (role?: UserRole): boolean => role === 'doctor';
export const isAdmin = (role?: UserRole): boolean => role === 'admin';

// Permission checking utilities
export const hasPermission = (role: UserRole, permission: keyof typeof RolePermissions.patient): boolean => {
  const rolePermissions = RolePermissions[role];
  return rolePermissions && rolePermissions[permission as keyof typeof rolePermissions] === true;
};

/**
 * Migration guide for existing code:
 * 
 * 1. Replace 'client' with 'patient' in all new code
 * 2. Use RoleMapper.fromLegacyClient() when receiving legacy data
 * 3. Use RoleMapper.toLegacyClient() when interfacing with legacy systems
 * 4. Use RolePermissions for role-based access control
 * 5. Use type guards (isPatient, isDoctor, isAdmin) for role checking
 */ 