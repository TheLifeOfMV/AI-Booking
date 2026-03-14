"use client";

import React, { useState, useRef, useEffect } from 'react';

interface HighQualityImageProps {
  src: string;
  alt: string;
  className?: string;
}

/**
 * A component for displaying high-quality images without Next.js's auto-optimization.
 * Handles cached images: when the image is already complete (e.g. from cache), onLoad
 * may never fire, so we detect that and show the image immediately.
 */
const HighQualityImage: React.FC<HighQualityImageProps> = ({ 
  src, 
  alt,
  className = "" 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // When src changes, reset state for the new image
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  // If the image is already complete (e.g. from cache), onLoad may never fire.
  // Check after mount and when src changes so the image shows immediately.
  useEffect(() => {
    const img = imgRef.current;
    if (!img || hasError) return;
    if (img.complete && img.naturalWidth > 0) {
      setIsLoaded(true);
    }
    // Also check after next frame in case complete is set asynchronously (cached load)
    const rafId = requestAnimationFrame(() => {
      if (!imgRef.current) return;
      if (imgRef.current.complete && imgRef.current.naturalWidth > 0) {
        setIsLoaded(true);
      }
    });
    return () => cancelAnimationFrame(rafId);
  }, [src, hasError]);

  const handleLoad = () => setIsLoaded(true);
  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

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
      
      {/* Fallback when image fails to load (e.g. 404) */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#E8E8ED] to-[#F2F2F7]">
          <div className="flex flex-col items-center gap-3 text-medium-grey">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="80" 
              height="80" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="opacity-40"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <span className="text-sm">Imagen no disponible</span>
          </div>
        </div>
      )}
      
      {/* The actual image - not using Next.js Image component */}
      {!hasError && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ objectPosition: 'center 10%' }}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default HighQualityImage; 