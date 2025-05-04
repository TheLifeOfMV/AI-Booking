'use client';

import { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

// Create auth context
type AuthContextType = {
  user: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Get user on initial load
    const getUser = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.auth.getUser();
        
        if (data?.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error getting user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Sign in with email
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An error occurred during sign in',
      };
    }
  };

  // Sign up with email
  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An error occurred during sign up',
      };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An error occurred during sign out',
      };
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 