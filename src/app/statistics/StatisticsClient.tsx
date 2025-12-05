'use client';

import { useState } from 'react';
import { ToonCard } from '@/components/ui/ToonCard';
import { Calendar, TrendingUp, Droplets, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type DailyStat = {
  date: Date | string;
  dayName?: string;
  day?: number;
  intake: number;
  burn: number;
  water: number;
  net: number;
};

type WeeklyStats = {
  dailyStats: DailyStat[];
  totals: {
    intake: number;
    burn: number;
    water: number;
    net: number;
  };
  averages: {
    intake: number;
    burn: number;
    water: number;
  };
};

type MonthlyStats = {
  dailyStats: DailyStat[];
  weeklyBreakdown: Array<{
    week: number;
    intake: number;
    burn: number;
    water: number;
    net: number;
  }>;
  totals: {
    intake: number;
    burn: number;
    water: number;
    net: number;
  };
  averages: {
    intake: number;
    burn: number;
    water: number;
  };
};

type StatisticsClientProps = {
  weeklyStats: WeeklyStats;
  monthlyStats: MonthlyStats;
};

export default function StatisticsClient({ weeklyStats, monthlyStats }: StatisticsClientProps) {
  const [activeTab, setActiveTab] = useState<'week' | 'month'>('week');
  const stats = activeTab === 'week' ? weeklyStats : monthlyStats;

  const maxIntake = Math.max(...stats.dailyStats.map(d => d.intake), 1);
  const maxBurn = Math.max(...stats.dailyStats.map(d => d.burn), 1);
  const maxWater = Math.max(...stats.dailyStats.map(d => d.water), 8);

  return (
    <main className="min-h-screen p-4 md:p-8 pb-24 max-w-6xl mx-auto pt-24">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-6xl font-black text-toon-dark mb-2 drop-shadow-[3px_3px_0px_#fff]">
          📊 历史统计
        </h1>
        <p className="text-lg font-bold text-gray-500">
          查看你的健康数据趋势
        </p>
      </header>

      <div className="flex gap-4 mb-6 justify-center">
        <button
          onClick={() => setActiveTab('week')}
          className={`px-6 py-3 rounded-neo border-3 border-black font-bold transition-all ${
            activeTab === 'week'
              ? 'bg-toon-yellow shadow-neo'
              : 'bg-white hover:bg-gray-50'
          }`}
        >
          <Calendar className="inline mr-2" size={18} /> 本周
        </button>
        <button
          onClick={() => setActiveTab('month')}
          className={`px-6 py-3 rounded-neo border-3 border-black font-bold transition-all ${
            activeTab === 'month'
              ? 'bg-toon-blue shadow-neo'
              : 'bg-white hover:bg-gray-50'
          }`}
        >
          <Calendar className="inline mr-2" size={18} /> 本月
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <ToonCard color="bg-toon-yellow">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="fill-black" size={20} />
            <h3 className="font-bold">总摄入</h3>
          </div>
          <div className="text-3xl font-black">{stats.totals.intake.toLocaleString()}</div>
          <div className="text-sm text-gray-600 mt-1">
            平均: {stats.averages.intake.toLocaleString()} kcal/天
          </div>
        </ToonCard>

        <ToonCard color="bg-toon-green">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="fill-black" size={20} />
            <h3 className="font-bold">总消耗</h3>
          </div>
          <div className="text-3xl font-black">{stats.totals.burn.toLocaleString()}</div>
          <div className="text-sm text-gray-600 mt-1">
            平均: {stats.averages.burn.toLocaleString()} kcal/天
          </div>
        </ToonCard>

        <ToonCard color="bg-toon-blue">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="fill-black" size={20} />
            <h3 className="font-bold text-black">总喝水</h3>
          </div>
          <div className="text-3xl font-black text-black">{stats.totals.water}</div>
          <div className="text-sm text-gray-700 mt-1">
            平均: {stats.averages.water} 杯/天
          </div>
        </ToonCard>
      </div>

      <ToonCard color="bg-white" className="mb-8">
        <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
          <TrendingUp size={24} /> 热量趋势图表
        </h3>
        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.dailyStats.map((day, idx) => ({
              name: activeTab === 'week' ? `周${day.dayName}` : `${day.day}日`,
              intake: day.intake,
              burn: day.burn,
              net: day.net
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '3px solid black',
                  borderRadius: '12px',
                  fontWeight: 'bold'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="intake" 
                stroke="#ef4444" 
                strokeWidth={3}
                name="摄入"
                dot={{ fill: '#ef4444', r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="burn" 
                stroke="#22c55e" 
                strokeWidth={3}
                name="消耗"
                dot={{ fill: '#22c55e', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.dailyStats.map((day, idx) => ({
              name: activeTab === 'week' ? `周${day.dayName}` : `${day.day}日`,
              intake: day.intake,
              burn: day.burn
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '3px solid black',
                  borderRadius: '12px',
                  fontWeight: 'bold'
                }}
              />
              <Legend />
              <Bar dataKey="intake" fill="#ef4444" name="摄入" radius={[8, 8, 0, 0]} />
              <Bar dataKey="burn" fill="#22c55e" name="消耗" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ToonCard>

      {activeTab === 'month' && (
        <ToonCard color="bg-toon-purple" className="text-black">
          <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
            <Calendar size={24} /> 周度汇总
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            {monthlyStats.weeklyBreakdown.map((week) => (
              <div
                key={week.week}
                className="bg-white/20 p-4 rounded-neo border-2 border-white/30"
              >
                <div className="font-bold mb-2">第 {week.week} 周</div>
                <div className="space-y-1 text-sm">
                  <div>摄入: {week.intake.toLocaleString()}</div>
                  <div>消耗: {week.burn.toLocaleString()}</div>
                  <div>喝水: {week.water} 杯</div>
                  <div className="font-bold mt-2">
                    净值: {week.net > 0 ? '+' : ''}{week.net.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ToonCard>
      )}

      <ToonCard color="bg-gray-50" className="mt-8">
        <h3 className="font-bold mb-4">💡 数据说明</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• <strong>净值</strong> = 摄入 - 消耗，正数表示热量盈余，负数表示热量缺口</li>
          <li>• <strong>平均值</strong> 基于当前{activeTab === 'week' ? '周' : '月'}的所有天数计算</li>
          <li>• 数据实时更新，刷新页面即可看到最新统计</li>
        </ul>
      </ToonCard>
    </main>
  );
}

