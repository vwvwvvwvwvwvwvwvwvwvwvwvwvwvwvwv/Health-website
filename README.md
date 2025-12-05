# ToonFit

健康管理网站，帮助用户追踪每日热量摄入和消耗。

## 快速开始

### 环境要求

- Node.js 18+
- PostgreSQL 数据库

### 安装依赖

```bash
npm install
```

### 配置数据库

创建 `.env` 或 `.env.local` 文件：

```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
```

### 初始化数据库

```bash
# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# 填充初始数据
npx prisma db seed
```

### 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 数据库迁移

如果从 SQLite 迁移到 PostgreSQL，请参考 `DATABASE_MIGRATION.md`。

## 项目文档

- `FEATURES.md` - 功能说明
- `DEVELOPMENT.md` - 开发说明
- `DATABASE_MIGRATION.md` - 数据库迁移指南
