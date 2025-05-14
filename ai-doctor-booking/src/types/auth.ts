export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role?: 'client' | 'doctor' | 'admin';
}

export interface LoginCredentials {
  identifier: string; // Can be email or phone
  password: string;
  role?: 'client' | 'doctor' | 'admin'; // Campo opcional para especificar el rol
}

export interface SignupCredentials {
  email: string;
  password: string;
  name?: string;
  phone?: string;
} 