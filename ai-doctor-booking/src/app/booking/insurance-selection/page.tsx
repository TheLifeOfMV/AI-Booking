'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '../../../store/bookingStore';

const InsuranceSelectionPage = () => {
  const router = useRouter();
  const { setHasInsurance } = useBookingStore();
  
  // Handle insurance selection
  const handleSelectInsurance = () => {
    setHasInsurance(true);
    router.push('/booking/insurance');
  };
  
  // Handle private appointment selection
  const handleSelectPrivate = () => {
    setHasInsurance(false);
    router.push('/booking/unified');
  };

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

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
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-dark-grey mb-1">¿Tienes seguro médico?</h2>
          <p className="text-medium-grey">Selecciona una opción para continuar</p>
        </div>
        
        <div className="flex flex-col gap-0 max-w-lg mx-auto w-full flex-1 justify-start pt-8">
          {/* Insurance Option Card */}
          <div 
            className="bg-white rounded-xl shadow-md p-5 border-2 border-transparent hover:border-primary hover:shadow-lg transition-all cursor-pointer relative"
            onClick={handleSelectInsurance}
          >
            <div className="flex items-center mb-2">
              <div className="w-11 h-11 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 16V8.00002C20.9996 7.6493 20.9071 7.30483 20.7315 7.00119C20.556 6.69754 20.3037 6.44539 20 6.27002L13 2.27002C12.696 2.09449 12.3511 2.00208 12 2.00208C11.6489 2.00208 11.304 2.09449 11 2.27002L4 6.27002C3.69626 6.44539 3.44398 6.69754 3.26846 7.00119C3.09294 7.30483 3.00036 7.6493 3 8.00002V16C3.00036 16.3508 3.09294 16.6952 3.26846 16.9989C3.44398 17.3025 3.69626 17.5547 4 17.73L11 21.73C11.304 21.9056 11.6489 21.998 12 21.998C12.3511 21.998 12.696 21.9056 13 21.73L20 17.73C20.3037 17.5547 20.556 17.3025 20.7315 16.9989C20.9071 16.6952 20.9996 16.3508 21 16Z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="font-semibold text-lg text-dark-grey">Seguro médico</h3>
            </div>
            
            <div className="mb-3">
              <p className="text-medium-grey ml-14 text-sm leading-relaxed">
                Usa tu seguro médico para tu consulta.
                Selecciona tu proveedor de seguro en el siguiente paso.
              </p>
            </div>
            
            <div className="text-right pt-1">
              <span className="text-primary font-medium">Seleccionar &rarr;</span>
            </div>
          </div>
          
          {/* Private Option Card */}
          <div 
            className="bg-white rounded-xl shadow-md p-5 border-2 border-transparent hover:border-primary hover:shadow-lg transition-all cursor-pointer relative mt-6"
            onClick={handleSelectPrivate}
          >
            <div className="flex items-center mb-2">
              <div className="w-11 h-11 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5v2" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 11v2" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 17v2" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 12h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="font-semibold text-lg text-dark-grey">Cita particular</h3>
            </div>
            
            <div className="mb-3">
              <p className="text-medium-grey ml-14 text-sm leading-relaxed">
                Agenda tu consulta sin usar seguro médico.
                Consulta particular sin cobertura de seguro.
              </p>
            </div>
            
            <div className="text-right pt-1">
              <span className="text-primary font-medium">Seleccionar &rarr;</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceSelectionPage; 