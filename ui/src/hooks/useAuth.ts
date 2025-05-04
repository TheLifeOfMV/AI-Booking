'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

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
      
      router.push('/login');
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An error occurred during sign out',
      };
    }
  };

  // Navigation helpers
  const navigateToLogin = () => {
    router.push('/login');
  };

  const navigateToCalendar = () => {
    router.push('/calendar');
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    navigateToLogin,
    navigateToCalendar
  };
} 