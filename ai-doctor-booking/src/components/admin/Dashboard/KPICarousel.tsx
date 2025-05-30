'use client';

import React, { useState, ReactNode } from 'react';

interface KPICarouselProps {
  children: ReactNode[];
  autoRotate?: boolean;
  rotateInterval?: number;
}

export default function KPICarousel({ 
  children, 
  autoRotate = false, 
  rotateInterval = 5000 
}: KPICarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === children.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? children.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-rotate functionality
  React.useEffect(() => {
    if (autoRotate && children.length > 1) {
      const interval = setInterval(nextSlide, rotateInterval);
      return () => clearInterval(interval);
    }
  }, [autoRotate, rotateInterval, children.length]);

  if (children.length === 0) return null;
  if (children.length === 1) return <>{children[0]}</>;

  return (
    <div className="relative w-full min-h-[400px]">
      {/* Carousel Content */}
      <div className="relative overflow-hidden w-full">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {children.map((child, index) => (
            <div key={index} className="w-full flex-shrink-0">
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow-lg transition-all duration-200 z-10"
        aria-label="Tarjeta anterior"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow-lg transition-all duration-200 z-10"
        aria-label="Siguiente tarjeta"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {children.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentIndex 
                ? 'bg-primary w-6' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Ir a tarjeta ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
} 