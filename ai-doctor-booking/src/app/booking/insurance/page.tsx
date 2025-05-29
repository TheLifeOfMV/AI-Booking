'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Insurance providers with logo URLs
const insuranceProviders = [
  { id: '1', name: 'Colsanitas', logoUrl: '/insurance/colsanitas.jpg' },
  { id: '2', name: 'SURA', logoUrl: '/insurance/sura.jpg' },
  { id: '3', name: 'Nueva EPS', logoUrl: '/insurance/nueva-eps.jpg' },
  { id: '4', name: 'Compensar', logoUrl: '/insurance/compensar.jpg' },
  { id: '5', name: 'Aliansalud', logoUrl: '/insurance/famisanar.jpg' },
  { id: '6', name: 'Coomeva', logoUrl: '/insurance/medimas.jpg' },
  { id: '7', name: 'Sanitas', logoUrl: '/insurance/sanitas.jpg' },
  { id: '8', name: 'Salud Total', logoUrl: '/insurance/salud-total.jpg' },
];

export default function InsurancePage() {
  const router = useRouter();
  const [selectedProvider, setSelectedProvider] = useState<string>('6'); // Coomeva preselected
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
  };

  const handleContinue = () => {
    router.push('/booking/unified');
  };

  const handleBack = () => {
    router.back();
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // Show modal automatically when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen max-h-screen overflow-hidden fixed inset-0" style={{ backgroundColor: '#F0F4F9' }}>
      {/* Header with back button */}
      <div className="flex items-center justify-between p-4 pb-2">
        <button
          onClick={handleBack}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-transparent hover:bg-white/20 transition-all"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-dark-grey" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="px-4 pt-2 pb-4 flex flex-col h-full">
        {/* Title Section */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-dark-grey mb-1">Proveedor de seguro</h2>
          <p className="text-medium-grey text-sm">Selecciona tu proveedor de seguro para continuar</p>
        </div>
        
        {/* Insurance Grid */}
        <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
          <div className="grid grid-cols-2 gap-3 mb-3">
            {insuranceProviders.map((provider) => (
              <div
                key={provider.id}
                onClick={() => handleProviderSelect(provider.id)}
                className={`bg-white rounded-xl p-4 cursor-pointer transition-all border-2 ${
                  selectedProvider === provider.id
                    ? 'border-primary shadow-lg'
                    : 'border-transparent shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 16V8.00002C20.9996 7.6493 20.9071 7.30483 20.7315 7.00119C20.556 6.69754 20.3037 6.44539 20 6.27002L13 2.27002C12.696 2.09449 12.3511 2.00208 12 2.00208C11.6489 2.00208 11.304 2.09449 11 2.27002L4 6.27002C3.69626 6.44539 3.44398 6.69754 3.26846 7.00119C3.09294 7.30483 3.00036 7.6493 3 8.00002V16C3.00036 16.3508 3.09294 16.6952 3.26846 16.9989C3.44398 17.3025 3.69626 17.5547 4 17.73L11 21.73C11.304 21.9056 11.6489 21.998 12 21.998C12.3511 21.998 12.696 21.9056 13 21.73L20 17.73C20.3037 17.5547 20.556 17.3025 20.7315 16.9989C20.9071 16.6952 20.9996 16.3508 21 16Z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="font-medium text-sm text-center text-dark-grey">{provider.name}</h3>
                </div>
              </div>
            ))}
          </div>
          
          {/* Continue Button - Now in the position where the card was */}
          <div className="mt-2">
            <button
              onClick={handleContinue}
              disabled={!selectedProvider}
              className="w-full bg-primary text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-all"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>

      {/* Modal Popout - Insurance Card Information */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center mr-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#3B82F6" strokeWidth="2"/>
                    <path d="m9 12 2 2 4-4" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="font-bold text-lg text-dark-grey">Tarjeta de seguro</h3>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6l12 12" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="mb-6">
              <p className="text-medium-grey text-sm leading-relaxed">
                Por favor ten tu tarjeta de seguro a la mano el día de tu cita. O el numero de vinculación de tu seguro. Tu identificación será verificada al registrarte.
              </p>
            </div>
            
            {/* Modal Action */}
            <button
              onClick={closeModal}
              className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 