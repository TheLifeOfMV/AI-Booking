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
    <div className={`h-full w-full flex flex-col items-center px-6 transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0 absolute'}`}>
      <div className="w-full h-64 relative mb-8 mt-12">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-contain"
          priority
        />
      </div>
      <h2 className="text-2xl font-semibold text-dark-grey mb-4 text-center">{title}</h2>
      <p className="text-medium-grey text-center mb-8">{description}</p>
    </div>
  );
};

export default IntroSlide; 