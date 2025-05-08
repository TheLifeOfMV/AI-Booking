"use client";

import React, { useState } from 'react';

interface HighQualityImageProps {
  src: string;
  alt: string;
  className?: string;
}

/**
 * A component for displaying high-quality images without Next.js's auto-optimization
 * Use this when you need to preserve original image quality
 */
const HighQualityImage: React.FC<HighQualityImageProps> = ({ 
  src, 
  alt,
  className = "" 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Loading indicator */}
      {!isLoaded && (
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
      
      {/* The actual image - not using Next.js Image component */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ objectPosition: 'center 10%' }}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
};

export default HighQualityImage; 