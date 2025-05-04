'use client';

import { useState, useEffect } from 'react';
import CalendarView from './Calendar/CalendarView';
import { useAuth } from '@/hooks/useAuth';

export default function CalendarPageContent() {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const { user, loading, navigateToLogin } = useAuth();
  
  // Mock doctor data (in a real application, this would come from an API)
  const doctors = [
    { id: 'doctor-1', name: 'Dr. Susan Miller', specialty: 'Cardiology' },
    { id: 'doctor-2', name: 'Dr. John Smith', specialty: 'Dermatology' },
    { id: 'doctor-3', name: 'Dr. Emma Wilson', specialty: 'Neurology' },
  ];
  
  // Check if user is authenticated
  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login page if not authenticated
      navigateToLogin();
    }
  }, [user, loading, navigateToLogin]);
  
  // If loading or not authenticated, show loading state
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-h1 font-bold mb-6">Appointment Calendar</h1>
      
      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="card">
            <h2>Select Doctor</h2>
            <p className="text-gray-600 mb-4">View appointments by doctor</p>
            
            <div className="space-y-3">
              {doctors.map((doctor) => (
                <button
                  key={doctor.id}
                  className={`w-full text-left p-3 rounded-md transition-colors ${
                    selectedDoctorId === doctor.id ? 'bg-teal-50 border border-teal-300' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedDoctorId(doctor.id)}
                >
                  <div className="font-medium">{doctor.name}</div>
                  <div className="text-small text-gray-600">{doctor.specialty}</div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="card mt-6">
            <h3>Legend</h3>
            <div className="mt-3 space-y-2">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-teal-300 rounded-full mr-2"></div>
                <span>Confirmed</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-teal-100 rounded-full mr-2"></div>
                <span>Scheduled</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-pink-400 rounded-full mr-2"></div>
                <span>Cancelled</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-3">
          {selectedDoctorId ? (
            <CalendarView doctorId={selectedDoctorId} />
          ) : (
            <div className="card text-center p-8">
              <h2>View Appointment Calendar</h2>
              <p className="text-gray-600 mb-4">
                Please select a doctor from the list to view their appointment calendar.
              </p>
              <div className="max-w-xs mx-auto opacity-50 bg-gray-100 p-4 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-32 text-teal-400">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 