import { create } from 'zustand';
import { User, LoginCredentials } from '../types/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // For now, just simulate a login with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate a successful login
      const user: User = {
        id: '1',
        email: credentials.identifier.includes('@') ? credentials.identifier : 'user@example.com',
        phone: !credentials.identifier.includes('@') ? credentials.identifier : undefined,
      };
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
      // Store token in localStorage (this would be a JWT in a real app)
      localStorage.setItem('auth_token', 'demo_token');
      
    } catch (err) {
      set({ 
        error: 'Invalid credentials', 
        isLoading: false 
      });
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    set({ 
      user: null, 
      isAuthenticated: false 
    });
  },

  clearError: () => set({ error: null }),
})); 