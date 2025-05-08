"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import SlideIndicators from './SlideIndicators';
import Button from './Button';
import { useRouter } from 'next/navigation';
import HighQualityImage from './HighQualityImage';

// Define slide structure without unnecessary content
const slides = [
  {}, {}, {}
];

const IntroCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(true);
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
              <HighQualityImage
                src="/images/Doctor.intro.png"
                alt="Professional doctor"
                className="z-0"
              />
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