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
    <div className="flex justify-center gap-2 my-6">
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          onClick={() => onSelect(index)}
          className={`h-2 rounded-full transition-all duration-300 ${
            current === index ? 'w-6 bg-primary' : 'w-2 bg-light-grey'
          }`}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default SlideIndicators; 