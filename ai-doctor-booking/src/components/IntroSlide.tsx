import React from 'react';
import Image from 'next/image';

interface IntroSlideProps {
  title: string;
  description: string;
  imageUrl: string;
  active: boolean;
}

const IntroSlide: React.FC<IntroSlideProps> = ({
  title,
  description,
  imageUrl,
  active
}) => {
  return (
    <div className={`h-full w-full flex flex-col items-center px-6 transition-all duration-500 ease-in-out ${
      active ? 'opacity-100 translate-x-0' : 'opacity-0 absolute translate-x-[100%]'
    }`}>
      <div className="w-full relative mb-12 mt-8 flex-1 flex items-center justify-center">
        {/* Decorative colored background */}
        <div className="absolute inset-0 bg-gradient-to-b from-light-grey/30 to-white rounded-3xl flex items-center justify-center overflow-hidden">
          {/* Decorative pattern */}
          <svg 
            className="w-full absolute top-0 opacity-10" 
            height="40" 
            viewBox="0 0 400 40" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M0,20 Q50,5 100,20 T200,20 T300,20 T400,20" 
              stroke="#333333" 
              fill="none" 
              strokeWidth="2"
            />
          </svg>
        </div>
        
        <div className="relative z-10 w-full h-full flex items-center justify-center py-8">
          <Image
            src={imageUrl}
            alt={title}
            width={280}
            height={280}
            className="object-contain max-h-[260px] drop-shadow-lg"
            priority
          />
        </div>
      </div>
      
      <div className="w-full text-center">
        <h2 className="text-2xl font-bold text-dark-grey mb-4">{title}</h2>
        <p className="text-medium-grey text-base leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default IntroSlide; 