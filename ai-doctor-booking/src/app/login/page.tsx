'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { validateEmail, validatePhone, validateRequired, validatePassword } from '@/utils/validation';

type AuthMode = 'login' | 'signup';
type IdentifierType = 'email' | 'phone';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [identifierType, setIdentifierType] = useState<IdentifierType>('email');
  
  // Form fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  
  // Validation errors
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordConfirmError, setPasswordConfirmError] = useState('');
  
  const validateForm = (): boolean => {
    let isValid = true;
    
    // Reset errors
    setIdentifierError('');
    setPasswordError('');
    setPasswordConfirmError('');
    
    // Validate identifier (email or phone)
    if (!validateRequired(identifier)) {
      setIdentifierError(identifierType === 'email' ? 'Email is required' : 'Phone number is required');
      isValid = false;
    } else if (
      (identifierType === 'email' && !validateEmail(identifier)) ||
      (identifierType === 'phone' && !validatePhone(identifier))
    ) {
      setIdentifierError(identifierType === 'email' ? 'Invalid email format' : 'Invalid phone number format');
      isValid = false;
    }
    
    // Validate password
    if (!validateRequired(password)) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (!validatePassword(password)) {
      setPasswordError('Password must be at least 8 characters');
      isValid = false;
    }
    
    // Additional validation for signup mode
    if (mode === 'signup' && password !== passwordConfirm) {
      setPasswordConfirmError('Passwords do not match');
      isValid = false;
    }
    
    return isValid;
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Clear API error
    clearError();
    
    // Client-side validation
    if (!validateForm()) {
      return;
    }
    
    if (mode === 'login') {
      await login({ identifier, password });
      // Redirect on successful login
      router.push('/channel');
    } else {
      // Signup logic would go here in a real implementation
      console.log('Signup with:', { identifier, password });
      // For now, just switch to login mode
      setMode('login');
    }
  };
  
  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    // Clear form errors when switching modes
    setIdentifierError('');
    setPasswordError('');
    setPasswordConfirmError('');
  };
  
  const toggleIdentifierType = () => {
    setIdentifierType(identifierType === 'email' ? 'phone' : 'email');
    setIdentifier(''); // Clear the field when switching types
    setIdentifierError('');
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-dark-grey mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-medium-grey">
            {mode === 'login' 
              ? 'Sign in to continue to AI Doctor Booking'
              : 'Sign up to start booking medical appointments'
            }
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          {/* Toggle between email and phone */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex border border-light-grey rounded-full overflow-hidden">
              <button
                type="button"
                onClick={() => setIdentifierType('email')}
                className={`px-4 py-2 text-sm font-medium ${
                  identifierType === 'email'
                    ? 'bg-light-grey text-dark-grey'
                    : 'bg-transparent text-dark-grey'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setIdentifierType('phone')}
                className={`px-4 py-2 text-sm font-medium ${
                  identifierType === 'phone'
                    ? 'bg-light-grey text-dark-grey'
                    : 'bg-transparent text-dark-grey'
                }`}
              >
                Phone
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <Input
              id="identifier"
              type={identifierType === 'email' ? 'email' : 'tel'}
              label={identifierType === 'email' ? 'Email' : 'Phone Number'}
              placeholder={identifierType === 'email' ? 'your@email.com' : '+1 (123) 456-7890'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              error={identifierError}
              required
            />
            
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={passwordError}
              required
            />
            
            {mode === 'signup' && (
              <Input
                id="passwordConfirm"
                type="password"
                label="Confirm Password"
                placeholder="Confirm your password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                error={passwordConfirmError}
                required
              />
            )}
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            <Button
              htmlType="submit"
              type="primary"
              fullWidth
              disabled={isLoading}
              className="mt-2"
            >
              {isLoading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-medium-grey">
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
              <button 
                type="button"
                onClick={toggleMode}
                className="ml-1 text-primary font-medium"
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 