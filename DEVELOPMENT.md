# ToonFit 开发文档

## 项目概述

ToonFit 是一个健康管理网站，采用卡通风格设计，帮助用户追踪每日热量摄入和消耗。项目使用 Next.js 16 构建，采用现代化的全栈架构，支持服务端渲染和客户端交互。

## 技术栈

### 前端技术

- **Next.js 16.0.7**: 使用 App Router 架构，支持 Server Components 和 Client Components
- **React 19.2.0**: 最新版本的 React，支持并发特性
- **TypeScript 5**: 提供类型安全
- **Tailwind CSS 4**: 原子化 CSS 框架，自定义主题实现卡通风格
- **Framer Motion 12.23.25**: 动画库，用于页面过渡和组件动画
- **React Hook Form 7.68.0**: 表单管理库
- **Zod 4.1.13**: 数据验证库，与 React Hook Form 配合使用
- **Recharts 3.5.1**: 图表库，用于数据可视化
- **Lucide React 0.555.0**: 图标库

### 后端技术

- **Next.js Server Actions**: 服务端逻辑处理，无需传统 API 路由
- **Prisma ORM 5.22.0**: 数据库 ORM，支持类型安全的数据库操作
- **PostgreSQL**: 生产环境数据库（Supabase 托管）
- **ts-node 10.9.2**: 用于执行 TypeScript 种子脚本

### 开发工具

- **ESLint 9**: 代码检查工具
- **TypeScript**: 类型检查
- **Prisma CLI**: 数据库迁移和客户端生成

## 项目结构

```
toon-fit/
├── prisma/                    # 数据库相关文件
│   ├── schema.prisma          # Prisma 数据模型定义
│   ├── seed.ts                # 数据库种子脚本
│   ├── authoritative_data.ts  # 权威数据源（食物和运动）
│   └── migrations/            # 数据库迁移文件
│       └── 20251205204105_init_postgres/
│           └── migration.sql
├── src/
│   ├── app/                   # Next.js App Router 页面
│   │   ├── layout.tsx         # 根布局组件
│   │   ├── page.tsx           # 首页（Server Component）
│   │   ├── HomeClient.tsx     # 首页客户端组件
│   │   ├── calculator/
│   │   │   └── page.tsx       # BMR/TDEE 计算器页面
│   │   ├── statistics/
│   │   │   ├── page.tsx       # 统计页面（Server Component）
│   │   │   └── StatisticsClient.tsx  # 统计页面客户端组件
│   │   ├── globals.css        # 全局样式
│   │   └── favicon.ico        # 网站图标
│   ├── components/            # 可复用组件
│   │   ├── Navbar.tsx         # 导航栏组件
│   │   ├── FoodMonster.tsx    # 食物怪物组件（动画展示）
│   │   ├── ActionPanel.tsx    # 操作面板（记录食物/运动）
│   │   └── ui/                # 基础 UI 组件
│   │       ├── ToonCard.tsx   # 卡通风格卡片
│   │       └── ToonButton.tsx # 卡通风格按钮
│   └── lib/                   # 工具函数和服务端逻辑
│       ├── prisma.ts          # Prisma Client 单例配置
│       ├── actions.ts         # Server Actions（所有服务端逻辑）
│       └── utils.ts           # 工具函数（cn 函数等）
├── .env                       # 环境变量（不提交到 Git）
├── .gitignore                 # Git 忽略文件
├── next.config.ts             # Next.js 配置
├── tailwind.config.ts         # Tailwind CSS 配置
├── tsconfig.json              # TypeScript 配置
├── package.json               # 项目依赖和脚本
├── vercel.json                # Vercel 部署配置
└── README.md                  # 项目说明文档
```

## 数据库设计

### 数据模型

项目使用 Prisma ORM 定义数据模型，当前使用 PostgreSQL 数据库。

#### Food 模型

存储食物信息，包括名称、表情符号和每单位热量值。

