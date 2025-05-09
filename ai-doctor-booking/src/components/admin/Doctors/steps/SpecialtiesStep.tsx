"use client";

import React, { useState, useEffect } from 'react';
import { Doctor, CredentialStatus } from '@/types/doctor';
import { getSpecialties } from '@/services/doctorService';

interface Specialty {
  id: string;
  name: string;
  imageUrl?: string;
  icon?: string;
  color?: string;
}

interface SpecialtiesStepProps {
  formData: Doctor;
  errors: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSpecialtyChange: (specialtyId: string, specialtyName: string) => void;
  handleCredentialStatusChange: (status: CredentialStatus) => void;
}

/**
 * SpecialtiesStep component
 * 
 * Second step in the doctor edit modal for specialty selection and credentials.
 */
const SpecialtiesStep: React.FC<SpecialtiesStepProps> = ({
  formData,
  errors,
  handleChange,
  handleSpecialtyChange,
  handleCredentialStatusChange,
}) => {
  // Specialties state
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoadingSpecialties, setIsLoadingSpecialties] = useState(false);

  // Load specialties
  useEffect(() => {
    const fetchSpecialties = async () => {
      setIsLoadingSpecialties(true);
      try {
        const result = await getSpecialties();
        setSpecialties(result);
      } catch (error) {
        console.error('Error loading specialties:', error);
      } finally {
        setIsLoadingSpecialties(false);
      }
    };

    fetchSpecialties();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-dark-grey mb-4">Specialty & Credentials</h2>
        <p className="text-medium-grey mb-6">
          Manage the doctor's medical specialty and credential verification status.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="specialtyId" className="block text-sm font-medium text-dark-grey mb-1">
            Medical Specialty*
          </label>
          {isLoadingSpecialties ? (
            <div className="w-full p-3 text-medium-grey bg-light-grey rounded-md">
              Loading specialties...
            </div>
          ) : (
            <select
              id="specialtyId"
              name="specialtyId"
              value={formData.specialtyId}
              onChange={(e) => {
                const selectedSpecialty = specialties.find(s => s.id === e.target.value);
                handleSpecialtyChange(
                  e.target.value, 
                  selectedSpecialty ? selectedSpecialty.name : formData.specialtyName
                );
              }}
              className={`w-full p-3 border ${
                errors.specialtyId ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:ring-primary focus:border-primary transition-colors duration-200`}
            >
              <option value="">Select Specialty</option>
              {specialties.map((specialty) => (
                <option key={specialty.id} value={specialty.id}>
                  {specialty.name}
                </option>
              ))}
            </select>
          )}
          {errors.specialtyId && <p className="mt-1 text-sm text-red-500">{errors.specialtyId}</p>}
        </div>

        <div>
          <label htmlFor="experience" className="block text-sm font-medium text-dark-grey mb-1">
            Experience*
          </label>
          <input
            id="experience"
            name="experience"
            type="text"
            placeholder="e.g. 10+ years"
            value={formData.experience}
            onChange={handleChange}
            className={`w-full p-3 border ${
              errors.experience ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:ring-primary focus:border-primary transition-colors duration-200`}
          />
          {errors.experience && <p className="mt-1 text-sm text-red-500">{errors.experience}</p>}
        </div>
      </div>

      <div className="border-t pt-6 mt-2">
        <h3 className="text-lg font-medium text-dark-grey mb-4">Credential Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="licenseNumber" className="block text-sm font-medium text-dark-grey mb-1">
              License Number*
            </label>
            <input
              id="licenseNumber"
              name="credentials.licenseNumber"
              type="text"
              value={formData.credentials.licenseNumber}
              onChange={handleChange}
              placeholder="e.g. MD12345678"
              className={`w-full p-3 border ${
                errors['credentials.licenseNumber'] ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:ring-primary focus:border-primary transition-colors duration-200`}
            />
            {errors['credentials.licenseNumber'] && (
              <p className="mt-1 text-sm text-red-500">{errors['credentials.licenseNumber']}</p>
            )}
          </div>

          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-dark-grey mb-1">
              Expiry Date*
            </label>
            <input
              id="expiryDate"
              name="credentials.expiryDate"
              type="date"
              value={formData.credentials.expiryDate.split('T')[0]}
              onChange={handleChange}
              className={`w-full p-3 border ${
                errors['credentials.expiryDate'] ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:ring-primary focus:border-primary transition-colors duration-200`}
            />
            {errors['credentials.expiryDate'] && (
              <p className="mt-1 text-sm text-red-500">{errors['credentials.expiryDate']}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-grey mb-3">
            Credential Verification Status
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleCredentialStatusChange('pending')}
              className={`px-4 py-2 rounded-full border transition-colors duration-200 ${
                formData.credentials.status === 'pending'
                  ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
                  : 'border-gray-300 text-medium-grey hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  formData.credentials.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'
                }`}></div>
                Pending Review
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleCredentialStatusChange('verified')}
              className={`px-4 py-2 rounded-full border transition-colors duration-200 ${
                formData.credentials.status === 'verified'
                  ? 'bg-green-100 border-green-300 text-green-800'
                  : 'border-gray-300 text-medium-grey hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  formData.credentials.status === 'verified' ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                Verified
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleCredentialStatusChange('rejected')}
              className={`px-4 py-2 rounded-full border transition-colors duration-200 ${
                formData.credentials.status === 'rejected'
                  ? 'bg-red-100 border-red-300 text-red-800'
                  : 'border-gray-300 text-medium-grey hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  formData.credentials.status === 'rejected' ? 'bg-red-500' : 'bg-gray-300'
                }`}></div>
                Rejected
              </div>
            </button>
          </div>
          {formData.credentials.status === 'verified' && formData.credentials.verifiedAt && (
            <p className="mt-2 text-sm text-medium-grey">
              Verified on: {new Date(formData.credentials.verifiedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      <div className="border-t pt-6 mt-2">
        <h3 className="text-lg font-medium text-dark-grey mb-4">Education</h3>
        <div className="space-y-4">
          {formData.education && formData.education.map((edu, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-md bg-light-grey">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{edu.degree}</div>
                  <div className="text-sm text-medium-grey">{edu.institution}, {edu.year}</div>
                </div>
                <button 
                  type="button" 
                  className="text-medium-grey hover:text-dark-grey"
                  aria-label="Edit education"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 4H4C3.44772 4 3 4.44772 3 5V20C3 20.5523 3.44772 21 4 21H19C19.5523 21 20 20.5523 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18.5 2.50001C18.7626 2.23735 19.1192 2.07019 19.5 2.03061C19.8808 1.99104 20.2667 2.08151 20.5858 2.29054C20.9049 2.49956 21.1356 2.81723 21.2388 3.19039C21.342 3.56354 21.3102 3.95951 21.15 4.30001C21.15 4.30001 21.15 4.30001 21.15 4.30001L12 13.45L9 14L9.55 11L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            className="w-full p-3 border border-dashed border-gray-300 rounded-md text-medium-grey hover:border-primary hover:text-primary flex items-center justify-center transition-colors duration-200"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
              <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Add Education
          </button>
        </div>
      </div>

      <div className="pt-4 border-t">
        <p className="text-sm text-medium-grey mb-2">
          * Required fields
        </p>
      </div>
    </div>
  );
};

export default SpecialtiesStep; 