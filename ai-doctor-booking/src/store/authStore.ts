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
  isAdmin: () => boolean;
  initializeAuth: () => void;
}

// Helper function to safely parse JSON from localStorage
const parseStoredUser = (storedUser: string | null): User | null => {
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
};

// Helper function to check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  // Initialize authentication state from localStorage - ONLY when explicitly called
  initializeAuth: () => {
    console.log('AuthStore: Initializing authentication...');
    
    if (!isBrowser) {
      console.log('AuthStore: Not in browser environment, skipping initialization');
      return;
    }
    
    try {
      const storedUser = localStorage.getItem('auth_user');
      const storedToken = localStorage.getItem('auth_token');
      
      console.log('AuthStore: Checking stored data -', { 
        hasUser: !!storedUser, 
        hasToken: !!storedToken,
        userData: storedUser ? 'present' : 'missing'
      });
      
      // FIXED: Only restore session if both user and token exist AND are valid
      if (storedUser && storedToken) {
        const user = parseStoredUser(storedUser);
        // Add token expiration check
        const tokenTimestamp = localStorage.getItem('auth_token_timestamp');
        const now = Date.now();
        const tokenAge = tokenTimestamp ? now - parseInt(tokenTimestamp) : Infinity;
        const MAX_TOKEN_AGE = 24 * 60 * 60 * 1000; // 24 hours
        
        if (user && tokenAge < MAX_TOKEN_AGE) {
          console.log('AuthStore: Restoring valid user session -', { 
            email: user.email, 
            role: user.role 
          });
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
          
          console.log('AuthStore: User session restored successfully');
        } else {
          console.log('AuthStore: Token expired or invalid, clearing localStorage');
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_token_timestamp');
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null 
          });
        }
      } else {
        console.log('AuthStore: No stored session found');
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false,
          error: null 
        });
      }
    } catch (error) {
      console.error('AuthStore: Error during initialization:', error);
      // Clear potentially corrupted data
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_token_timestamp');
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: 'Error al inicializar sesión' 
      });
    }
  },

  login: async (credentials: LoginCredentials) => {
    console.log('AuthStore: Starting login process -', { 
      identifier: credentials.identifier, 
      role: credentials.role 
    });
    
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock user based on credentials
      const mockUser: User = {
        id: '1',
        email: credentials.identifier,
        name: credentials.role === 'doctor' ? 'Dr. Ejemplo' : 'Usuario Ejemplo',
        role: credentials.role || 'client'
      };
      
      console.log('AuthStore: Login successful, creating user -', mockUser);
      
      // Store in localStorage with timestamp
      if (isBrowser) {
        localStorage.setItem('auth_token', 'demo_token');
        localStorage.setItem('auth_token_timestamp', Date.now().toString());
        localStorage.setItem('auth_user', JSON.stringify(mockUser));
        console.log('AuthStore: Data saved to localStorage with timestamp');
      }
      
      // Update state
      set({ 
        user: mockUser, 
        isAuthenticated: true, 
        isLoading: false,
        error: null
      });
      
      console.log('AuthStore: Login completed successfully');
    } catch (error) {
      console.error('AuthStore: Login failed -', error);
      set({ 
        error: 'Error de autenticación. Verifica tus credenciales.', 
        isLoading: false,
        isAuthenticated: false,
        user: null
      });
      throw error;
    }
  },

  logout: () => {
    if (isBrowser) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_token_timestamp');
      localStorage.removeItem('auth_user');
    }
    set({ 
      user: null, 
      isAuthenticated: false 
    });
  },

  clearError: () => set({ error: null }),
  
  isAdmin: () => {
    const state = get();
    return state.isAuthenticated && state.user?.role === 'admin';
  },
}));

// FIXED: Remove automatic initialization - only initialize when AuthInitializer component mounts
// This allows users to manually choose their login role 