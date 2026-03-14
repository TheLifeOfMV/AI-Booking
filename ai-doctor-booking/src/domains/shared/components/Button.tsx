import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'primary' | 'secondary' | 'text';
  htmlType?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'primary',
  htmlType = 'button',
  fullWidth = false,
  disabled = false,
  className = '',
}) => {
  const baseClasses = 'py-3 px-6 rounded-xl font-medium transition-all duration-300 focus:outline-none';
  
  const typeClasses = {
    primary: 'bg-primary text-white hover:bg-primary/90 active:bg-primary/80',
    secondary: 'bg-light-grey text-dark-grey hover:bg-light-grey/80 active:bg-light-grey/70',
    text: 'bg-transparent text-primary hover:bg-light-grey/20 active:bg-light-grey/30'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  return (
    <button
      type={htmlType}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${typeClasses[type]} ${widthClass} ${disabledClass} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button; 