'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

type FormValues = {
  email: string;
  password: string;
};

export default function LoginContent() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, navigateToCalendar } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await signIn(data.email, data.password);
      
      if (result.success) {
        navigateToCalendar();
      } else {
        setError(result.error || 'An error occurred during sign in');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-h1 font-bold mb-2">Sign In</h1>
          <p className="text-gray-600">Access your medical appointments</p>
        </div>
        
        <div className="card">
          {error && (
            <div className="bg-pink-100 text-error p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label htmlFor="email" className="block mb-2 text-small">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="your@email.com"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email format'
                  }
                })}
              />
              {errors.email && (
                <p className="text-error text-small mt-1">{errors.email.message as string}</p>
              )}
            </div>
            
            <div className="mb-5">
              <label htmlFor="password" className="block mb-2 text-small">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="••••••••"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  }
                })}
              />
              {errors.password && (
                <p className="text-error text-small mt-1">{errors.password.message as string}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="btn w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="text-teal-400 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <Link href="/" className="text-gray-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 