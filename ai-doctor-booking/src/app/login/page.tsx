'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { validateEmail, validatePhone, validateRequired, validatePassword } from '@/utils/validation';
import { FiX, FiMail, FiCheck } from 'react-icons/fi';

type AuthMode = 'login' | 'signup';
type IdentifierType = 'email' | 'phone';
type UserRole = 'client' | 'doctor';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError, logout } = useAuthStore();
  
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
  
  // Modal states
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [signupMethod, setSignupMethod] = useState<'google' | 'apple' | 'email' | null>(null);
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    dataConsent: false,
    communicationsConsent: false
  });
  const [signupErrors, setSignupErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    dataConsent: ''
  });
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  
  // FIXED: Clear any existing session when component mounts to ensure clean login
  useEffect(() => {
    console.log('LoginPage: Ensuring clean login state');
    logout(); // Clear any existing session
    clearError();
  }, [logout, clearError]);
  
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
    
    try {
      await login({
        identifier: identifier,
        password,
        role: userRole
      });
      
      // FIXED: Explicit redirection based on selected role
      console.log('LoginPage: Login successful, redirecting based on role:', userRole);
      if (userRole === 'doctor') {
        console.log('LoginPage: Redirecting doctor to dashboard');
        router.push('/doctor/dashboard');
      } else {
        console.log('LoginPage: Redirecting client to channel');
        router.push('/channel');
      }
    } catch (err) {
      console.error('LoginPage: Error durante el login:', err);
    }
  };

  // FIXED: Add specialist registration handler
  const handleSpecialistRegistration = () => {
    console.log('LoginPage: Redirecting to specialist registration');
    router.push('/doctor/register');
  };
  
  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setIdentifierError('');
    setPasswordError('');
    setPasswordConfirmError('');
  };
  
  const toggleIdentifierType = () => {
    setIdentifierType(identifierType === 'email' ? 'phone' : 'email');
    setIdentifierError('');
  };

  // Modal handlers
  const openSignupModal = () => {
    setShowSignupModal(true);
    setSignupMethod(null);
    setSignupData({
      email: '',
      password: '',
      confirmPassword: '',
      dataConsent: false,
      communicationsConsent: false
    });
    setSignupErrors({
      email: '',
      password: '',
      confirmPassword: '',
      dataConsent: ''
    });
  };

  const closeSignupModal = () => {
    setShowSignupModal(false);
    setSignupMethod(null);
  };

  const handleSignupMethodSelect = (method: 'google' | 'apple' | 'email') => {
    setSignupMethod(method);
  };

  const handleSignupInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSignupData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear errors when user types
    if (signupErrors[name as keyof typeof signupErrors]) {
      setSignupErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateSignupForm = (): boolean => {
    let isValid = true;
    const errors = {
      email: '',
      password: '',
      confirmPassword: '',
      dataConsent: ''
    };

    // Validate email
    if (!validateRequired(signupData.email)) {
      errors.email = 'El correo es requerido';
      isValid = false;
    } else if (!validateEmail(signupData.email)) {
      errors.email = 'Formato de correo inválido';
      isValid = false;
    }

    // Validate password
    if (!validateRequired(signupData.password)) {
      errors.password = 'La contraseña es requerida';
      isValid = false;
    } else if (!validatePassword(signupData.password)) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
      isValid = false;
    }

    // Validate password confirmation
    if (signupData.password !== signupData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
      isValid = false;
    }

    // Validate data consent (required)
    if (!signupData.dataConsent) {
      errors.dataConsent = 'Debes aceptar el tratamiento de datos para continuar';
      isValid = false;
    }

    setSignupErrors(errors);
    return isValid;
  };

  const handleCreateAccount = async () => {
    if (signupMethod === 'google') {
      console.log('LoginPage: Creating account with Google');
      // Implement Google OAuth
      setIsSignupLoading(true);
      setTimeout(() => {
        setIsSignupLoading(false);
        alert('Registro con Google en desarrollo');
      }, 1000);
    } else if (signupMethod === 'apple') {
      console.log('LoginPage: Creating account with Apple');
      // Implement Apple OAuth
      setIsSignupLoading(true);
      setTimeout(() => {
        setIsSignupLoading(false);
        alert('Registro con Apple en desarrollo');
      }, 1000);
    } else if (signupMethod === 'email') {
      if (!validateSignupForm()) {
        return;
      }

      setIsSignupLoading(true);
      try {
        console.log('LoginPage: Creating account with email:', {
          email: signupData.email,
          dataConsent: signupData.dataConsent,
          communicationsConsent: signupData.communicationsConsent
        });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Close modal and show success
        closeSignupModal();
        alert('Cuenta creada exitosamente. Revisa tu correo para verificar tu cuenta.');
      } catch (error) {
        console.error('LoginPage: Error creating account:', error);
        alert('Error al crear la cuenta. Inténtalo de nuevo.');
      } finally {
        setIsSignupLoading(false);
      }
    }
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden fixed inset-0 flex flex-col" style={{ backgroundColor: '#E6F0FA' }}>
      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-sm">
          {/* Title outside the card for visual hierarchy */}
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Iniciar Sesión
          </h1>
          
          {/* Main card container */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 backdrop-blur-sm">
            {/* ENHANCED: Role selection toggle with better UX */}
            <div className="flex rounded-lg bg-light-grey p-1 mb-6">
              <button 
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  userRole === 'client' 
                    ? 'bg-white text-primary shadow-sm transform scale-[0.98]' 
                    : 'text-medium-grey hover:text-gray-700'
                }`}
                onClick={() => setUserRole('client')}
              >
                Paciente
              </button>
              <button 
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  userRole === 'doctor' 
                    ? 'bg-white text-primary shadow-sm transform scale-[0.98]' 
                    : 'text-medium-grey hover:text-gray-700'
                }`}
                onClick={() => setUserRole('doctor')}
              >
                Doctor
              </button>
            </div>
            
            {/* Login form */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <Input
                  label="Email o teléfono"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  placeholder="email@ejemplo.com"
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
                  className="w-full mt-6 py-3 text-base font-medium"
                  htmlType="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </div>
            </form>

            {/* Patient signup section */}
            {userRole === 'client' && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-medium-grey mb-3">
                    ¿No tienes cuenta?
                  </p>
                  <button
                    type="button"
                    className="py-2 px-4 text-sm font-medium text-primary hover:bg-gray-50 transition-all duration-200 rounded-md"
                    onClick={openSignupModal}
                  >
                    Crear cuenta
                  </button>
                </div>
              </div>
            )}

            {/* FIXED: Enhanced specialist registration section - Only visible for doctor role */}
            {userRole === 'doctor' && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-medium-grey mb-3">
                    ¿Eres especialista médico?
                  </p>
                  <button
                    type="button"
                    className="py-2 px-4 text-sm font-medium text-primary hover:bg-gray-50 transition-all duration-200 rounded-md"
                    onClick={handleSpecialistRegistration}
                  >
                    Registrarse como Especialista
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="p-4 border-t border-light-grey text-center">
        <p className="text-xs text-medium-grey">
          &copy; {new Date().getFullYear()} MedAI. Todos los derechos reservados.
        </p>
      </footer>

      {/* Signup Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Crear cuenta</h2>
              <button
                onClick={closeSignupModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {!signupMethod ? (
                /* Method Selection */
                <div className="space-y-4">
                  <p className="text-sm text-medium-grey text-center mb-6">
                    Elige cómo quieres crear tu cuenta
                  </p>

                  {/* Google Option */}
                  <button
                    onClick={() => handleSignupMethodSelect('google')}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-medium">Continuar con Google</span>
                  </button>

                  {/* Apple Option */}
                  <button
                    onClick={() => handleSignupMethodSelect('apple')}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <span className="text-sm font-medium">Continuar con Apple</span>
                  </button>

                  {/* Email Option */}
                  <button
                    onClick={() => handleSignupMethodSelect('email')}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FiMail size={20} />
                    <span className="text-sm font-medium">Registrarse con email</span>
                  </button>
                </div>
              ) : signupMethod === 'email' ? (
                /* Email Registration Form */
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={() => setSignupMethod(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ←
                    </button>
                    <h3 className="text-lg font-medium">Registro con email</h3>
                  </div>

                  <Input
                    label="Correo electrónico"
                    name="email"
                    type="email"
                    value={signupData.email}
                    onChange={handleSignupInputChange}
                    placeholder="tu@email.com"
                    error={signupErrors.email}
                    required
                  />

                  <Input
                    label="Contraseña"
                    name="password"
                    type="password"
                    value={signupData.password}
                    onChange={handleSignupInputChange}
                    placeholder="••••••••"
                    error={signupErrors.password}
                    required
                  />

                  <Input
                    label="Confirmar contraseña"
                    name="confirmPassword"
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={handleSignupInputChange}
                    placeholder="••••••••"
                    error={signupErrors.confirmPassword}
                    required
                  />

                  {/* Consent Checkboxes */}
                  <div className="space-y-3 pt-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="dataConsent"
                          checked={signupData.dataConsent}
                          onChange={handleSignupInputChange}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          signupData.dataConsent 
                            ? 'bg-primary border-primary' 
                            : 'border-gray-300 hover:border-primary'
                        }`}>
                          {signupData.dataConsent && (
                            <FiCheck size={12} className="text-white" />
                          )}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-700">
                          Acepto que MedAI trate mis datos para usar los servicios
                        </span>
                        <span className="text-red-500 ml-1">*</span>
                      </div>
                    </label>
                    {signupErrors.dataConsent && (
                      <p className="text-red-500 text-xs ml-8">{signupErrors.dataConsent}</p>
                    )}

                    <label className="flex items-start gap-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="communicationsConsent"
                          checked={signupData.communicationsConsent}
                          onChange={handleSignupInputChange}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          signupData.communicationsConsent 
                            ? 'bg-primary border-primary' 
                            : 'border-gray-300 hover:border-primary'
                        }`}>
                          {signupData.communicationsConsent && (
                            <FiCheck size={12} className="text-white" />
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-700">
                        Quiero recibir comunicaciones de la app (opcional)
                      </span>
                    </label>
                  </div>

                  <Button
                    type="primary"
                    className="w-full mt-6 py-3 text-base font-medium"
                    onClick={handleCreateAccount}
                    disabled={isSignupLoading}
                  >
                    {isSignupLoading ? 'Creando cuenta...' : 'Crear cuenta'}
                  </Button>
                </div>
              ) : (
                /* OAuth confirmation */
                <div className="text-center space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={() => setSignupMethod(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ←
                    </button>
                    <h3 className="text-lg font-medium">
                      Continuar con {signupMethod === 'google' ? 'Google' : 'Apple'}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-medium-grey mb-6">
                    Se abrirá una ventana para completar el registro
                  </p>

                  <Button
                    type="primary"
                    className="w-full py-3 text-base font-medium"
                    onClick={handleCreateAccount}
                    disabled={isSignupLoading}
                  >
                    {isSignupLoading ? 'Procesando...' : `Continuar con ${signupMethod === 'google' ? 'Google' : 'Apple'}`}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 