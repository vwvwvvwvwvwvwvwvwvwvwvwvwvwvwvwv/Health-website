'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils'; 

export const ToonCard = ({ children, className, color = 'bg-white' }: any) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        `border-3 border-black rounded-neo shadow-neo p-6 ${color}`,
        className
      )}
    >
      {children}
    </motion.div>
  );
};
