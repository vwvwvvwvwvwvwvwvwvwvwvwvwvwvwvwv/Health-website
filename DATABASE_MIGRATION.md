# 数据库迁移指南

## 从 SQLite 迁移到 PostgreSQL

项目已配置为使用 PostgreSQL 远程数据库。

## 步骤 1: 创建 PostgreSQL 数据库

### 选项 1: 使用 Supabase（推荐，免费）

1. 访问 https://supabase.com
2. 注册并创建新项目
3. 在 Settings → Database 中获取连接字符串
4. 连接字符串格式：`postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`
5. 将 `[YOUR-PASSWORD]` 替换为你设置的数据库密码

### 选项 2: 使用 Vercel Postgres

1. 在 Vercel 项目设置中创建 Postgres 数据库
2. 在 Environment Variables 中会自动添加 DATABASE_URL

### 选项 3: 使用其他 PostgreSQL 服务

- Railway
- Render
- Neon
- 或其他 PostgreSQL 托管服务

## 步骤 2: 配置环境变量

创建 `.env` 或 `.env.local` 文件：

```env
DATABASE_URL="你的PostgreSQL连接字符串"
```

确保连接字符串包含：
- 用户名和密码
- 主机地址
- 端口（通常是 5432）
- 数据库名称
- SSL 模式（生产环境通常需要 `?sslmode=require`）

## 步骤 3: 运行数据库迁移

```bash
# 生成 Prisma Client
npx prisma generate

# 运行迁移创建表结构
npx prisma migrate dev --name init_postgres

# 填充初始数据
npx prisma db seed
```

## 步骤 4: 验证迁移

```bash
# 打开 Prisma Studio 查看数据
npx prisma studio
```

## 注意事项

- SQLite 和 PostgreSQL 的数据类型基本兼容，当前 schema 无需修改
- 如果之前有 SQLite 数据需要迁移，可以使用 Prisma 的数据迁移工具
- 生产环境部署时，确保 DATABASE_URL 环境变量已正确配置
- 建议使用连接池来管理数据库连接

## 部署配置

### Vercel

在 Vercel 项目设置中添加环境变量：
- 名称：`DATABASE_URL`
- 值：你的 PostgreSQL 连接字符串
- 环境：Production, Preview, Development

### Railway

Railway 会自动检测环境变量，确保 DATABASE_URL 已设置。

## 回退到 SQLite（如果需要）

如果需要回退到 SQLite 进行本地开发：

1. 修改 `prisma/schema.prisma`：
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

2. 运行迁移：
```bash
npx prisma migrate dev --name back_to_sqlite
```

