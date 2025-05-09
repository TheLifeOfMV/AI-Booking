'use client';

import { useState } from 'react';
import { User, UserStatus, UserRole } from '@/types/user';
import { updateUser } from '@/services/userService';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUserUpdate: (user: User) => void;
}

export default function UserEditModal({ isOpen, onClose, user, onUserUpdate }: UserEditModalProps) {
  const [formData, setFormData] = useState<Partial<User>>({
    name: user.name,
    email: user.email,
    phone: user.phone,
    status: user.status,
    role: user.role,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const updatedUser = await updateUser(user.id, formData);
      onUserUpdate(updatedUser);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-dark-grey opacity-50"></div>
        </div>
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-dark-grey">
                  Edit User
                </h3>
                
                {error && (
                  <div className="mt-2 p-2 bg-red-100 text-red-800 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="grid grid-cols-1 gap-4">
                    {/* Name input */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-medium-grey mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        className="w-full px-3 py-2 border border-light-grey rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        value={formData.name || ''}
                        onChange={handleChange}
                      />
                    </div>
                    
                    {/* Email input */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-medium-grey mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        className="w-full px-3 py-2 border border-light-grey rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        value={formData.email || ''}
                        onChange={handleChange}
                      />
                    </div>
                    
                    {/* Phone input */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-medium-grey mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        required
                        className="w-full px-3 py-2 border border-light-grey rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        value={formData.phone || ''}
                        onChange={handleChange}
                      />
                    </div>
                    
                    {/* Status select */}
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-medium-grey mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        id="status"
                        required
                        className="w-full px-3 py-2 border border-light-grey rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        value={formData.status || ''}
                        onChange={handleChange}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                    
                    {/* Role select */}
                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-medium-grey mb-1">
                        Role
                      </label>
                      <select
                        name="role"
                        id="role"
                        required
                        className="w-full px-3 py-2 border border-light-grey rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        value={formData.role || ''}
                        onChange={handleChange}
                      >
                        <option value="patient">Patient</option>
                        <option value="doctor">Doctor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-light-grey shadow-sm px-4 py-2 bg-white text-dark-grey font-medium hover:bg-light-grey focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:col-start-1 sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 