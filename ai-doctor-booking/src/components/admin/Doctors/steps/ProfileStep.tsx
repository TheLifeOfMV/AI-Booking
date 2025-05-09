"use client";

import React from 'react';
import { Doctor } from '@/types/doctor';

interface ProfileStepProps {
  formData: Doctor;
  errors: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

/**
 * ProfileStep component
 * 
 * First step in the doctor edit modal for basic profile information.
 */
const ProfileStep: React.FC<ProfileStepProps> = ({
  formData,
  errors,
  handleChange,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-dark-grey mb-4">Basic Information</h2>
        <p className="text-medium-grey mb-6">
          Edit the doctor's personal and contact information.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-dark-grey mb-1">
            Full Name*
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className={`w-full p-3 border ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:ring-primary focus:border-primary transition-colors duration-200`}
            placeholder="Dr. John Smith"
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
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
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary transition-colors duration-200"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-dark-grey mb-1">
            Email Address*
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full p-3 border ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:ring-primary focus:border-primary transition-colors duration-200`}
            placeholder="doctor@example.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-dark-grey mb-1">
            Phone Number*
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone || ''}
            onChange={handleChange}
            className={`w-full p-3 border ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:ring-primary focus:border-primary transition-colors duration-200`}
            placeholder="+1 (555) 123-4567"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
        </div>
      </div>
      
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-dark-grey mb-1">
          Office Address
        </label>
        <input
          id="location"
          name="location"
          type="text"
          value={formData.location || ''}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary transition-colors duration-200"
          placeholder="123 Medical Center Ave, Suite 101"
        />
      </div>
      
      <div className="pt-4 border-t">
        <p className="text-sm text-medium-grey mb-2">
          * Required fields
        </p>
      </div>
    </div>
  );
};

export default ProfileStep; 