"use client";

import React, { useState, useCallback } from 'react';
import IntroSlide from './IntroSlide';
import SlideIndicators from './SlideIndicators';
import Button from './Button';
import { useRouter } from 'next/navigation';

// Define the slide content
const slides = [
  {
    title: 'Encuentra a tu doctor ideal',
    description: 'Accede a una extensa red de médicos profesionales especializados para todas tus necesidades de salud.',
    imageUrl: '/images/find-doctor.png',
  },
  {
    title: 'Agenda citas fácilmente',
    description: 'Programa tus citas médicas sin complicaciones, en cualquier momento y desde cualquier lugar.',
    imageUrl: '/images/schedule-appointment.png',
  },
  {
    title: 'Consultas virtuales',
    description: 'Accede a consultas médicas desde la comodidad de tu hogar a través de video consultas seguras.',
    imageUrl: '/images/virtual-consultation.png',
  },
];

const IntroCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const handleNext = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      router.push('/auth/register');
    }
  }, [currentSlide, router]);

  const handleSkip = useCallback(() => {
    router.push('/auth/register');
  }, [router]);

  return (
    <div className="h-screen flex flex-col justify-between bg-white overflow-hidden">
      <div className="relative flex-1 overflow-hidden">
        {slides.map((slide, index) => (
          <IntroSlide
            key={index}
            title={slide.title}
            description={slide.description}
            imageUrl={slide.imageUrl}
            active={currentSlide === index}
          />
        ))}
      </div>
      
      <div className="flex flex-col w-full px-6 pb-12">
        <SlideIndicators
          total={slides.length}
          current={currentSlide}
          onSelect={setCurrentSlide}
        />
        
        <div className="flex gap-4 mt-4">
          <Button 
            type="text" 
            onClick={handleSkip}
          >
            Omitir
          </Button>
          <Button 
            type="primary" 
            fullWidth 
            onClick={handleNext}
          >
            {currentSlide < slides.length - 1 ? 'Siguiente' : 'Comenzar'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IntroCarousel; 