```prisma
model Food {
  id       Int    @id @default(autoincrement())
  name     String
  emoji    String
  calories Int
  logs     Log[]
}
```

- `id`: 主键，自增整数
- `name`: 食物名称
- `emoji`: 表情符号，用于 UI 展示
- `calories`: 每单位热量（大卡）
- `logs`: 关联的日志记录

#### Exercise 模型

存储运动信息，包括名称、表情符号和 MET 值。

```prisma
model Exercise {
  id    Int    @id @default(autoincrement())
  name  String
  emoji String
  met   Float
  logs  Log[]
}
```

- `id`: 主键，自增整数
- `name`: 运动名称
- `emoji`: 表情符号
- `met`: MET 值（代谢当量），用于计算运动消耗
- `logs`: 关联的日志记录

#### Log 模型

记录用户的饮食和运动记录。

```prisma
model Log {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  type      String
  amount    Int
  val       Int
  foodId    Int?
  food      Food?     @relation(fields: [foodId], references: [id])
  exerciseId Int?
  exercise  Exercise? @relation(fields: [exerciseId], references: [id])
}
```

- `id`: 主键
- `createdAt`: 创建时间，自动设置为当前时间
- `type`: 类型，值为 "intake"（摄入）或 "burn"（消耗）
- `amount`: 数量（食物的份数或运动的分钟数）
- `val`: 计算出的热量值
- `foodId`: 关联的食物 ID（可选）
- `food`: 关联的食物对象
- `exerciseId`: 关联的运动 ID（可选）
- `exercise`: 关联的运动对象

#### WaterLog 模型

记录喝水记录。

```prisma
model WaterLog {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  amount    Int
}
```

- `id`: 主键
- `createdAt`: 创建时间
- `amount`: 喝水杯数

#### UserGoal 模型

存储用户设置的目标值。

```prisma
model UserGoal {
  id          Int      @id @default(autoincrement())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  dailyIntake Int      @default(2000)
  dailyBurn   Int      @default(500)
  dailyWater  Int      @default(8)
}
```

- `id`: 主键
- `createdAt`: 创建时间
- `updatedAt`: 更新时间，自动更新
- `dailyIntake`: 每日摄入目标（大卡），默认 2000
- `dailyBurn`: 每日消耗目标（大卡），默认 500
- `dailyWater`: 每日喝水目标（杯），默认 8

### 数据库关系

- `Food` 和 `Log` 是一对多关系（一个食物可以有多个日志记录）
- `Exercise` 和 `Log` 是一对多关系（一个运动可以有多个日志记录）
- `Log` 通过 `foodId` 或 `exerciseId` 关联到对应的食物或运动

### 数据初始化

项目使用 `prisma/seed.ts` 脚本初始化数据库，填充权威的食物和运动数据。数据来源：

- **食物数据**: USDA FoodData Central（美国农业部食品数据库）
- **运动数据**: Compendium of Physical Activities（运动生理学资料）

执行 `npx prisma db seed` 可以填充初始数据。

## 核心功能实现

### 1. 热量计算

#### BMR 计算（基础代谢率）

使用 Mifflin-St Jeor 公式计算：

```typescript
// 男性公式
BMR = 10 × 体重(kg) + 6.25 × 身高(cm) - 5 × 年龄 + 5

// 女性公式
BMR = 10 × 体重(kg) + 6.25 × 身高(cm) - 5 × 年龄 - 161
```

实现位置：`src/app/calculator/page.tsx`

#### TDEE 计算（每日总消耗）

```typescript
TDEE = BMR × 活动系数
```

活动系数：
- 1.2: 久坐不动
- 1.375: 轻度活动
- 1.55: 中度活动
- 1.725: 重度活动
- 1.9: 极重度活动

#### 运动消耗计算

```typescript
消耗热量 = MET 值 × 体重(kg) × 时间(小时)
```

实现位置：`src/lib/actions.ts` 的 `submitLog` 函数

#### 食物摄入计算

```typescript
摄入热量 = 食物每单位热量 × 数量
```

### 2. Server Actions

