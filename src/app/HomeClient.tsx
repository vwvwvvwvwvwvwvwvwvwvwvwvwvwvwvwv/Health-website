'use client';

import { useState } from 'react';
import { FoodMonster } from '@/components/FoodMonster';
import { ActionPanel } from '@/components/ActionPanel';
import { ToonCard } from '@/components/ui/ToonCard';
import { Flame, Droplets, Zap, ArrowRight, Target, Settings, X } from 'lucide-react';
import Link from 'next/link';
import { addWater, updateUserGoal } from '@/lib/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { ToonButton } from '@/components/ui/ToonButton';

type LogItem = {
  id: number;
  type: string;
  val: number;
  amount: number;
  food: { name: string; emoji: string } | null;
  exercise: { name: string; emoji: string } | null;
  createdAt: Date;
};

type InitialStats = {
  intake: number;
  burn: number;
  water: number;
  logs: LogItem[];
  waterLogs: Array<{
    id: number;
    createdAt: Date;
    amount: number;
  }>;
};

type InitialGoal = {
  id: number;
  dailyIntake: number;
  dailyBurn: number;
  dailyWater: number;
};

export default function HomeClient({ initialStats, initialGoal }: { initialStats: InitialStats; initialGoal: InitialGoal }) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isGoalPanelOpen, setIsGoalPanelOpen] = useState(false);
  
  const [intake, setIntake] = useState(initialStats.intake);
  const [burn, setBurn] = useState(initialStats.burn);
  const [water, setWater] = useState(initialStats.water);
  const [logs, setLogs] = useState(initialStats.logs);
  const [msg, setMsg] = useState('');
  const [waterAnimating, setWaterAnimating] = useState(false);
  
  const [goal, setGoal] = useState(initialGoal);
  const [goalForm, setGoalForm] = useState({
    dailyIntake: initialGoal.dailyIntake,
    dailyBurn: initialGoal.dailyBurn,
    dailyWater: initialGoal.dailyWater
  });

  const energy = Math.min(100, Math.max(0, 50 + Math.floor((intake - burn) / 20)));
  const waterProgress = Math.min(100, (water / goal.dailyWater) * 100);
  const intakeProgress = Math.min(100, (intake / goal.dailyIntake) * 100);
  const burnProgress = Math.min(100, (burn / goal.dailyBurn) * 100);

  const handleSuccess = (val: number, type: 'intake' | 'burn', message: string) => {
    if (type === 'intake') {
      setIntake((p: number) => p + val);
    } else {
      setBurn((p: number) => p + val);
    }
    
    const newLog: LogItem = {
      id: Date.now(),
      type,
      val,
      amount: 1,
      food: type === 'intake' ? { name: '', emoji: '🍔' } : null,
      exercise: type === 'burn' ? { name: '', emoji: '🔥' } : null,
      createdAt: new Date()
    };
    setLogs(prev => [newLog, ...prev]);
    
    setMsg(message);
    setTimeout(() => setMsg(''), 3000);
  };

  const handleWaterClick = async () => {
    setWaterAnimating(true);
    try {
      const result = await addWater(1);
      setWater(prev => prev + 1);
      setMsg(result.message);
      setTimeout(() => setMsg(''), 2000);
    } catch (error) {
      console.error(error);
      alert('记录失败，请重试');
    } finally {
      setTimeout(() => setWaterAnimating(false), 500);
    }
  };

  const handleGoalUpdate = async () => {
    try {
      const updatedGoal = await updateUserGoal(goalForm);
      setGoal(updatedGoal);
      setIsGoalPanelOpen(false);
      setMsg('目标已更新！');
      setTimeout(() => setMsg(''), 2000);
    } catch (error) {
      console.error(error);
      alert('更新失败，请重试');
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 pb-24 max-w-5xl mx-auto pt-24">
      <header className="mb-8 text-center md:text-left">
        <h1 className="text-4xl md:text-6xl font-black text-toon-dark mb-2 drop-shadow-[3px_3px_0px_#fff]">
          嘿，保持健康! 👋
        </h1>
        <p className="text-lg md:text-xl font-bold text-gray-500">
          今天是开始改变的最佳时机。
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-7">
          <FoodMonster 
            energy={energy} 
            message={msg}
            onOpenAction={() => setIsPanelOpen(true)} 
          />
        </div>

        <div className="md:col-span-5 flex flex-col gap-6">
          <ToonCard color="bg-toon-yellow" className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold flex items-center gap-2 text-lg">
                  <Flame className="fill-black" /> 今日热量账单
                </h3>
                <button
                  onClick={() => setIsGoalPanelOpen(true)}
                  className="p-2 hover:bg-white/50 rounded-full transition-colors"
                  title="设置目标"
                >
                  <Settings size={18} />
                </button>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-white/50 rounded-neo border-2 border-transparent hover:border-black transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-gray-600">🍔 摄入</span>
                    <span className="font-black text-xl text-red-500">
                      {intake} / {goal.dailyIntake}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${intakeProgress}%` }}
                      className="h-full bg-red-500"
                    />
                  </div>
                </div>
                <div className="p-3 bg-white/50 rounded-neo border-2 border-transparent hover:border-black transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-gray-600">🔥 消耗</span>
                    <span className="font-black text-xl text-green-500">
                      {burn} / {goal.dailyBurn}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${burnProgress}%` }}
                      className="h-full bg-green-500"
                    />
                  </div>
                </div>
                <div className="border-t-2 border-black border-dashed pt-3 flex justify-between">
                  <span className="font-black">净值</span>
                  <span className="font-black text-2xl">{intake - burn}</span>
                </div>
              </div>
            </div>
          </ToonCard>

          <ToonCard 
            color="bg-toon-blue" 
            className="cursor-pointer hover:scale-105 transition-all"
            onClick={handleWaterClick}
          >
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h3 className="font-bold flex items-center gap-2 mb-2 text-black">
                  <Droplets className="fill-black" /> 喝水打卡
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-black">{water}</span>
                  <span className="text-base font-normal text-gray-700">/ {goal.dailyWater} 杯</span>
                </div>
                <div className="mt-2 w-full h-2 bg-black/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${waterProgress}%` }}
                    className="h-full bg-black rounded-full"
                  />
                </div>
              </div>
              <motion.div 
                className="text-5xl cursor-pointer select-none"
                animate={waterAnimating ? { 
                  scale: [1, 1.3, 1],
                  rotate: [0, 15, -15, 0],
                  y: [0, -10, 0]
                } : {}}
                transition={{ duration: 0.5 }}
              >
                🥤
              </motion.div>
            </div>
          </ToonCard>

          <Link href="/calculator">
            <ToonCard color="bg-toon-dark" className="text-toon-yellow hover:bg-black transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-toon-green flex items-center gap-2">
                    <Zap className="w-5 h-5" /> 去计算新的计划
                  </h3>
                  <p className="text-sm text-gray-200">制定新的饮食计划</p>
                </div>
                <ArrowRight className="w-6 h-6 text-toon-green" />
              </div>
            </ToonCard>
          </Link>
        </div>
      </div>

      <div className="mt-12 max-w-2xl mx-auto">
        <h3 className="font-bold mb-4 text-xl">📝 今日足迹</h3>
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
          {logs.length === 0 && (
            <div className="text-center py-8 bg-white/50 rounded-neo border-2 border-dashed border-gray-300">
              <p className="text-gray-400 font-bold">还没有记录哦，快去喂怪兽吧！</p>
            </div>
          )}
          {logs.map((log) => (
            <div 
              key={log.id} 
              className="flex justify-between text-sm items-center bg-white p-3 rounded-neo border-2 border-black shadow-sm hover:shadow-neo transition-all"
            >
              <span className="truncate flex items-center gap-2">
                <span className="text-2xl">
                  {log.type === 'intake' ? log.food?.emoji : log.exercise?.emoji}
                </span>
                <span className="font-bold">
                  {log.type === 'intake' ? log.food?.name : log.exercise?.name}
                </span>
                {log.amount > 1 && (
                  <span className="text-gray-400 text-xs">x{log.amount}</span>
                )}
              </span>
              <span className={log.type === 'intake' ? "text-red-500 font-bold" : "text-green-500 font-bold"}>
                {log.type === 'intake' ? '+' : '-'}{log.val} kcal
              </span>
            </div>
          ))}
        </div>
      </div>

      <ActionPanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)}
        onSuccess={handleSuccess}
      />

      <AnimatePresence>
        {isGoalPanelOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsGoalPanelOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              className="relative w-full max-w-md z-10"
            >
              <ToonCard className="bg-white">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black flex items-center gap-2">
                    <Target size={24} /> 设置目标
                  </h2>
                  <button
                    onClick={() => setIsGoalPanelOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="font-bold block mb-2">每日摄入目标 (kcal)</label>
                    <input
                      type="number"
                      value={goalForm.dailyIntake}
                      onChange={(e) => setGoalForm({ ...goalForm, dailyIntake: Number(e.target.value) })}
                      className="w-full p-3 border-3 border-black rounded-neo"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-2">每日消耗目标 (kcal)</label>
                    <input
                      type="number"
                      value={goalForm.dailyBurn}
                      onChange={(e) => setGoalForm({ ...goalForm, dailyBurn: Number(e.target.value) })}
                      className="w-full p-3 border-3 border-black rounded-neo"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-2">每日喝水目标 (杯)</label>
                    <input
                      type="number"
                      value={goalForm.dailyWater}
                      onChange={(e) => setGoalForm({ ...goalForm, dailyWater: Number(e.target.value) })}
                      className="w-full p-3 border-3 border-black rounded-neo"
                    />
                  </div>
                  <ToonButton onClick={handleGoalUpdate} variant="success" className="w-full">
                    保存目标 ✨
                  </ToonButton>
                </div>
              </ToonCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}



