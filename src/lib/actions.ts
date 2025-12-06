'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath, unstable_noStore } from 'next/cache'

export async function getOptions() {
  const foods = await prisma.food.findMany()
  const exercises = await prisma.exercise.findMany()
  return { foods, exercises }
}

export async function getTodayStats() {
  unstable_noStore();
  
  try {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const logs = await prisma.log.findMany({
      where: {
        createdAt: { gte: startOfDay }
      },
      include: { 
        food: true, 
        exercise: true 
      },
      orderBy: { createdAt: 'desc' }
    })

    const waterLogs = await prisma.waterLog.findMany({
      where: {
        createdAt: { gte: startOfDay }
      },
      orderBy: { createdAt: 'desc' }
    })

    const intake = logs
      .filter(l => l.type === 'intake')
      .reduce((sum, item) => sum + item.val, 0)

    const burn = logs
      .filter(l => l.type === 'burn')
      .reduce((sum, item) => sum + item.val, 0)

    const water = waterLogs.reduce((sum, item) => sum + item.amount, 0)

    return { intake, burn, water, logs, waterLogs }
  } catch (error) {
    console.error('Database error in getTodayStats:', error);
    return { intake: 0, burn: 0, water: 0, logs: [], waterLogs: [] };
  }
}

export async function submitLog(data: {
  type: 'intake' | 'burn', 
  id: number, 
  amount: number
}) {
  let resultKcal = 0
  let message = ''

  if (data.type === 'intake') {
    const food = await prisma.food.findUnique({ where: { id: data.id } })
    if (!food) throw new Error('找不到食物')
    
    resultKcal = food.calories * data.amount
    message = `你吃了 ${data.amount} 份 ${food.name}，摄入 ${resultKcal} 大卡！`
    
    await prisma.log.create({
      data: {
        type: 'intake',
        amount: data.amount,
        val: resultKcal,
        foodId: food.id
      }
    })

  } else {
    const exercise = await prisma.exercise.findUnique({ where: { id: data.id } })
    if (!exercise) throw new Error('找不到运动')

    const weight = 70 
    const hours = data.amount / 60
    resultKcal = Math.round(exercise.met * weight * hours)
    
    message = `坚持了 ${data.amount} 分钟 ${exercise.name}，燃烧了 ${resultKcal} 大卡！🔥`

    await prisma.log.create({
      data: {
        type: 'burn',
        amount: data.amount,
        val: resultKcal,
        exerciseId: exercise.id
      }
    })
  }

  revalidatePath('/')
  
  return { success: true, message, resultKcal }
}

export async function addWater(amount: number = 1) {
  await prisma.waterLog.create({
    data: {
      amount: amount
    }
  })

  revalidatePath('/')
  
  return { success: true, message: `喝了 ${amount} 杯水！💧` }
}

export async function getTodayWater() {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const waterLogs = await prisma.waterLog.findMany({
    where: {
      createdAt: { gte: startOfDay }
    },
    orderBy: { createdAt: 'desc' }
  })

  const total = waterLogs.reduce((sum, item) => sum + item.amount, 0)
  
  return { total, logs: waterLogs }
}

export async function getWeeklyStats() {
  unstable_noStore();
  
  try {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const logs = await prisma.log.findMany({
    where: {
      createdAt: { gte: startOfWeek }
    },
    include: {
      food: true,
      exercise: true
    },
    orderBy: { createdAt: 'asc' }
  })

  const waterLogs = await prisma.waterLog.findMany({
    where: {
      createdAt: { gte: startOfWeek }
    },
    orderBy: { createdAt: 'asc' }
  })

  const dailyStats = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    const dayStart = new Date(date.setHours(0, 0, 0, 0))
    const dayEnd = new Date(date.setHours(23, 59, 59, 999))

    const dayLogs = logs.filter(l => {
      const logDate = new Date(l.createdAt)
      return logDate >= dayStart && logDate <= dayEnd
    })

    const dayWater = waterLogs.filter(w => {
      const waterDate = new Date(w.createdAt)
      return waterDate >= dayStart && waterDate <= dayEnd
    })

    const intake = dayLogs
      .filter(l => l.type === 'intake')
      .reduce((sum, item) => sum + item.val, 0)

    const burn = dayLogs
      .filter(l => l.type === 'burn')
      .reduce((sum, item) => sum + item.val, 0)

    const water = dayWater.reduce((sum, item) => sum + item.amount, 0)

    return {
      date: dayStart,
      dayName: ['日', '一', '二', '三', '四', '五', '六'][i],
      intake,
      burn,
      water,
      net: intake - burn
    }
  })

  const totalIntake = dailyStats.reduce((sum, day) => sum + day.intake, 0)
  const totalBurn = dailyStats.reduce((sum, day) => sum + day.burn, 0)
  const totalWater = dailyStats.reduce((sum, day) => sum + day.water, 0)
  const avgIntake = Math.round(totalIntake / 7)
  const avgBurn = Math.round(totalBurn / 7)
  const avgWater = Math.round((totalWater / 7) * 10) / 10

  return {
    dailyStats,
    totals: {
      intake: totalIntake,
      burn: totalBurn,
      water: totalWater,
      net: totalIntake - totalBurn
    },
    averages: {
      intake: avgIntake,
      burn: avgBurn,
      water: avgWater
    }
  }
  } catch (error) {
    console.error('Database error in getWeeklyStats:', error);
    return {
      dailyStats: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(),
        dayName: ['日', '一', '二', '三', '四', '五', '六'][i],
        intake: 0,
        burn: 0,
        water: 0,
        net: 0
      })),
      totals: { intake: 0, burn: 0, water: 0, net: 0 },
      averages: { intake: 0, burn: 0, water: 0 }
    };
  }
}

