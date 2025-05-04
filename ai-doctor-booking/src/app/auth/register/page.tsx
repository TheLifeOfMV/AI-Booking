import React from 'react';
import Link from 'next/link';
import Button from '@/components/Button';

export const metadata = {
  title: 'Registro - AI Doctor Booking',
  description: 'Crea una cuenta para comenzar a programar tus citas médicas',
};

export default function RegisterPage() {
  return (
    <div className="h-screen flex flex-col justify-center items-center p-6">
      <h1 className="text-3xl font-bold text-primary mb-8">Crear cuenta</h1>
      <p className="text-medium-grey mb-8 text-center">
        Esta es una página de registro de muestra para completar el flujo de la aplicación.
      </p>
      <Link href="/intro" className="w-full max-w-xs">
        <Button fullWidth>Volver a introducción</Button>
      </Link>
    </div>
  );
} 