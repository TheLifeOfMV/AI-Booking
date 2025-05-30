'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { validateEmail, validateRequired, validatePassword } from '@/utils/validation';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  
  // Form fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  // Validation errors
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Clear errors on unmount
  useEffect(() => {
    return () => clearError();
  }, [clearError]);
  
  const validateForm = (): boolean => {
    let isValid = true;
    
    // Reset errors
    setIdentifierError('');
    setPasswordError('');
    
    // Validate identifier (email)
    if (!validateRequired(identifier)) {
      setIdentifierError('El correo es requerido');
      isValid = false;
    } else if (!validateEmail(identifier)) {
      setIdentifierError('Formato de correo inválido');
      isValid = false;
    }
    
    // Validate password
    if (!validateRequired(password)) {
      setPasswordError('La contraseña es requerida');
      isValid = false;
    } else if (!validatePassword(password)) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
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
    
    // Prepare admin identifier
    const adminIdentifier = `admin-${identifier}`;
    
    try {
      await login({
        identifier: adminIdentifier,
        password,
        role: 'admin'
      });
      
      // Redirect to admin dashboard
      router.push('/admin');
    } catch (err) {
      // Error handling is managed by the store
      console.error('Error durante el login de admin:', err);
    }
  };
  
  return (
    <div className="h-screen max-h-screen overflow-hidden fixed inset-0 flex flex-col" style={{ backgroundColor: '#F0F4F9' }}>
      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-sm">
          {/* Title outside the card for visual hierarchy */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Acceso Administrativo
            </h1>
            <p className="text-medium-grey text-sm">
              Panel de control del sistema
            </p>
          </div>
          
          {/* Main card container with admin styling */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 backdrop-blur-sm relative overflow-hidden">
            {/* Admin indicator */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            
            {/* Admin badge */}
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                🔐 Administrador
              </div>
            </div>
            
            {/* Login form */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <Input
                  label="Correo electrónico administrativo"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  placeholder="admin@medai.com"
                  error={identifierError}
                />
                
                <Input
                  label="Contraseña"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  error={passwordError}
                />
                
                {error && (
                  <div className="py-3 px-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                    {error}
                  </div>
                )}
                
                <Button 
                  type="primary" 
                  className="w-full mt-6 py-3 text-base font-medium bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  htmlType="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Verificando acceso...' : 'Acceder al Panel'}
                </Button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-medium-grey text-xs">
                Acceso restringido • Solo personal autorizado
              </p>
            </div>
            
            {/* Back to main login */}
            <div className="mt-4 text-center">
              <button 
                onClick={() => router.push('/login')}
                className="text-primary hover:text-primary-dark transition-colors duration-200 font-medium text-sm"
              >
                ← Volver al login principal
              </button>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="p-4 border-t border-light-grey text-center">
        <p className="text-xs text-medium-grey">
          &copy; {new Date().getFullYear()} MedAI Admin Panel. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
} 