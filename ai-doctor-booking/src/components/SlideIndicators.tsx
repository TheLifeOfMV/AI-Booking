import React from 'react';

interface SlideIndicatorsProps {
  total: number;
  current: number;
  onSelect: (index: number) => void;
}

const SlideIndicators: React.FC<SlideIndicatorsProps> = ({
  total,
  current,
  onSelect
}) => {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          onClick={() => onSelect(index)}
          className={`transition-all duration-300 rounded-full ${
            current === index 
              ? 'w-8 h-1 bg-white' 
              : 'w-1 h-1 bg-white/60 hover:bg-white/80'
          }`}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default SlideIndicators; 