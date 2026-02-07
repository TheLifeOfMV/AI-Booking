"use client";

import React, { useState, useEffect } from 'react';
import { Doctor, CredentialStatus } from '@/types/doctor';
import { updateDoctor } from '@/services/doctorService';
import { useToast } from '@/components/ToastProvider';
import ProfileStep from './steps/ProfileStep';
import SpecialtiesStep from './steps/SpecialtiesStep';
import AvailabilityStep from './steps/AvailabilityStep';

interface DoctorEditModalProps {
  isOpen: boolean;
  doctor: Doctor;
  onClose: () => void;
  onSave: (doctor: Doctor) => void;
}

/**
 * Multi-step edit modal for doctors
 * 
 * Allows editing of doctor details including:
 * - Basic profile information (step 1)
 * - Specialty and credentials (step 2)
 * - Availability and fees (step 3)
 * 
 * Features UI optimistic updates for a seamless user experience
 */
const DoctorEditModal: React.FC<DoctorEditModalProps> = ({
  isOpen,
  doctor,
  onClose,
  onSave,
}) => {
  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // Form state - initialize with current doctor data
  const [formData, setFormData] = useState<Doctor>(doctor || {} as Doctor);
  
  // Original data for optimistic UI reversal if needed
  const [originalData, setOriginalData] = useState<Doctor>(doctor || {} as Doctor);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Change confirmation state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Toast notification
  const { showToast } = useToast();
  
  // Initialize form data when doctor changes
  useEffect(() => {
    if (doctor) {
      setFormData({ ...doctor });
      setOriginalData({ ...doctor });
    }
  }, [doctor]);
  
  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasUnsavedChanges(hasChanges);
  }, [formData, originalData]);

  // Skip rendering if not open
  if (!isOpen) return null;
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // For nested properties, use a split
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      
      if (parent === 'credentials') {
        setFormData({
          ...formData,
          credentials: {
            ...formData.credentials,
            [child]: value,
          },
        });
      }
    } else {
      // Convert to number if it's a number input
      const finalValue = type === 'number' ? parseFloat(value) : value;
      
      // Handle checkbox
      if (type === 'checkbox') {
        setFormData({
          ...formData,
          [name]: (e.target as HTMLInputElement).checked,
        });
      } else {
        setFormData({
          ...formData,
          [name]: finalValue,
        });
      }
    }
    
    // Clear any error when a field is changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };
  
  // Handle specialty change
  const handleSpecialtyChange = (specialtyId: string, specialtyName: string) => {
    setFormData({
      ...formData,
      specialtyId,
      specialtyName
    });
    
    // Clear specialty error if exists
    if (errors.specialtyId) {
      setErrors({
        ...errors,
        specialtyId: '',
      });
    }
  };
  
  // Handle credential status change
  const handleCredentialStatusChange = (status: CredentialStatus) => {
    setFormData({
      ...formData,
      credentials: {
        ...formData.credentials,
        status,
        ...(status === 'verified' ? { verifiedAt: new Date().toISOString() } : {}),
      },
    });
  };
  
  // Handle availability change
  const handleAvailabilityChange = (availableTimes: Doctor['availableTimes']) => {
    setFormData({
      ...formData,
      availableTimes
    });
  };
  
  // Validate form data for the current step
  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      // Validate Step 1: Profile Information
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Valid email is required';
      }
      
      if (!formData.phone?.trim()) {
        newErrors.phone = 'Phone is required';
      }
    } else if (currentStep === 2) {
      // Validate Step 2: Specialty and Credentials
      if (!formData.specialtyId) {
        newErrors.specialtyId = 'Specialty is required';
      }
      
      if (!formData.credentials.licenseNumber.trim()) {
        newErrors['credentials.licenseNumber'] = 'License number is required';
      }
      
      if (!formData.credentials.expiryDate.trim()) {
        newErrors['credentials.expiryDate'] = 'Expiry date is required';
      }
    } else if (currentStep === 3) {
      // Validate Step 3: Availability and Fees
      if (!formData.experience.trim()) {
        newErrors.experience = 'Experience information is required';
      }
      
      if (!formData.consultationFee || formData.consultationFee <= 0) {
        newErrors.consultationFee = 'Valid consultation fee is required';
      }
      
      if (!formData.availableTimes || formData.availableTimes.length === 0) {
        newErrors.availableTimes = 'At least one availability slot is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle next step
  const handleNextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };
  
  // Handle previous step
  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  // Handle cancel
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowConfirmDialog(true);
    } else {
      onClose();
    }
  };
  
  // Confirm discard changes
  const confirmDiscard = () => {
    setShowConfirmDialog(false);
    onClose();
  };
  
  // Cancel discard changes
  const cancelDiscard = () => {
    setShowConfirmDialog(false);
  };
  
  // Handle saving the form with optimistic updates
  const handleSave = async () => {
    if (!validateStep()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    // Optimistically update the UI
    onSave(formData);
    
    try {
      const updatedDoctor = await updateDoctor(doctor.id, formData);
      
      // Show success message
      showToast('success', 'Doctor updated successfully');
      
      // Close the modal
      onClose();
    } catch (err: any) {
      // Revert the optimistic update
      onSave(originalData);
      
      // Show error message
      setError(err.message || 'An error occurred while saving');
      showToast('error', err.message || 'Failed to update doctor');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get the current step progress percentage
  const getProgressPercentage = () => {
    return ((currentStep - 1) / (totalSteps - 1)) * 100;
  };
  
  // Render the step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProfileStep 
            formData={formData} 
            errors={errors} 
            handleChange={handleChange} 
          />
        );
      case 2:
        return (
          <SpecialtiesStep 
            formData={formData} 
            errors={errors} 
            handleChange={handleChange}
            handleSpecialtyChange={handleSpecialtyChange}
            handleCredentialStatusChange={handleCredentialStatusChange}
          />
        );
      case 3:
        return (
          <AvailabilityStep 
            formData={formData} 
            errors={errors} 
            handleChange={handleChange}
            handleAvailabilityChange={handleAvailabilityChange}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Modal header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-dark-grey">Edit Doctor</h2>
          <button
            onClick={handleCancel}
            className="text-medium-grey hover:text-dark-grey"
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        {/* Progress indicator */}
        <div className="w-full h-1 bg-light-grey">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
        
        <div className="flex">
          {/* Step indicator */}
          <div className="w-64 bg-light-grey p-4 flex flex-col">
            <div className="space-y-3 flex-1">
              <button
                onClick={() => setCurrentStep(1)}
                className={`w-full text-left p-3 rounded-md transition-colors duration-200 ${
                  currentStep === 1 ? 'bg-primary text-white' : 'hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    currentStep === 1 ? 'bg-white text-primary' : 'bg-gray-300 text-medium-grey'
                  }`}>
                    1
                  </div>
                  <span>Basic Information</span>
                </div>
              </button>
              
              <button
                onClick={() => validateStep() && setCurrentStep(2)}
                className={`w-full text-left p-3 rounded-md transition-colors duration-200 ${
                  currentStep === 2 ? 'bg-primary text-white' : 'hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    currentStep === 2 ? 'bg-white text-primary' : 'bg-gray-300 text-medium-grey'
                  }`}>
                    2
                  </div>
                  <span>Specialty & Credentials</span>
                </div>
              </button>
              
              <button
                onClick={() => validateStep() && setCurrentStep(3)}
                className={`w-full text-left p-3 rounded-md transition-colors duration-200 ${
                  currentStep === 3 ? 'bg-primary text-white' : 'hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    currentStep === 3 ? 'bg-white text-primary' : 'bg-gray-300 text-medium-grey'
                  }`}>
                    3
                  </div>
                  <span>Availability & Settings</span>
                </div>
              </button>
            </div>
            
            {/* Doctor meta info */}
            <div className="mt-8 text-sm text-medium-grey">
              <div className="mb-1"><strong>ID:</strong> {doctor.id}</div>
              {doctor.createdAt && (
                <div><strong>Created:</strong> {new Date(doctor.createdAt).toLocaleDateString()}</div>
              )}
            </div>
          </div>
          
          {/* Form */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[70vh]">
            {renderStepContent()}
            
            {/* Error message */}
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded-md">
                {error}
              </div>
            )}
            
            {/* Form footer */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-4 py-2 border border-gray-300 text-medium-grey rounded-md hover:bg-gray-50 transition-colors duration-200"
                    disabled={isLoading}
                  >
                    Previous
                  </button>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 text-medium-grey rounded-md hover:bg-gray-50 transition-colors duration-200"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center"
                    disabled={isLoading}
                  >
                    Next
                    <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-6 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        Save
                        <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Confirmation Dialog for unsaved changes */}
        {showConfirmDialog && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-dark-grey">Discard changes?</h3>
              <p className="text-medium-grey mb-6">
                You have unsaved changes that will be lost if you close this editor.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDiscard}
                  className="px-4 py-2 border border-gray-300 text-medium-grey rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDiscard}
                  className="px-4 py-2 bg-accent-orange text-white rounded-md hover:bg-orange-600"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorEditModal; 