export async function getMonthlyStats() {
  unstable_noStore();
  
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    startOfMonth.setHours(0, 0, 0, 0)

    const logs = await prisma.log.findMany({
    where: {
      createdAt: { gte: startOfMonth }
    },
    include: {
      food: true,
      exercise: true
    },
    orderBy: { createdAt: 'asc' }
  })

  const waterLogs = await prisma.waterLog.findMany({
    where: {
      createdAt: { gte: startOfMonth }
    },
    orderBy: { createdAt: 'asc' }
  })

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const dailyStats = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth(), i + 1)
    const dayStart = new Date(date.setHours(0, 0, 0, 0))
    const dayEnd = new Date(date.setHours(23, 59, 59, 999))

    const dayLogs = logs.filter(l => {
      const logDate = new Date(l.createdAt)
      return logDate >= dayStart && logDate <= dayEnd
    })

    const dayWater = waterLogs.filter(w => {
      const waterDate = new Date(w.createdAt)
      return waterDate >= dayStart && waterDate <= dayEnd
    })

    const intake = dayLogs
      .filter(l => l.type === 'intake')
      .reduce((sum, item) => sum + item.val, 0)

    const burn = dayLogs
      .filter(l => l.type === 'burn')
      .reduce((sum, item) => sum + item.val, 0)

    const water = dayWater.reduce((sum, item) => sum + item.amount, 0)

    return {
      date: dayStart,
      day: i + 1,
      intake,
      burn,
      water,
      net: intake - burn
    }
  })

  const totalIntake = dailyStats.reduce((sum, day) => sum + day.intake, 0)
  const totalBurn = dailyStats.reduce((sum, day) => sum + day.burn, 0)
  const totalWater = dailyStats.reduce((sum, day) => sum + day.water, 0)
  const avgIntake = Math.round(totalIntake / daysInMonth)
  const avgBurn = Math.round(totalBurn / daysInMonth)
  const avgWater = Math.round((totalWater / daysInMonth) * 10) / 10

  const weeklyBreakdown = Array.from({ length: Math.ceil(daysInMonth / 7) }, (_, weekIndex) => {
    const weekStart = weekIndex * 7
    const weekEnd = Math.min(weekStart + 7, daysInMonth)
    const weekDays = dailyStats.slice(weekStart, weekEnd)
    
    return {
      week: weekIndex + 1,
      intake: weekDays.reduce((sum, day) => sum + day.intake, 0),
      burn: weekDays.reduce((sum, day) => sum + day.burn, 0),
      water: weekDays.reduce((sum, day) => sum + day.water, 0),
      net: weekDays.reduce((sum, day) => sum + day.net, 0)
    }
  })

  return {
    dailyStats,
    weeklyBreakdown,
    totals: {
      intake: totalIntake,
      burn: totalBurn,
      water: totalWater,
      net: totalIntake - totalBurn
    },
    averages: {
      intake: avgIntake,
      burn: avgBurn,
      water: avgWater
    }
  }
  } catch (error) {
    console.error('Database error in getMonthlyStats:', error);
    const daysInMonth = new Date().getDate();
    return {
      dailyStats: Array.from({ length: daysInMonth }, (_, i) => ({
        date: new Date(),
        day: i + 1,
        intake: 0,
        burn: 0,
        water: 0,
        net: 0
      })),
      weeklyBreakdown: [],
      totals: { intake: 0, burn: 0, water: 0, net: 0 },
      averages: { intake: 0, burn: 0, water: 0 }
    };
  }
}

export async function getUserGoal() {
  unstable_noStore();
  
  try {
    let goal = await prisma.userGoal.findFirst({
    orderBy: { createdAt: 'desc' }
  })

  if (!goal) {
    goal = await prisma.userGoal.create({
      data: {
        dailyIntake: 2000,
        dailyBurn: 500,
        dailyWater: 8
      }
    })
  }

  return goal
  } catch (error) {
    console.error('Database error in getUserGoal:', error);
    return {
      id: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      dailyIntake: 2000,
      dailyBurn: 500,
      dailyWater: 8
    };
  }
}

export async function updateUserGoal(data: {
  dailyIntake?: number
  dailyBurn?: number
  dailyWater?: number
}) {
  let goal = await prisma.userGoal.findFirst({
    orderBy: { createdAt: 'desc' }
  })

  if (goal) {
    goal = await prisma.userGoal.update({
      where: { id: goal.id },
      data
    })
  } else {
    goal = await prisma.userGoal.create({
      data: {
        dailyIntake: data.dailyIntake || 2000,
        dailyBurn: data.dailyBurn || 500,
        dailyWater: data.dailyWater || 8
      }
    })
  }

  revalidatePath('/')
  return goal
}

export async function createCustomFood(data: {
  name: string
  emoji: string
  calories: number
}) {
  const food = await prisma.food.create({
    data
  })

  revalidatePath('/')
  return food
}

export async function searchFoods(query: string) {
  const allFoods = await prisma.food.findMany()
  const filtered = allFoods.filter(food =>
    food.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 20)
  return filtered
}

