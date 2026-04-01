"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiCheck, FiArrowRight } from 'react-icons/fi';

const SubscriptionSuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('id');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/doctor/profile');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-light-grey/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheck className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-dark-grey mb-3">
          Suscripción activada
        </h1>
        <p className="text-medium-grey mb-6">
          Tu plan ha sido actualizado exitosamente. Ya puedes disfrutar de todas las
          funcionalidades de tu nuevo plan.
        </p>

        {reference && (
          <p className="text-xs text-medium-grey mb-6">
            Referencia: {reference}
          </p>
        )}

        <p className="text-sm text-medium-grey mb-6">
          Redirigiendo a tu perfil en {countdown} segundos...
        </p>

        <button
          onClick={() => router.push('/doctor/profile')}
          className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors inline-flex items-center"
        >
          Ir a mi perfil
          <FiArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage;
