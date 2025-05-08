'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useBookingStore } from '../../../store/bookingStore';

const InsuranceSelectionPage = () => {
  const router = useRouter();
  const { hasInsurance, setHasInsurance, selectedInsurance, setSelectedInsurance } = useBookingStore();
  
  // Local state to manage dropdown visibility
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  
  // User profile data (same as in unified page)
  const [user, setUser] = useState({
    name: 'Arepa Deal',
    avatarUrl: '/doctors/doctor1.jpg',
    notificationCount: 3
  });
  
  // Insurance providers list
  const [insuranceProviders, setInsuranceProviders] = useState([
    'Medicare',
    'Medicaid',
    'Aetna',
    'Blue Cross Blue Shield',
    'Cigna',
    'Humana',
    'Kaiser Permanente',
    'UnitedHealthcare'
  ]);
  
  // Set proper initial values
  useEffect(() => {
    if (hasInsurance === null) {
      setHasInsurance(false);
    }
  }, [hasInsurance, setHasInsurance]);
  
  // Handler for insurance toggle
  const handleInsuranceToggle = (value: boolean) => {
    setHasInsurance(value);
    // If user selects No, we hide the dropdown
    if (!value) {
      setShowProviderDropdown(false);
    }
  };
  
  // Handler for provider selection
  const handleProviderSelect = (provider: string) => {
    setSelectedInsurance(provider);
    setShowProviderDropdown(false);
  };
  
  // Handler for continue button
  const handleContinue = () => {
    // If user has insurance but hasn't selected a provider, show dropdown
    if (hasInsurance && !selectedInsurance) {
      setShowProviderDropdown(true);
      return;
    }
    
    // Navigate to unified booking view
    router.push('/booking/unified');
  };
  
  // Get current time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  return (
    <>
      {/* Profile Header - Matching the unified booking view */}
      <header className="bg-white p-4 border-b border-light-grey">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-light-grey rounded-full overflow-hidden mr-3">
              <Image 
                src={user.avatarUrl} 
                alt={user.name}
                width={40}
                height={40}
                className="object-cover w-full h-full"
                onError={(e) => {
                  // Aseguramos que no se cree un loop de errores usando una imagen que existe
                  const target = e.target as HTMLImageElement;
                  // Solo cambiamos la imagen una vez para evitar bucles
                  if (!target.src.includes('/doctors/doctor2.jpg')) {
                    target.src = '/doctors/doctor2.jpg';
                  }
                  // Si también hay error con la imagen de respaldo, evitamos más intentos
                  target.onerror = null;
                }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-dark-grey text-sm">{user.name}</h3>
              <p className="text-xs text-medium-grey">{getGreeting()}</p>
            </div>
          </div>
          <div className="relative">
            <button className="w-10 h-10 bg-light-grey rounded-full flex items-center justify-center">
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" 
                  fill="#4B5563"
                />
              </svg>
            </button>
            {user.notificationCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white rounded-full text-xs flex items-center justify-center font-medium">
                {user.notificationCount}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-6 pb-20 bg-gray-50">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-dark-grey mb-2">Insurance Information</h1>
          <p className="text-medium-grey">Please provide your insurance details to continue</p>
        </div>
        
        {/* Insurance Question Card */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <h2 className="text-lg font-semibold text-dark-grey mb-4">Do you have medical insurance?</h2>
          
          {/* Yes/No Toggle */}
          <div className="inline-flex rounded-full overflow-hidden border border-light-grey">
            <button 
              className={`py-2 px-6 text-sm font-medium transition-colors ${
                hasInsurance 
                  ? 'bg-primary text-white' 
                  : 'bg-white text-dark-grey'
              }`}
              onClick={() => handleInsuranceToggle(true)}
            >
              Yes
            </button>
            <button 
              className={`py-2 px-6 text-sm font-medium transition-colors ${
                hasInsurance === false 
                  ? 'bg-primary text-white' 
                  : 'bg-white text-dark-grey'
              }`}
              onClick={() => handleInsuranceToggle(false)}
            >
              No
            </button>
          </div>
          
          {/* Explanation text */}
          <p className="mt-3 text-sm text-medium-grey">
            {hasInsurance 
              ? 'Select your insurance provider below' 
              : 'You can still book appointments without insurance. Payment will be required at the time of service.'}
          </p>
        </div>
        
        {/* Insurance Provider Selection - Only show when "Yes" is selected */}
        {hasInsurance && (
          <div className="bg-white rounded-xl shadow-sm p-5 mb-8">
            <h2 className="text-lg font-semibold text-dark-grey mb-4">Select your insurance provider</h2>
            
            {/* Provider Selector Button */}
            <div className="relative">
              <button 
                className="w-full flex items-center justify-between bg-light-grey rounded-lg py-3 px-4 text-dark-grey focus:outline-none"
                onClick={() => setShowProviderDropdown(!showProviderDropdown)}
              >
                <span>{selectedInsurance || 'Select provider'}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              {/* Provider Dropdown */}
              {showProviderDropdown && (
                <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-10 max-h-60 overflow-y-auto">
                  {insuranceProviders.map((provider, index) => (
                    <button 
                      key={index}
                      className="w-full text-left px-4 py-3 hover:bg-light-grey text-dark-grey border-b border-light-grey last:border-b-0"
                      onClick={() => handleProviderSelect(provider)}
                    >
                      {provider}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Visual card with insurance ID explanation */}
            <div className="mt-6 p-4 bg-light-grey rounded-lg border border-dashed border-medium-grey">
              <div className="flex items-start">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary flex-shrink-0 mr-3">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <h3 className="font-medium text-dark-grey">Insurance card</h3>
                  <p className="text-sm text-medium-grey mt-1">Please have your insurance card ready on the day of your appointment. Your ID will be verified at check-in.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Continue Button */}
        <button 
          className="w-full py-3 px-4 rounded-lg font-medium bg-primary text-white flex items-center justify-center"
          onClick={handleContinue}
        >
          Continue <span className="ml-2">›</span>
        </button>
      </div>
    </>
  );
};

export default InsuranceSelectionPage; 