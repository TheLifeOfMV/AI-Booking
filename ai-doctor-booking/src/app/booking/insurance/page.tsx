'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '../../../store/bookingStore';

const InsuranceProvidersPage = () => {
  const router = useRouter();
  const { setSelectedInsurance } = useBookingStore();
  
  // Insurance providers with logo URLs
  const [insuranceProviders, setInsuranceProviders] = useState([
    { id: '1', name: 'Colsanitas', logoUrl: '/insurance/colsanitas.jpg' },
    { id: '2', name: 'Sura', logoUrl: '/insurance/sura.jpg' },
    { id: '3', name: 'Nueva EPS', logoUrl: '/insurance/nueva-eps.jpg' },
    { id: '4', name: 'Compensar', logoUrl: '/insurance/compensar.jpg' },
    { id: '5', name: 'Famisanar', logoUrl: '/insurance/famisanar.jpg' },
    { id: '6', name: 'Medimás', logoUrl: '/insurance/medimas.jpg' },
    { id: '7', name: 'Sanitas', logoUrl: '/insurance/sanitas.jpg' },
    { id: '8', name: 'Salud Total', logoUrl: '/insurance/salud-total.jpg' },
  ]);

  // Handle provider selection
  const handleProviderSelect = (providerName: string) => {
    setSelectedInsurance(providerName);
    router.push('/booking/unified');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="px-4 pt-8 pb-4 flex flex-col h-screen">
        {/* Title Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-dark-grey mb-2">Proveedor de seguro</h2>
          <p className="text-medium-grey">Selecciona tu proveedor de seguro para continuar</p>
        </div>
        
        {/* Insurance Providers Grid */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {insuranceProviders.map((provider) => (
            <div 
              key={provider.id} 
              className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center border-2 border-transparent hover:border-primary hover:shadow-lg transition-all cursor-pointer h-28"
              onClick={() => handleProviderSelect(provider.name)}
            >
              <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                {/* Fallback to a generic icon if no image is available */}
                <svg className="w-8 h-8 text-primary" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 16V8.00002C20.9996 7.6493 20.9071 7.30483 20.7315 7.00119C20.556 6.69754 20.3037 6.44539 20 6.27002L13 2.27002C12.696 2.09449 12.3511 2.00208 12 2.00208C11.6489 2.00208 11.304 2.09449 11 2.27002L4 6.27002C3.69626 6.44539 3.44398 6.69754 3.26846 7.00119C3.09294 7.30483 3.00036 7.6493 3 8.00002V16C3.00036 16.3508 3.09294 16.6952 3.26846 16.9989C3.44398 17.3025 3.69626 17.5547 4 17.73L11 21.73C11.304 21.9056 11.6489 21.998 12 21.998C12.3511 21.998 12.696 21.9056 13 21.73L20 17.73C20.3037 17.5547 20.556 17.3025 20.7315 16.9989C20.9071 16.6952 20.9996 16.3508 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="text-center">
                <h3 className="font-medium text-dark-grey">{provider.name}</h3>
              </div>
            </div>
          ))}
        </div>
        
        {/* Additional Information */}
        <div className="mt-auto bg-blue-50 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary flex-shrink-0 mr-3">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <h3 className="font-medium text-dark-grey">Tarjeta de seguro</h3>
              <p className="text-sm text-medium-grey mt-1">Por favor, ten tu tarjeta de seguro a mano el día de tu cita. Tu identificación será verificada al registrarte.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceProvidersPage; 