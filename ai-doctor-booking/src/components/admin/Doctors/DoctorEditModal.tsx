"use client";

import React, { useState, useEffect } from 'react';
import { Doctor, CredentialStatus } from '@/types/doctor';
import { SPECIALTIES } from '@/services/doctorService';

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
 * - Basic profile information
 * - Specialty and credentials
 * - Availability and fees
 */
const DoctorEditModal: React.FC<DoctorEditModalProps> = ({
  isOpen,
  doctor,
  onClose,
  onSave,
}) => {
  // Skip rendering if not open
  if (!isOpen) return null;
  
  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // Form state - initialize with current doctor data
  const [formData, setFormData] = useState<Doctor>({ ...doctor });
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Specialties state
  const [specialties, setSpecialties] = useState(SPECIALTIES);
  
  // Load specialties
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await fetch('/api/admin/doctors/specialties');
        if (response.ok) {
          const data = await response.json();
          setSpecialties(data.specialties);
        }
      } catch (error) {
        console.error('Error fetching specialties:', error);
        // Fall back to mock data already loaded
      }
    };
    
    fetchSpecialties();
  }, []);
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // For nested properties, use a switch statement
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
      
      // Handle approval checkbox
      if (name === 'approvalStatus') {
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
      
      if (!formData.phone.trim()) {
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
  
  // Handle saving the form
  const handleSave = async () => {
    if (!validateStep()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/doctors/${doctor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save doctor information');
      }
      
      const data = await response.json();
      
      // Call the onSave handler with the updated doctor
      onSave(data.doctor);
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render the step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-dark-grey mb-4">Basic Information</h2>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-dark-grey mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`w-full p-2 border ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:ring-primary focus:border-primary`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-grey mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-2 border ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:ring-primary focus:border-primary`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-dark-grey mb-1">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full p-2 border ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:ring-primary focus:border-primary`}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-dark-grey mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-dark-grey mb-4">Specialty & Credentials</h2>
            
            <div>
              <label htmlFor="specialtyId" className="block text-sm font-medium text-dark-grey mb-1">
                Specialty
              </label>
              <select
                id="specialtyId"
                name="specialtyId"
                value={formData.specialtyId}
                onChange={(e) => {
                  const selectedSpecialty = specialties.find(s => s.id === e.target.value);
                  setFormData({
                    ...formData,
                    specialtyId: e.target.value,
                    specialtyName: selectedSpecialty ? selectedSpecialty.name : formData.specialtyName
                  });
                }}
                className={`w-full p-2 border ${
                  errors.specialtyId ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:ring-primary focus:border-primary`}
              >
                <option value="">Select Specialty</option>
                {specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </option>
                ))}
              </select>
              {errors.specialtyId && <p className="mt-1 text-sm text-red-500">{errors.specialtyId}</p>}
            </div>
            
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-dark-grey mb-1">
                Experience
              </label>
              <input
                id="experience"
                name="experience"
                type="text"
                placeholder="e.g. 10+ years"
                value={formData.experience}
                onChange={handleChange}
                className={`w-full p-2 border ${
                  errors.experience ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:ring-primary focus:border-primary`}
              />
              {errors.experience && <p className="mt-1 text-sm text-red-500">{errors.experience}</p>}
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-medium text-dark-grey mb-3">Credential Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="licenseNumber" className="block text-sm font-medium text-dark-grey mb-1">
                    License Number
                  </label>
                  <input
                    id="licenseNumber"
                    name="credentials.licenseNumber"
                    type="text"
                    value={formData.credentials.licenseNumber}
                    onChange={handleChange}
                    className={`w-full p-2 border ${
                      errors['credentials.licenseNumber'] ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:ring-primary focus:border-primary`}
                  />
                  {errors['credentials.licenseNumber'] && (
                    <p className="mt-1 text-sm text-red-500">{errors['credentials.licenseNumber']}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-dark-grey mb-1">
                    Expiry Date
                  </label>
                  <input
                    id="expiryDate"
                    name="credentials.expiryDate"
                    type="date"
                    value={formData.credentials.expiryDate.split('T')[0]}
                    onChange={handleChange}
                    className={`w-full p-2 border ${
                      errors['credentials.expiryDate'] ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:ring-primary focus:border-primary`}
                  />
                  {errors['credentials.expiryDate'] && (
                    <p className="mt-1 text-sm text-red-500">{errors['credentials.expiryDate']}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-dark-grey mb-2">
                  Credential Status
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => handleCredentialStatusChange('pending')}
                    className={`px-3 py-1 rounded-full border ${
                      formData.credentials.status === 'pending'
                        ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
                        : 'border-gray-300 text-medium-grey'
                    }`}
                  >
                    Pending Review
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCredentialStatusChange('verified')}
                    className={`px-3 py-1 rounded-full border ${
                      formData.credentials.status === 'verified'
                        ? 'bg-green-100 border-green-300 text-green-800'
                        : 'border-gray-300 text-medium-grey'
                    }`}
                  >
                    Verified
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCredentialStatusChange('rejected')}
                    className={`px-3 py-1 rounded-full border ${
                      formData.credentials.status === 'rejected'
                        ? 'bg-red-100 border-red-300 text-red-800'
                        : 'border-gray-300 text-medium-grey'
                    }`}
                  >
                    Rejected
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-dark-grey mb-4">Availability & Settings</h2>
            
            <div className="flex items-center space-x-2 mb-6">
              <input
                id="approvalStatus"
                name="approvalStatus"
                type="checkbox"
                checked={formData.approvalStatus}
                onChange={handleChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="approvalStatus" className="block text-sm font-medium text-dark-grey">
                Approved for Booking (Visible to Patients)
              </label>
            </div>
            
            <div>
              <label htmlFor="consultationFee" className="block text-sm font-medium text-dark-grey mb-1">
                Consultation Fee ($)
              </label>
              <input
                id="consultationFee"
                name="consultationFee"
                type="number"
                min="0"
                step="5"
                value={formData.consultationFee}
                onChange={handleChange}
                className={`w-full p-2 border ${
                  errors.consultationFee ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:ring-primary focus:border-primary`}
              />
              {errors.consultationFee && (
                <p className="mt-1 text-sm text-red-500">{errors.consultationFee}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2 mb-2">
              <input
                id="isVirtual"
                name="isVirtual"
                type="checkbox"
                checked={formData.isVirtual}
                onChange={handleChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="isVirtual" className="block text-sm font-medium text-dark-grey">
                Offers Virtual Consultations
              </label>
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-dark-grey mb-1">
                Office Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-medium text-dark-grey mb-3">Availability Schedule</h3>
              <p className="text-sm text-medium-grey mb-4">
                Detailed availability scheduling can be managed from the dedicated scheduling interface.
              </p>
              <button
                type="button"
                className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/5"
                onClick={() => {
                  // This would open a more detailed scheduling interface in a real app
                  alert('Scheduling interface would open here in the complete implementation');
                }}
              >
                Manage Availability Schedule
              </button>
            </div>
          </div>
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
            onClick={onClose}
            className="text-medium-grey hover:text-dark-grey"
          >
            ✕
          </button>
        </div>
        
        {/* Modal content */}
        <div className="flex">
          {/* Step indicator */}
          <div className="w-48 bg-light-grey p-4 flex flex-col">
            <div className="space-y-1 flex-1">
              <button
                onClick={() => setCurrentStep(1)}
                className={`w-full text-left p-2 rounded-md ${
                  currentStep === 1 ? 'bg-primary text-white' : 'hover:bg-gray-200'
                }`}
              >
                1. Basic Information
              </button>
              <button
                onClick={() => validateStep() && setCurrentStep(2)}
                className={`w-full text-left p-2 rounded-md ${
                  currentStep === 2 ? 'bg-primary text-white' : 'hover:bg-gray-200'
                }`}
              >
                2. Specialty & Credentials
              </button>
              <button
                onClick={() => validateStep() && setCurrentStep(3)}
                className={`w-full text-left p-2 rounded-md ${
                  currentStep === 3 ? 'bg-primary text-white' : 'hover:bg-gray-200'
                }`}
              >
                3. Availability & Settings
              </button>
            </div>
            
            <div className="pt-4 border-t mt-auto">
              <div className="text-sm text-medium-grey">
                <div><strong>ID:</strong> {doctor.id}</div>
                <div><strong>Created:</strong> {new Date(doctor.createdAt).toLocaleDateString()}</div>
              </div>
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
                    className="px-4 py-2 border border-gray-300 text-medium-grey rounded-md hover:bg-gray-50"
                    disabled={isLoading}
                  >
                    Previous
                  </button>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-medium-grey rounded-md hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center"
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
                      'Save Doctor'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorEditModal; 