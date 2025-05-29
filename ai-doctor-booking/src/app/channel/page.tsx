'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Image from 'next/image';

export default function ChannelSelectionPage() {
  const router = useRouter();
  
  const handleChannelSelect = (channel: 'phone' | 'whatsapp' | 'app') => {
    if (channel === 'app') {
      router.push('/booking/insurance-selection');
    } else {
      // For now, we just show an alert for phone/whatsapp options
      // This would be replaced with actual functionality in the future
      alert(`La reserva por ${channel === 'phone' ? 'teléfono' : 'WhatsApp'} estará disponible en una actualización futura.`);
    }
  };
  
  return (
    <div className="h-screen max-h-screen overflow-hidden fixed inset-0 flex flex-col py-4 px-4" style={{ backgroundColor: '#F0F4F9' }}>
      {/* Header - Reduced bottom margin */}
      <div className="w-full max-w-md text-center mx-auto mb-3 mt-2">
        <h1 className="text-2xl font-bold text-dark-grey mb-1">
          Elige tu Canal de Reserva
        </h1>
        <p className="text-medium-grey text-sm">
          Selecciona tu forma preferida para agendar tu cita
        </p>
      </div>
      
      {/* Cards section - with less top spacing */}
      <div className="flex flex-col gap-3 w-full max-w-lg mx-auto flex-1 justify-center">
        {/* Cards container with shadow effect */}
        <div className="p-4 bg-white rounded-2xl shadow-lg relative">
          {/* Section Title */}
          <div className="mb-3 flex items-center">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wide">Opciones Disponibles</h2>
          </div>
          
          {/* Phone Call Card - With blue gradient background */}
          <div 
            onClick={() => handleChannelSelect('phone')}
            className="bg-white rounded-xl shadow-sm p-3 transition-all duration-300 hover:shadow-md cursor-pointer border border-light-grey flex items-center mb-3"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-dark-grey">Llamada Telefónica</h3>
              <p className="text-medium-grey text-sm mb-1">Habla con nuestro asistente virtual</p>
            </div>
            <Button type="text" className="shrink-0 flex items-center justify-center">
              Seleccionar <span className="ml-1">›</span>
            </Button>
          </div>
          
          {/* WhatsApp Card - Changed to blue gradient background */}
          <div 
            onClick={() => handleChannelSelect('whatsapp')}
            className="bg-white rounded-xl shadow-sm p-3 transition-all duration-300 hover:shadow-md cursor-pointer border border-light-grey flex items-center mb-3"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-dark-grey">WhatsApp</h3>
              <p className="text-medium-grey text-sm mb-1">Chatea con nuestro asistente IA</p>
            </div>
            <Button type="text" className="shrink-0 flex items-center justify-center">
              Seleccionar <span className="ml-1">›</span>
            </Button>
          </div>
          
          {/* In-App Card - With consistent styling but gradient background restored */}
          <div 
            onClick={() => handleChannelSelect('app')}
            className="bg-white rounded-xl shadow-sm p-3 transition-all duration-300 hover:shadow-md cursor-pointer border border-light-grey flex items-center relative overflow-hidden"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-dark-grey">App</h3>
              <p className="text-medium-grey text-sm mb-1">Reserva directamente a través de nuestra app</p>
            </div>
            <Button type="text" className="shrink-0 flex items-center justify-center">
              Seleccionar <span className="ml-1">›</span>
            </Button>
          </div>
        </div>
        
        {/* Info section */}
        <div className="text-center text-xs text-medium-grey mt-2">
          <p>Todos los métodos de reserva ofrecen el mismo servicio de alta calidad</p>
          <p className="mt-1 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Las citas pueden ser reprogramadas minimo con 2 horas de antelación
          </p>
        </div>
      </div>
    </div>
  );
} 