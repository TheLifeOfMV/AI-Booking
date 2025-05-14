'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { validateEmail, validatePhone, validateRequired, validatePassword } from '@/utils/validation';

type AuthMode = 'login' | 'signup';
type IdentifierType = 'email' | 'phone';
type UserRole = 'client' | 'doctor' | 'admin';

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
  
  // Clear errors on unmount
  useEffect(() => {
    return () => clearError();
  }, [clearError]);
  
  const validateForm = (): boolean => {
    let isValid = true;
    
    // Reset errors
    setIdentifierError('');
    setPasswordError('');
    setPasswordConfirmError('');
    
    // Validate identifier (email or phone)
    if (!validateRequired(identifier)) {
      setIdentifierError(identifierType === 'email' ? 'El correo es requerido' : 'El número de teléfono es requerido');
      isValid = false;
    } else if (
      (identifierType === 'email' && !validateEmail(identifier)) ||
      (identifierType === 'phone' && !validatePhone(identifier))
    ) {
      setIdentifierError(identifierType === 'email' ? 'Formato de correo inválido' : 'Formato de teléfono inválido');
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
    
    // Additional validation for signup mode
    if (mode === 'signup' && password !== passwordConfirm) {
      setPasswordConfirmError('Las contraseñas no coinciden');
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
    
    // Prepare identifier based on login mode
    let loginIdentifier = identifier;
    
    // For demo, add admin to identifier if admin role is selected
    if (userRole === 'admin') {
      loginIdentifier = `admin-${identifier}`;
    }
    
    try {
      await login({
        identifier: loginIdentifier,
        password,
        role: userRole // Añadimos el rol para saber a dónde redirigir
      });
      
      // Redirigir basado en el rol seleccionado
      if (userRole === 'admin') {
        router.push('/admin');
      } else if (userRole === 'doctor') {
        // Comprobación para determinar si el doctor necesita registrarse
        // En un caso real, esto debería venir del backend
        // Para propósitos de la demo, siempre lo enviamos a registrarse primero
        router.push('/doctor/register');
      } else {
        router.push('/channel');
      }
    } catch (err) {
      // Error handling is managed by the store
      console.error('Error durante el login:', err);
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
    if (userRole === 'admin') {
      setUserRole('client');
    } else if (userRole === 'client') {
      setUserRole('doctor');
    } else {
      setUserRole('admin');
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center mb-8">
            Iniciar Sesión
          </h1>
          
          {/* Role selection toggle */}
          <div className="flex rounded-lg bg-light-grey p-1 mb-8">
            <button 
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                userRole === 'client' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-medium-grey'
              }`}
              onClick={() => setUserRole('client')}
            >
              Paciente
            </button>
            <button 
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                userRole === 'doctor' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-medium-grey'
              }`}
              onClick={() => setUserRole('doctor')}
            >
              Doctor
            </button>
            <button 
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                userRole === 'admin' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-medium-grey'
              }`}
              onClick={() => setUserRole('admin')}
            >
              Admin
            </button>
          </div>
          
          {/* Login form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                label="Email o teléfono"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                placeholder={userRole === 'admin' ? "admin@example.com" : "email@ejemplo.com"}
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
                <div className="py-2 px-3 bg-red-50 text-red-500 text-sm rounded-lg">
                  {error}
                </div>
              )}
              
              <Button 
                type="primary" 
                className="w-full"
                htmlType="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </div>
          </form>
          
          {userRole === 'doctor' && (
            <div className="mt-4 text-center">
              <Link 
                href="/doctor/register" 
                className="text-primary hover:underline"
              >
                ¿Eres especialista? Regístrate aquí
              </Link>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-medium-grey text-sm">
              ¿Necesitas ayuda? <a href="#" className="text-primary hover:underline">Contáctanos</a>
            </p>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="p-4 border-t border-light-grey text-center">
        <p className="text-xs text-medium-grey">
          &copy; {new Date().getFullYear()} MedAI. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
} 