import { create } from 'zustand';
import { 
  User, 
  LoginCredentials, 
  SignupCredentials, 
  ApiResponse, 
  AuthApiResponse, 
  TokenRefreshResponse 
} from '../types/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  isAdmin: () => boolean;
  initializeAuth: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
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

// Helper function to get stored tokens
const getStoredTokens = () => {
  if (!isBrowser) return { accessToken: null, refreshToken: null };
  
  return {
    accessToken: localStorage.getItem('auth_token'),
    refreshToken: localStorage.getItem('auth_refresh_token')
  };
};

// Helper function to clear all stored auth data
const clearStoredAuth = () => {
  if (!isBrowser) return;
  
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_refresh_token');
  localStorage.removeItem('auth_token_timestamp');
  localStorage.removeItem('auth_user');
};

// Helper function to store auth data
const storeAuthData = (authResponse: AuthApiResponse) => {
  if (!isBrowser) return;
  
  localStorage.setItem('auth_token', authResponse.access_token);
  localStorage.setItem('auth_refresh_token', authResponse.refresh_token);
  localStorage.setItem('auth_token_timestamp', Date.now().toString());
  localStorage.setItem('auth_user', JSON.stringify(authResponse.user));
};

// API Call helpers
const apiCall = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const { accessToken } = getStoredTokens();
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Add authorization header if token exists
  if (accessToken && !endpoint.includes('/login') && !endpoint.includes('/signup')) {
    defaultHeaders['Authorization'] = `Bearer ${accessToken}`;
  }
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  try {
    console.log(`🌐 API Call: ${endpoint}`, { method: config.method || 'GET' });
    
    const response = await fetch(endpoint, config);
    const data = await response.json();
    
    console.log(`🌐 API Response: ${endpoint}`, { 
      status: response.status, 
      success: data.success 
    });
    
    return data;
  } catch (error) {
    console.error(`💥 API Error: ${endpoint}`, error);
    throw new Error('Error de conexión. Verifica tu conexión a internet.');
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  // Initialize authentication state from localStorage and verify with server
  initializeAuth: async () => {
    console.log('🔄 AuthStore: Initializing authentication...');
    
    if (!isBrowser) {
      console.log('⚠️  AuthStore: Not in browser environment, skipping initialization');
      return;
    }
    
    try {
      const storedUser = localStorage.getItem('auth_user');
      const { accessToken } = getStoredTokens();
      
      console.log('🔍 AuthStore: Checking stored data', { 
        hasUser: !!storedUser, 
        hasToken: !!accessToken 
      });
      
      if (!storedUser || !accessToken) {
        console.log('ℹ️  AuthStore: No stored session found');
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false,
          error: null 
        });
        return;
      }
      
      // Verify token with server
      console.log('🔐 AuthStore: Verifying stored token with server...');
      set({ isLoading: true });
      
      const result = await apiCall<{ user: User }>('/api/auth/verify');
      
      if (result.success && result.data) {
        console.log('✅ AuthStore: Token verification successful', { 
          userId: result.data.user.id,
          role: result.data.user.role 
        });
        
        set({ 
          user: result.data.user, 
          isAuthenticated: true, 
          isLoading: false,
          error: null 
        });
      } else {
        console.log('❌ AuthStore: Token verification failed, clearing session');
        clearStoredAuth();
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false,
          error: null 
        });
      }
    } catch (error) {
      console.error('💥 AuthStore: Error during initialization', error);
      clearStoredAuth();
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: 'Error al verificar sesión. Inicia sesión nuevamente.' 
      });
    }
  },

  // Login with real API call
  login: async (credentials: LoginCredentials) => {
    console.log('🔐 AuthStore: Starting login process', { 
      identifier: credentials.identifier, 
      role: credentials.role 
    });
    
    set({ isLoading: true, error: null });
    
    try {
      const result = await apiCall<AuthApiResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Error de autenticación');
      }
      
      console.log('✅ AuthStore: Login successful', { 
        userId: result.data.user.id,
        role: result.data.user.role 
      });
      
      // Store authentication data
      storeAuthData(result.data);
      
      // Update state
      set({ 
        user: result.data.user, 
        isAuthenticated: true, 
        isLoading: false,
        error: null
      });
      
    } catch (error) {
      console.error('❌ AuthStore: Login failed', error);
      const errorMessage = error instanceof Error ? error.message : 'Error de autenticación';
      
      set({ 
        error: errorMessage, 
        isLoading: false,
        isAuthenticated: false,
        user: null
      });
      
      throw error;
    }
  },

  // Signup with real API call
  signup: async (credentials: SignupCredentials) => {
    console.log('📝 AuthStore: Starting signup process', { 
      email: credentials.email, 
      role: credentials.role 
    });
    
    set({ isLoading: true, error: null });
    
    try {
      const result = await apiCall<AuthApiResponse>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Error en el registro');
      }
      
      console.log('✅ AuthStore: Signup successful', { 
        userId: result.data.user.id,
        role: result.data.user.role 
      });
      
      // Store authentication data
      storeAuthData(result.data);
      
      // Update state
      set({ 
        user: result.data.user, 
        isAuthenticated: true, 
        isLoading: false,
        error: null
      });
      
    } catch (error) {
      console.error('❌ AuthStore: Signup failed', error);
      const errorMessage = error instanceof Error ? error.message : 'Error en el registro';
      
      set({ 
        error: errorMessage, 
        isLoading: false,
        isAuthenticated: false,
        user: null
      });
      
      throw error;
    }
  },

  // Logout with real API call
  logout: async () => {
    console.log('🚪 AuthStore: Starting logout process');
    
    try {
      // Call logout endpoint to invalidate server session
      await apiCall('/api/auth/logout', {
        method: 'POST',
      });
      
      console.log('✅ AuthStore: Server logout successful');
    } catch (error) {
      console.warn('⚠️  AuthStore: Server logout failed, but continuing with client cleanup', error);
    }
    
    // Clear client-side data regardless of server response
    clearStoredAuth();
    
    set({ 
      user: null, 
      isAuthenticated: false,
      error: null 
    });
    
    console.log('✅ AuthStore: Client logout completed');
  },

  // Refresh token
  refreshToken: async (): Promise<boolean> => {
    console.log('🔄 AuthStore: Refreshing access token');
    
    const { refreshToken } = getStoredTokens();
    
    if (!refreshToken) {
      console.log('❌ AuthStore: No refresh token available');
      return false;
    }
    
    try {
      const result = await apiCall<TokenRefreshResponse>('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      
      if (!result.success || !result.data) {
        console.log('❌ AuthStore: Token refresh failed');
        return false;
      }
      
      // Update stored access token
      if (isBrowser) {
        localStorage.setItem('auth_token', result.data.access_token);
        localStorage.setItem('auth_token_timestamp', Date.now().toString());
      }
      
      console.log('✅ AuthStore: Token refresh successful');
      return true;
      
    } catch (error) {
      console.error('💥 AuthStore: Token refresh error', error);
      return false;
    }
  },

  clearError: () => set({ error: null }),
  
  isAdmin: () => {
    const state = get();
    return state.isAuthenticated && state.user?.role === 'admin';
  },
})); 