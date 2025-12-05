'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type ToonButtonProps = {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
};

export const ToonButton = ({ 
  onClick, 
  children, 
  variant = 'primary',
  className,
  disabled = false,
  type = 'button'
}: ToonButtonProps) => {
  const bgColors = {
    primary: 'bg-toon-blue',
    secondary: 'bg-toon-pink',
    success: 'bg-toon-green'
  };

  return (
    <motion.button
      whileHover={disabled ? {} : { y: -2, boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)' }}
      whileTap={disabled ? {} : { y: 2, x: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
      className={cn(
        bgColors[variant],
        'text-black font-bold py-3 px-6',
        'border-3 border-black rounded-neo shadow-neo',
        'transition-colors flex items-center gap-2 justify-center',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </motion.button>
  );
};
