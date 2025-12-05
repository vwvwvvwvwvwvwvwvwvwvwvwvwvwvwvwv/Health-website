'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ToonCard } from './ui/ToonCard';
import { ToonButton } from './ui/ToonButton';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type FoodMonsterProps = {
  energy: number;
  message?: string;
  onOpenAction: () => void;
};

export const FoodMonster = ({ energy, message, onOpenAction }: FoodMonsterProps) => {
  const getMonsterStatus = () => {
    if (energy <= 20) return { emoji: "😵", mood: "快饿晕了...", bg: "bg-gray-200" };
    if (energy <= 40) return { emoji: "🥺", mood: "肚子咕咕叫", bg: "bg-toon-blue" };
    if (energy <= 70) return { emoji: "😋", mood: "元气满满!", bg: "bg-toon-green" };
    if (energy <= 90) return { emoji: "😎", mood: "感觉很壮!", bg: "bg-toon-yellow" };
    return { emoji: "🤢", mood: "吃太撑了...", bg: "bg-toon-purple" };
  };

  const status = getMonsterStatus();

  return (
    <ToonCard className="w-full relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black">你的健康伙伴</h2>
        <div className="bg-black text-toon-yellow px-3 py-1 rounded-full text-xs font-bold">
          LV. 5
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-4">
        <AnimatePresence mode="wait">
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-16 bg-white border-3 border-black px-4 py-2 rounded-xl rounded-bl-none z-10"
            >
              <p className="font-bold">{message}</p>
            </motion.div>
          )}
        </AnimatePresence>

      <motion.div 
          key={status.emoji}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1, rotate: [0, -5, 5, 0] }}
          transition={{ rotate: { repeat: Infinity, duration: 2 } }}
          className={cn(
            "w-40 h-40 flex items-center justify-center text-8xl rounded-full border-3 border-black shadow-neo mb-4 transition-colors",
            status.bg
          )}
        >
          {status.emoji}
      </motion.div>

        <p className="font-bold text-xl">{status.mood}</p>
      </div>

      <div className="my-6">
        <div className="flex justify-between text-sm font-bold mb-1">
          <span>能量值</span>
          <span>{energy}/100</span>
        </div>
        <div className="w-full h-6 border-3 border-black rounded-full bg-white relative overflow-hidden">
        <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${energy}%` }}
            className={cn("h-full absolute left-0 top-0", status.bg)}
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-20"></div>
        </div>
      </div>

      <div className="mt-4">
        <ToonButton variant="primary" onClick={onOpenAction} className="w-full">
          <Plus className="w-5 h-5 mr-2" /> 记录 饮食 / 运动
        </ToonButton>
      </div>
    </ToonCard>
  );
};