所有服务端逻辑都在 `src/lib/actions.ts` 中，使用 `'use server'` 指令标记。

主要函数：

- `getOptions()`: 获取所有食物和运动选项
- `getTodayStats()`: 获取今日统计数据
- `submitLog()`: 提交饮食或运动记录
- `addWater()`: 添加喝水记录
- `getTodayWater()`: 获取今日喝水记录
- `getWeeklyStats()`: 获取本周统计数据
- `getMonthlyStats()`: 获取本月统计数据
- `getUserGoal()`: 获取用户目标
- `updateUserGoal()`: 更新用户目标
- `createCustomFood()`: 创建自定义食物
- `searchFoods()`: 搜索食物

### 3. 数据获取流程

#### 首页数据流

1. `src/app/page.tsx`（Server Component）调用 `getTodayStats()` 和 `getUserGoal()`
2. 数据作为 props 传递给 `HomeClient.tsx`（Client Component）
3. 客户端组件处理用户交互，调用 Server Actions 更新数据
4. 使用 `revalidatePath('/')` 重新验证页面数据

#### 统计页面数据流

1. `src/app/statistics/page.tsx`（Server Component）调用 `getWeeklyStats()` 和 `getMonthlyStats()`
2. 数据传递给 `StatisticsClient.tsx`（Client Component）
3. 客户端组件使用 Recharts 渲染图表

### 4. 组件架构

#### Server Components vs Client Components

- **Server Components**: 用于数据获取，不包含交互逻辑，文件默认是 Server Component
- **Client Components**: 使用 `'use client'` 指令，用于处理用户交互、状态管理和动画

#### 组件层次

```
layout.tsx (Server Component)
  └── Navbar.tsx (Client Component)
  └── page.tsx (Server Component)
      └── HomeClient.tsx (Client Component)
          ├── FoodMonster.tsx
          ├── ActionPanel.tsx
          └── 其他 UI 组件
```

### 5. 样式系统

#### Tailwind 配置

`tailwind.config.ts` 定义了自定义主题：

- **颜色**: toon-yellow, toon-purple, toon-green, toon-pink, toon-blue, toon-dark
- **阴影**: neo（4px 4px 0px 0px），neo-hover（2px 2px 0px 0px）
- **圆角**: neo（12px）
- **边框**: 3px 宽度

#### 工具函数

`src/lib/utils.ts` 提供 `cn` 函数，用于合并 Tailwind 类名：

```typescript
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}
```

### 6. 动画效果

使用 Framer Motion 实现动画：

- 页面过渡动画
- 组件进入/退出动画
- 食物怪物的表情变化
- 进度条的动画效果

## 开发环境搭建

### 前置要求

- Node.js 18 或更高版本
- npm 或 yarn 包管理器
- PostgreSQL 数据库（本地或远程）

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/your-username/Health-management-website.git
cd Health-management-website
```

2. **安装依赖**

```bash
npm install
```

这会自动执行 `postinstall` 脚本，生成 Prisma Client。

3. **配置环境变量**

创建 `.env` 文件：

```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
```

如果使用 Supabase：

```env
DATABASE_URL="postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres?sslmode=require"
```

4. **初始化数据库**

```bash
# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# 填充初始数据
npx prisma db seed
```

5. **启动开发服务器**

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 开发工具

#### Prisma Studio

可视化数据库管理工具：

```bash
npx prisma studio
```

打开 [http://localhost:5555](http://localhost:5555) 查看和编辑数据库数据。

#### 数据库迁移

创建新的迁移：

```bash
npx prisma migrate dev --name migration_name
```

应用生产环境迁移：

```bash
npx prisma migrate deploy
```

## 开发流程

### 1. 添加新功能

1. 在 `prisma/schema.prisma` 中定义数据模型（如需要）
2. 运行 `npx prisma migrate dev --name feature_name` 创建迁移
3. 在 `src/lib/actions.ts` 中添加 Server Actions
4. 创建或修改页面组件
5. 创建或修改客户端组件处理交互
6. 测试功能

### 2. 修改数据库模型

1. 修改 `prisma/schema.prisma`
2. 运行 `npx prisma migrate dev --name migration_name`
3. 如果需要，更新 `prisma/seed.ts` 和 `prisma/authoritative_data.ts`
4. 重新生成 Prisma Client（自动执行）

### 3. 添加新的 Server Action

在 `src/lib/actions.ts` 中添加：

```typescript
'use server'

