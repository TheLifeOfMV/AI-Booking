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
type UserRole = 'client' | 'doctor';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [identifierType, setIdentifierType] = useState<IdentifierType>('email');
  const [userRole, setUserRole] = useState<UserRole>('client');
  
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
    // Don't clear the field when switching - better UX
    setIdentifierError('');
  };
  
  const toggleRole = () => {
    setUserRole(userRole === 'client' ? 'doctor' : 'client');
  };
  
  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center bg-gray-50 py-4 px-4 overflow-hidden">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
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
        
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {/* Role selection toggle */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex border border-light-grey rounded-full overflow-hidden">
              <button
                type="button"
                onClick={() => setUserRole('client')}
                className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  userRole === 'client'
                    ? 'bg-gradient-to-r from-blue-50 to-white text-dark-grey'
                    : 'bg-transparent text-dark-grey hover:bg-blue-50'
                }`}
              >
                Client
              </button>
              <button
                type="button"
                onClick={() => setUserRole('doctor')}
                className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  userRole === 'doctor'
                    ? 'bg-gradient-to-r from-blue-50 to-white text-dark-grey'
                    : 'bg-transparent text-dark-grey hover:bg-blue-50'
                }`}
              >
                Doctor
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* First input group with inline toggle */}
            <div className="mb-4">
              <div className="mb-2">
                <button
                  type="button"
                  onClick={toggleIdentifierType}
                  className="group block text-sm font-medium text-dark-grey hover:text-dark-grey focus:outline-none flex items-center gap-1 transition-colors duration-200"
                  aria-haspopup="true"
                  aria-label={`Switch to ${identifierType === 'email' ? 'phone' : 'email'} input`}
                >
                  {identifierType === 'email' ? 'Email' : 'Phone Number'}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>
              </div>
              
              <input
                id="identifier"
                type={identifierType === 'email' ? 'email' : 'tel'}
                placeholder={identifierType === 'email' ? 'example@domain.com' : '(123) 456-7890'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className={`w-full px-4 py-2 border ${identifierError ? 'border-red-500' : 'border-light-grey'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300`}
                required
              />
              {identifierError && (
                <p className="mt-1 text-xs text-red-500">{identifierError}</p>
              )}
            </div>
            
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
              className="mt-2 transition-all duration-300 hover:shadow-md"
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
        
        {/* Info section */}
        <div className="text-center text-xs text-medium-grey mt-4">
          <p className="mt-1 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Your data is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
} 