"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { FiCheckCircle, FiClock } from 'react-icons/fi';
import Button from '@/components/Button';

const DoctorRegisterSuccessPage = () => {
  const router = useRouter();
  
  return (
    <div style={{ backgroundColor: '#E6F0FA', minHeight: '100vh' }}>
      <div className="container max-w-md mx-auto py-12 px-4 text-center">
        <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheckCircle className="text-primary text-4xl" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4">¡Solicitud enviada con éxito!</h1>
        
        <p className="text-medium-grey mb-8">
          Gracias por registrarte como especialista médico. Hemos recibido tu solicitud y estamos revisando tus credenciales.
        </p>
        
        <div className="bg-light-grey rounded-lg p-4 mb-8">
          <h2 className="flex items-center justify-center text-lg font-medium mb-3">
            <FiClock className="mr-2" /> Próximos pasos
          </h2>
          
          <ol className="text-left space-y-4 text-medium-grey">
            <li className="flex">
              <span className="bg-primary/20 text-primary font-semibold rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">1</span>
              <p>
                Nuestro equipo revisará tus credenciales médicas y verificará tu información profesional.
              </p>
            </li>
            <li className="flex">
              <span className="bg-primary/20 text-primary font-semibold rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">2</span>
              <p>
                Recibirás un correo electrónico con el resultado de la verificación dentro de las próximas 48 horas laborables.
              </p>
            </li>
            <li className="flex">
              <span className="bg-primary/20 text-primary font-semibold rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">3</span>
              <p>
                Una vez aprobada tu solicitud, podrás acceder a tu cuenta y seleccionar el plan de suscripción que mejor se adapte a tu práctica médica.
              </p>
            </li>
          </ol>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="font-medium text-blue-900 mb-2">Información sobre suscripciones</h3>
          <p className="text-sm text-blue-700">
            Una vez aprobada tu cuenta, tendras acceso a la plataforma y tendras un free trial de 14 dias para que puedas probar la plataforma y ver si es lo que necesitas.
            Una vez finalice el free trial, podrás elegir entre nuestros planes de suscripción (Básico, Premium o Enterprise) 
            según las necesidades de tu práctica médica. Cada plan incluye diferentes beneficios y características.
          </p>
        </div>
        
        <div className="flex justify-center">
          <Button
            type="primary"
            onClick={() => router.push('/doctor/dashboard')}
            fullWidth
          >
            Ir al Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DoctorRegisterSuccessPage; 