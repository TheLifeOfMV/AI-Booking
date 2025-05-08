"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import SlideIndicators from './SlideIndicators';
import Button from './Button';
import { useRouter } from 'next/navigation';

// Define slide structure without unnecessary content
const slides = [
  {}, {}, {}
];

const IntroCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAutoPlay) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev < slides.length - 1 ? prev + 1 : 0));
    }, 4000);
    
    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const handleNext = useCallback(() => {
    setIsAutoPlay(false);
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      router.push('/auth/register');
    }
  }, [currentSlide, router]);

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Main Content Area - Split into Two Sections */}
      <div className="flex-1 flex flex-col">
        {/* Doctor Image Section - Modified to take remaining space */}
        <div className="flex-1 relative bg-white rounded-b-[2rem] overflow-hidden">
          {/* Doctor Image - Modified container to fill available space */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              <Image
                src="/images/Doctor.intro.png"
                alt="Professional doctor"
                fill
                priority
                style={{ 
                  objectFit: 'cover', 
                  objectPosition: 'center 10%'
                }}
                className={`transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-light-grey/50">
                  <div className="animate-pulse flex flex-col items-center gap-3 text-medium-grey">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="48" 
                      height="48" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <span>Loading image...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Text Content Section (Dark background with sliding text) */}
        <div className="bg-dark-grey rounded-t-[2rem] -mt-6 text-white p-8 pb-6 z-10 overflow-hidden">
          {/* JUST TWO CLICKS */}
          <div className="uppercase text-xs tracking-wider mb-2 opacity-60 flex items-center">
            Solo dos clics
            <div className="flex ml-4 items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-white opacity-60"></span>
              <span className="inline-block w-1 h-1 rounded-full bg-white opacity-60"></span>
              <span className="inline-block w-8 h-1 rounded-full bg-white"></span>
            </div>
          </div>
          
          {/* Sliding Content */}
          <div className="relative h-28 mb-6 overflow-hidden">
            {slides.map((_, index) => (
              <div 
                key={index}
                className={`absolute w-full transition-all duration-500 ease-in-out ${
                  index === currentSlide 
                    ? 'opacity-100 translate-y-0' 
                    : index < currentSlide 
                      ? 'opacity-0 -translate-y-full' 
                      : 'opacity-0 translate-y-full'
                }`}
              >
                <h2 className="text-3xl font-bold mb-2">
                  {index === 0 && (
                    <>Regístrate en<br />nuestra<br />app <span className="text-primary">MedAI</span>.</>
                  )}
                  {index === 1 && (
                    <>Selecciona el <span className="text-primary">modo</span><br />con el que quieres<br />agendar tu cita.</>
                  )}
                  {index === 2 && (
                    <>Encuentra los<br />mejores <span className="text-primary">especialistas</span><br />de tu ciudad.</>
                  )}
                </h2>
              </div>
            ))}
          </div>
          
          {/* Indicator and Buttons */}
          <SlideIndicators
            total={slides.length}
            current={currentSlide}
            onSelect={(index) => {
              setIsAutoPlay(false);
              setCurrentSlide(index);
            }}
          />
          
          <Button 
            type="primary" 
            fullWidth 
            onClick={handleNext}
            className="mt-6 py-4 rounded-xl flex items-center justify-center font-medium"
          >
            {currentSlide < slides.length - 1 ? (
              'Comenzar'
            ) : (
              <>
                Comenzar
                <span className="ml-2">›</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IntroCarousel; 