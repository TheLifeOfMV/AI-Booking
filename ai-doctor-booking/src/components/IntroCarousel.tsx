"use client";

import React, { useState, useCallback, useEffect } from 'react';
import SlideIndicators from './SlideIndicators';
import Button from './Button';
import { useRouter } from 'next/navigation';

// Define the slide content
const slides = [
  {
    title: 'Encuentra a tu doctor ideal',
    description: 'Accede a una extensa red de médicos profesionales especializados para todas tus necesidades de salud.',
  },
  {
    title: 'Agenda citas fácilmente',
    description: 'Programa tus citas médicas sin complicaciones, en cualquier momento y desde cualquier lugar.',
  },
  {
    title: 'Consultas virtuales',
    description: 'Accede a consultas médicas desde la comodidad de tu hogar a través de video consultas seguras.',
  },
];

const IntroCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
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

  const handleSkip = useCallback(() => {
    router.push('/auth/register');
  }, [router]);

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Main Content Area - Split into Two Sections */}
      <div className="flex-1 flex flex-col">
        {/* Doctor Image Placeholder Section */}
        <div className="flex-1 relative bg-white rounded-b-[2rem] overflow-hidden">
          {/* Doctor Image Placeholder */}
          <div className="w-full h-full flex items-center justify-center">
            <div className="relative w-[85%] h-[90%] rounded-3xl overflow-hidden bg-light-grey/50 flex items-center justify-center shadow-card">
              <div className="text-medium-grey flex flex-col items-center gap-3">
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
                  <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                  <path d="M20.96 11.22a9 9 0 1 0-9.18 9.18" />
                  <path d="M12 12v.01" />
                </svg>
                <span>Doctor Image</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Text Content Section (Dark background with sliding text) */}
        <div className="bg-dark-grey rounded-t-[2rem] -mt-6 text-white p-8 pb-6 z-10 overflow-hidden">
          {/* JUST TWO CLICKS */}
          <div className="uppercase text-xs tracking-wider mb-2 opacity-60 flex items-center">
            Just two clicks
            <div className="flex ml-4 items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-white opacity-60"></span>
              <span className="inline-block w-1 h-1 rounded-full bg-white opacity-60"></span>
              <span className="inline-block w-8 h-1 rounded-full bg-white"></span>
            </div>
          </div>
          
          {/* Sliding Content */}
          <div className="relative h-28 mb-6 overflow-hidden">
            {slides.map((slide, index) => (
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
                    <>Book your<br />Doctor any<br />Time, <span className="text-primary">anywhere</span>.</>
                  )}
                  {index === 1 && (
                    <>Schedule <span className="text-primary">easily</span><br />with just a<br />few taps.</>
                  )}
                  {index === 2 && (
                    <>Virtual <span className="text-primary">consultations</span><br />from the<br />comfort of home.</>
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
              'Get Started'
            ) : (
              <>
                Get Started
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