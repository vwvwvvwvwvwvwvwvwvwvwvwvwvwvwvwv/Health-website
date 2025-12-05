import { PrismaClient } from '@prisma/client'
import { AUTHORITATIVE_FOODS, AUTHORITATIVE_EXERCISES } from './authoritative_data'

const prisma = new PrismaClient()

async function main() {
  await prisma.log.deleteMany()
  await prisma.food.deleteMany()
  await prisma.exercise.deleteMany()

  console.log('📊 开始填充权威数据...')
  console.log('   数据来源：USDA FoodData Central & Compendium of Physical Activities')

  console.log(`   正在插入 ${AUTHORITATIVE_FOODS.length} 种食物...`)
  for (const food of AUTHORITATIVE_FOODS) {
    await prisma.food.create({ 
      data: {
        name: food.name,
        emoji: food.emoji,
        calories: food.calories
      }
    })
  }

  console.log(`   正在插入 ${AUTHORITATIVE_EXERCISES.length} 种运动...`)
  for (const exercise of AUTHORITATIVE_EXERCISES) {
    await prisma.exercise.create({ 
      data: {
        name: exercise.name,
        emoji: exercise.emoji,
        met: exercise.met
      }
    })
  }

  console.log('✅ 权威数据填充完毕！')
  console.log(`   - 食物：${AUTHORITATIVE_FOODS.length} 种`)
  console.log(`   - 运动：${AUTHORITATIVE_EXERCISES.length} 种`)
  console.log('   - 所有数据均来自国际权威机构')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