export async function newAction() {
  // 使用 prisma 进行数据库操作
  const data = await prisma.model.findMany()
  
  // 重新验证路径（如需要）
  revalidatePath('/')
  
  return data
}
```

### 4. 创建新页面

在 `src/app/` 目录下创建新文件夹，添加 `page.tsx`：

```typescript
// Server Component
import { getData } from '@/lib/actions'
import ClientComponent from './ClientComponent'

export default async function Page() {
  const data = await getData()
  return <ClientComponent initialData={data} />
}
```

### 5. 代码检查

```bash
npm run lint
```

## 部署流程

### Vercel 部署

项目已配置 Vercel 部署，配置文件为 `vercel.json`。

#### 部署步骤

1. **连接 GitHub 仓库**

在 Vercel 控制台：
- 点击 "New Project"
- 选择 GitHub 仓库
- 导入项目

2. **配置环境变量**

在 Vercel 项目设置中添加：

```
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

3. **构建配置**

Vercel 会自动识别 `vercel.json` 配置：

```json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

构建流程：
1. 安装依赖（自动执行 `postinstall`，生成 Prisma Client）
2. 运行 `prisma generate` 生成 Prisma Client
3. 运行 `prisma migrate deploy` 应用数据库迁移
4. 运行 `next build` 构建 Next.js 应用

4. **部署**

Vercel 会自动部署：
- 每次推送到 main 分支会触发自动部署
- 可以手动触发部署
- 预览部署会为每个 Pull Request 创建预览环境

#### 部署注意事项

- **数据库连接**: 确保生产环境的 `DATABASE_URL` 正确配置
- **迁移**: 首次部署会自动运行 `prisma migrate deploy`，确保数据库结构是最新的
- **种子数据**: 生产环境不会自动运行种子脚本，需要手动执行或通过管理界面添加数据
- **环境变量**: 所有敏感信息都应通过 Vercel 环境变量配置，不要提交到代码仓库

### 数据库迁移到生产环境

如果数据库是新建的，需要先运行迁移：

```bash
# 设置生产环境 DATABASE_URL
export DATABASE_URL="postgresql://..."

# 运行迁移
npx prisma migrate deploy

