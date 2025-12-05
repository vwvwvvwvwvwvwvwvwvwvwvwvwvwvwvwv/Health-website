'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToonButton } from './ui/ToonButton';
import { ToonCard } from './ui/ToonCard';
import { X, Utensils, Activity, Loader2, Search, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOptions, submitLog, createCustomFood, searchFoods } from '@/lib/actions';

type OptionItem = { 
  id: number; 
  name: string; 
  emoji: string; 
};

type ActionPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (calories: number, type: 'intake' | 'burn', message: string) => void;
};

export const ActionPanel = ({ isOpen, onClose, onSuccess }: ActionPanelProps) => {
  const [activeTab, setActiveTab] = useState<'intake' | 'burn'>('intake');
  const [loading, setLoading] = useState(false);
  
  const [foodOptions, setFoodOptions] = useState<OptionItem[]>([]);
  const [exerciseOptions, setExerciseOptions] = useState<OptionItem[]>([]);
  
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [amount, setAmount] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredList, setFilteredList] = useState<OptionItem[]>([]);
  const [showCustomFoodForm, setShowCustomFoodForm] = useState(false);
  const [customFood, setCustomFood] = useState({ name: '', emoji: '🍽️', calories: 100 });

  useEffect(() => {
    if (isOpen) {
      getOptions().then(data => {
        setFoodOptions(data.foods);
        setExerciseOptions(data.exercises);
        setFilteredList(activeTab === 'intake' ? data.foods : data.exercises);
      });
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    const currentList = activeTab === 'intake' ? foodOptions : exerciseOptions;
    if (searchQuery.trim()) {
      const filtered = currentList.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredList(filtered);
    } else {
      setFilteredList(currentList);
    }
  }, [searchQuery, activeTab, foodOptions, exerciseOptions]);

  const handleSubmit = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      const res = await submitLog({
        type: activeTab,
        id: selectedId,
        amount: amount
      });
      
      if (res.success) {
        onSuccess(res.resultKcal, activeTab, res.message);
        onClose();
        setAmount(activeTab === 'burn' ? 30 : 1);
        setSelectedId(null);
        setSearchQuery('');
        setShowCustomFoodForm(false);
      }
    } catch (error) {
      console.error(error);
      alert("提交出错了，请检查控制台");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomFood = async () => {
    if (!customFood.name || !customFood.calories) {
      alert('请填写完整信息');
      return;
    }
    setLoading(true);
    try {
      const newFood = await createCustomFood(customFood);
      setFoodOptions([...foodOptions, newFood]);
      setFilteredList([...foodOptions, newFood]);
      setCustomFood({ name: '', emoji: '🍽️', calories: 100 });
      setShowCustomFoodForm(false);
      setSelectedId(newFood.id);
    } catch (error) {
      console.error(error);
      alert('创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const currentList = filteredList;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            className="relative w-full max-w-lg z-10"
          >
            <ToonCard className="bg-white max-h-[85vh] overflow-y-auto flex flex-col">
              <button 
                onClick={onClose} 
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-black mb-6 text-center">
                {activeTab === 'intake' ? '我要开动了! 😋' : '我要燃烧了! 🔥'}
              </h2>

              <div className="flex gap-4 mb-6">
                <button 
                  onClick={() => { 
                    setActiveTab('intake'); 
                    setSelectedId(null); 
                    setAmount(1);
                    setSearchQuery('');
                    setShowCustomFoodForm(false);
                  }}
                  className={cn(
                    "flex-1 py-3 rounded-neo border-3 border-black font-bold transition-all",
                    activeTab === 'intake' 
                      ? "bg-toon-yellow shadow-neo" 
                      : "bg-white text-gray-400 border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <Utensils className="inline mr-2" size={18} /> 吃东西
                </button>
                <button 
                  onClick={() => { 
                    setActiveTab('burn'); 
                    setSelectedId(null); 
                    setAmount(30);
                    setSearchQuery('');
                    setShowCustomFoodForm(false);
                  }}
                  className={cn(
                    "flex-1 py-3 rounded-neo border-3 border-black font-bold transition-all",
                    activeTab === 'burn' 
                      ? "bg-toon-blue shadow-neo" 
                      : "bg-white text-gray-400 border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <Activity className="inline mr-2" size={18} /> 做运动
                </button>
              </div>

              {activeTab === 'intake' && (
                <div className="mb-4 flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="搜索食物..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border-3 border-black rounded-neo focus:outline-none focus:ring-4 ring-toon-purple/50"
                    />
                  </div>
                  <button
                    onClick={() => setShowCustomFoodForm(!showCustomFoodForm)}
                    className="px-4 py-2 bg-toon-green text-black rounded-neo border-3 border-black shadow-neo hover:bg-green-600 transition-colors font-bold flex items-center gap-2"
                  >
                    <Plus size={18} /> 添加
                  </button>
                </div>
              )}

              {showCustomFoodForm && activeTab === 'intake' && (
                <div className="mb-4 p-4 bg-toon-purple/10 rounded-neo border-2 border-dashed border-toon-purple">
                  <h4 className="font-bold mb-3">添加自定义食物</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="font-bold text-sm block mb-1">名称</label>
                      <input
                        type="text"
                        value={customFood.name}
                        onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })}
                        placeholder="例如：自制三明治"
                        className="w-full p-2 border-2 border-black rounded-neo"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-sm block mb-1">表情</label>
                        <input
                          type="text"
                          value={customFood.emoji}
                          onChange={(e) => setCustomFood({ ...customFood, emoji: e.target.value })}
                          placeholder="🍽️"
                          className="w-full p-2 border-2 border-black rounded-neo"
                          maxLength={2}
                        />
                      </div>
                      <div>
                        <label className="font-bold text-sm block mb-1">热量 (kcal)</label>
                        <input
                          type="number"
                          value={customFood.calories}
                          onChange={(e) => setCustomFood({ ...customFood, calories: Number(e.target.value) })}
                          placeholder="100"
                          className="w-full p-2 border-2 border-black rounded-neo"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleCreateCustomFood}
                      className="w-full py-2 bg-toon-purple text-black rounded-neo border-2 border-black font-bold hover:bg-purple-700 transition-colors"
                    >
                      创建食物
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 mb-6">
                {currentList.length === 0 ? (
                  <div className="col-span-3 text-center py-8">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    <p className="text-sm text-gray-500">加载中...</p>
                  </div>
                ) : (
                  currentList.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={cn(
                        "cursor-pointer p-3 border-3 rounded-neo flex flex-col items-center gap-2 transition-all",
                        selectedId === item.id 
                          ? "border-black bg-toon-purple/30 scale-105 shadow-neo" 
                          : "border-gray-200 hover:border-gray-400 hover:scale-102"
                      )}
                    >
                      <span className="text-4xl">{item.emoji}</span>
                      <span className="font-bold text-xs text-center truncate w-full">{item.name}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-neo border-2 border-dashed border-gray-300 mb-6">
                <label className="font-bold block mb-2 text-sm text-gray-500">
                  {activeTab === 'intake' ? '吃了多少份?' : '运动几分钟?'}
                </label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="1" 
                    max={activeTab === 'intake' ? 10 : 120}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                  />
                  <span className="font-black text-3xl w-20 text-right">
                    {amount}
                    <span className="text-sm font-normal text-gray-400 ml-1">
                      {activeTab === 'intake' ? '份' : 'm'}
                    </span>
                  </span>
                </div>
              </div>

              <ToonButton 
                onClick={handleSubmit} 
                variant={activeTab === 'intake' ? 'success' : 'primary'} 
                className="w-full"
                disabled={!selectedId || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    提交中...
                  </>
                ) : (
                  '记一笔! ✨'
                )}
              </ToonButton>
            </ToonCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};



