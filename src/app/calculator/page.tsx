'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ToonCard } from '@/components/ui/ToonCard';
import { ToonButton } from '@/components/ui/ToonButton';
import { motion, AnimatePresence } from 'framer-motion';


const calculatorSchema = z.object({
  age: z.number().min(1, "年龄太小啦").max(120),
  gender: z.enum(["male", "female"]),
  weight: z.number().min(20, "体重太轻啦"),
  height: z.number().min(50),
  activityLevel: z.number(),
});

type CalculatorForm = z.infer<typeof calculatorSchema>;

export default function CalculatorPage() {
  const [result, setResult] = useState<number | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<CalculatorForm>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      gender: 'male',
      activityLevel: 1.2
    }
  });

  const onSubmit = (data: CalculatorForm) => {
    let bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age;
    bmr = data.gender === 'male' ? bmr + 5 : bmr - 161;
    const tdee = Math.round(bmr * data.activityLevel);
    setResult(tdee);
  };

  return (
    <div className="min-h-screen p-8 pt-24 flex flex-col items-center gap-8">
      <h1 className="text-4xl font-black text-black tracking-wider drop-shadow-sm">
        🔥 热量大侦探
      </h1>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        <ToonCard color="bg-toon-yellow">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="space-y-2">
              <label className="font-bold">你是...</label>
              <select {...register("gender")} className="w-full p-3 border-3 border-black rounded-neo bg-white">
                <option value="male">👦 男生</option>
                <option value="female">👧 女生</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold">体重 (kg)</label>
                <input 
                  type="number" 
                  {...register("weight", { valueAsNumber: true })}
                  className="w-full p-3 border-3 border-black rounded-neo focus:outline-none focus:ring-4 ring-toon-purple/50"
                />
                {errors.weight && <p className="text-red-500 text-sm font-bold">{errors.weight.message}</p>}
              </div>
              <div>
                <label className="font-bold">身高 (cm)</label>
                <input 
                  type="number" 
                  {...register("height", { valueAsNumber: true })}
                  className="w-full p-3 border-3 border-black rounded-neo"
                />
              </div>
            </div>

            <div>
                <label className="font-bold">年龄</label>
                <input 
                  type="number" 
                  {...register("age", { valueAsNumber: true })}
                  className="w-full p-3 border-3 border-black rounded-neo"
                />
            </div>

            <ToonButton type="submit" variant="primary">
              开始计算! 🚀
            </ToonButton>
          </form>
        </ToonCard>

        <div className="flex flex-col justify-center">
          <AnimatePresence>
            {result ? (
              <ToonCard color="bg-toon-green" className="flex flex-col items-center justify-center text-center h-full">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <h3 className="text-2xl font-bold mb-4">你的每日建议摄入量</h3>
                  <div className="text-6xl font-black text-black stroke-black text-stroke-2">
                    {result}
                  </div>
                  <span className="text-xl font-bold">Kcal</span>
                  <p className="mt-4 font-medium">相当于吃了 {Math.round(result / 250)} 个汉堡! 🍔</p>
                </motion.div>
              </ToonCard>
            ) : (
              <ToonCard color="bg-gray-100" className="flex items-center justify-center h-full border-dashed">
                <p className="text-gray-400 font-bold text-xl">等待数据输入...</p>
              </ToonCard>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