# 填充初始数据（可选）
npx prisma db seed
```

## 代码规范

### TypeScript

- 使用严格的类型检查
- 避免使用 `any` 类型
- 为函数参数和返回值添加类型注解
- 使用类型推断时确保类型明确

### 组件命名

- 组件文件使用 PascalCase：`HomeClient.tsx`
- Server Components 使用默认导出
- Client Components 使用 `'use client'` 指令

### 文件组织

- 页面组件放在 `src/app/` 目录
- 可复用组件放在 `src/components/` 目录
- 工具函数和服务端逻辑放在 `src/lib/` 目录
- 类型定义可以放在组件文件内或单独的 `types/` 目录

### 样式规范

- 优先使用 Tailwind CSS 工具类
- 使用 `cn` 函数合并类名
- 保持卡通风格的一致性（粗边框、圆角、阴影）

### Server Actions

- 所有 Server Actions 放在 `src/lib/actions.ts`
- 使用 `'use server'` 指令
- 使用 `revalidatePath` 或 `revalidateTag` 更新缓存
- 处理错误并返回适当的错误信息

## 常见问题

### 1. Prisma Client 未生成

**问题**: 类型错误，找不到 Prisma Client

**解决**:
```bash
npx prisma generate
```

如果问题持续，删除 `node_modules` 和 `package-lock.json`，重新安装：

```bash
rm -rf node_modules package-lock.json
npm install
```

### 2. 数据库连接失败

**问题**: 无法连接到数据库

**解决**:
- 检查 `.env` 文件中的 `DATABASE_URL` 是否正确
- 确认数据库服务是否运行
- 检查网络连接和防火墙设置
- 对于 Supabase，确保 SSL 模式设置为 `require`

### 3. 迁移失败

**问题**: `prisma migrate dev` 失败

**解决**:
- 检查数据库连接
- 查看迁移文件是否有语法错误
- 如果迁移历史不一致，可以重置数据库（仅开发环境）：
  ```bash
  npx prisma migrate reset
  ```

### 4. 构建失败

**问题**: Vercel 部署时构建失败

**解决**:
- 检查 `vercel.json` 配置是否正确
- 确认环境变量已正确设置
- 查看构建日志中的具体错误信息
- 确保 `package.json` 中的脚本正确

### 5. 类型错误

**问题**: TypeScript 类型检查失败

**解决**:
- 运行 `npx prisma generate` 更新 Prisma 类型
- 检查 `tsconfig.json` 配置
- 重启 TypeScript 服务器（VS Code: Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"）

### 6. 样式不生效

**问题**: Tailwind 样式没有应用

**解决**:
- 检查 `tailwind.config.ts` 中的 `content` 路径是否正确
- 确认类名拼写正确
- 重启开发服务器

## 性能优化

### 1. 数据库查询优化

- 使用 `include` 或 `select` 只获取需要的字段
- 使用索引优化查询（Prisma 自动创建主键和外键索引）
- 避免 N+1 查询问题

### 2. 缓存策略

- Server Components 自动缓存数据获取
- 使用 `revalidatePath` 或 `revalidateTag` 控制缓存失效
- 静态页面使用 `export const revalidate` 设置重新验证时间

### 3. 代码分割

- Next.js 自动进行代码分割
- 使用动态导入延迟加载组件：
  ```typescript
  const Component = dynamic(() => import('./Component'))
  ```

### 4. 图片优化

- 使用 Next.js Image 组件优化图片加载
- 配置适当的图片尺寸和格式

## 安全考虑

### 1. 环境变量

- 敏感信息（如数据库密码）存储在环境变量中
- `.env` 文件不应提交到 Git
- 生产环境使用 Vercel 环境变量配置

### 2. 数据验证

- 使用 Zod 验证用户输入
- Server Actions 中验证所有输入数据
- 防止 SQL 注入（Prisma 自动处理）

### 3. 错误处理

- 不要在错误信息中暴露敏感信息
- 使用适当的错误处理机制
- 记录错误日志用于调试

## 后续开发建议

### 功能扩展

1. **用户认证**: 添加用户登录和注册功能
2. **多用户支持**: 每个用户有独立的数据
3. **数据导出**: 支持导出 CSV 或 PDF 报告
4. **移动应用**: 使用 React Native 开发移动端
5. **社交功能**: 分享成就、好友对比等
6. **个性化推荐**: 基于历史数据推荐饮食和运动

### 技术优化

1. **缓存策略**: 实现更细粒度的缓存控制
2. **实时更新**: 使用 WebSocket 或 Server-Sent Events
3. **离线支持**: 使用 Service Worker 实现离线功能
4. **性能监控**: 集成性能监控工具
5. **错误追踪**: 集成错误追踪服务（如 Sentry）

## 参考资料

- [Next.js 文档](https://nextjs.org/docs)
- [Prisma 文档](https://www.prisma.io/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Framer Motion 文档](https://www.framer.com/motion/)
- [React Hook Form 文档](https://react-hook-form.com/)
- [Zod 文档](https://zod.dev/)
- [Recharts 文档](https://recharts.org/)

## 更新日志

### 2024-12-05

- 迁移数据库从 SQLite 到 PostgreSQL
- 配置 Vercel 部署
- 添加详细的开发文档
- 优化数据库查询性能
- 完善错误处理机制
