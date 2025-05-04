'use client';

import { useState } from 'react';
import Link from 'next/link';
import BookingWidget from './BookingWidget';
import { useAuth } from '@/hooks/useAuth';

export default function HomeContent() {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const { user, loading } = useAuth();
  
  // Mock doctor data (in a real application, this would come from an API)
  const doctors = [
    { id: 'doctor-1', name: 'Dr. Susan Miller', specialty: 'Cardiology' },
    { id: 'doctor-2', name: 'Dr. John Smith', specialty: 'Dermatology' },
    { id: 'doctor-3', name: 'Dr. Emma Wilson', specialty: 'Neurology' },
  ];

  return (
    <>
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-h1 font-bold mb-2">Medical Appointment Booking</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Schedule your appointment with our experienced doctors. Choose a specialist, select a time slot, and book your visit in minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="card">
              <h2>Our Doctors</h2>
              <p className="text-gray-600 mb-4">Select a doctor to see their availability</p>
              
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
            
            {!user && !loading && (
              <div className="card mt-6 bg-gray-50">
                <h3>Already have an account?</h3>
                <p className="text-gray-600">
                  Sign in to manage your appointments and see your medical history.
                </p>
                <Link href="/login" className="btn w-full mt-2 flex-center">
                  Sign In
                </Link>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            {selectedDoctorId ? (
              <BookingWidget doctor_id={selectedDoctorId} />
            ) : (
              <div className="card text-center">
                <h2>Book Your Appointment</h2>
                <p className="text-gray-600 mb-4">
                  Please select a doctor from the list to see available time slots.
                </p>
                <div className="w-full max-w-xs mx-auto opacity-50 bg-gray-100 p-4 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-32 text-teal-400">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-300 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Medical Booking Service. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
} 