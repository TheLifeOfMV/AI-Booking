export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
}

export interface LoginCredentials {
  identifier: string; // Can be email or phone
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name?: string;
  phone?: string;
} 