# ToonFit 开发说明

## 技术栈

项目使用 Next.js 16 构建，采用 App Router 架构。前端使用 React 19 和 TypeScript，样式使用 Tailwind CSS。动画效果通过 Framer Motion 实现。

数据层使用 Prisma ORM 连接 SQLite 数据库。服务端逻辑通过 Next.js Server Actions 实现，避免了传统 API 路由的复杂性。

表单验证使用 React Hook Form 和 Zod，确保数据输入的准确性。

## 项目结构

src/app 目录包含页面组件，使用 Next.js App Router 的文件系统路由。page.tsx 是服务器组件，负责数据获取，然后传递给客户端组件处理交互。

src/components 包含可复用的 UI 组件。ToonCard 和 ToonButton 是基础组件，提供统一的卡通风格样式。FoodMonster 和 ActionPanel 是功能组件，处理核心业务逻辑。

src/lib 目录包含工具函数和服务端逻辑。actions.ts 中定义了所有 Server Actions，包括数据查询、插入和更新操作。prisma.ts 配置 Prisma Client 的单例模式，避免开发环境下的连接问题。

prisma 目录包含数据库相关文件。schema.prisma 定义数据模型，包括 Food、Exercise、Log、WaterLog 和 UserGoal 五个模型。seed.ts 用于初始化数据库，填充食物和运动的基础数据。authoritative_data.ts 包含来自权威资料的数据。

## 数据模型

Food 模型存储食物信息，包括名称、表情符号和每单位热量。Exercise 模型存储运动信息，包括名称、表情符号和 MET 值。

Log 模型记录用户的饮食和运动记录，通过 type 字段区分是摄入还是消耗。关联到 Food 或 Exercise，记录数量和计算出的热量值。

WaterLog 模型记录喝水记录，只存储时间和数量。UserGoal 模型存储用户设置的目标值，包括每日摄入、消耗和喝水目标。

## 核心计算逻辑

BMR 计算使用 Mifflin-St Jeor 公式，根据性别、年龄、身高、体重计算基础代谢率。TDEE 通过 BMR 乘以活动系数得到。

运动消耗计算使用公式：MET 值 × 体重（kg）× 时间（小时）。MET 值来自运动生理学资料，代表不同运动的强度。

食物摄入直接使用数据库中存储的每单位热量乘以数量。

## 开发流程

本地开发使用 npm run dev 启动开发服务器。数据库使用 SQLite，文件存储在 prisma/dev.db。

首次运行需要初始化数据库。执行 npx prisma migrate dev 创建数据库结构，然后执行 npx prisma db seed 填充初始数据。

代码修改后，Prisma Client 需要重新生成。package.json 中配置了 postinstall 脚本，安装依赖时自动生成。构建时也会在 build 脚本中执行 prisma generate。

## 部署考虑

项目配置了 Vercel 和 Railway 的部署文件。Vercel 部署需要将数据库迁移到 PostgreSQL，因为 Vercel 的无服务器环境不支持 SQLite 的文件系统写入。Railway 支持 SQLite，可以直接部署。

vercel.json 中配置了构建命令，包括 Prisma Client 生成和数据库迁移。railway.json 配置了 Railway 的部署参数。

## 样式系统

使用 Tailwind CSS 的自定义配置实现卡通风格。tailwind.config.ts 中定义了主题颜色，包括 toon-yellow、toon-purple、toon-green 等。自定义了 neo 阴影和圆角，以及 3px 的边框宽度。

组件使用 cn 工具函数合并 Tailwind 类名，处理条件样式和冲突。这个函数结合了 clsx 和 tailwind-merge，确保样式正确应用。

## 状态管理

客户端状态使用 React 的 useState 管理。服务端数据通过 Server Actions 获取，在页面组件中作为 props 传递给客户端组件。

没有使用全局状态管理库，因为数据流相对简单。主页的数据通过 Server Component 获取，客户端组件只处理用户交互和本地状态更新。


