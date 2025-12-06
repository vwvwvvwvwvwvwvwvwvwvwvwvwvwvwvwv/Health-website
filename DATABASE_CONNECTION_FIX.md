# 数据库跨地区连接问题解决方案

## 问题描述
网站部署在美国，但数据库可能在其他地区，导致连接不稳定或超时。

## 解决方案

### 方案 1: 使用 Supabase 连接池（推荐）

Supabase 提供了连接池功能，可以显著改善跨地区连接的稳定性和性能。

#### 步骤 1: 获取连接池 URL

1. 登录 Supabase 控制台
2. 进入项目设置 → Database
3. 找到 "Connection string" 部分
4. 选择 "Connection pooling" 标签（不是 "URI"）
5. 选择 "Transaction" 模式
6. 复制连接字符串

连接池 URL 格式：
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

注意：
- 端口是 **6543**（不是 5432）
- 包含 `?pgbouncer=true` 参数

#### 步骤 2: 更新 Vercel 环境变量

1. 进入 Vercel 项目设置
2. 找到 "Environment Variables"
3. 更新 `DATABASE_URL` 为连接池 URL
4. 确保应用到所有环境（Production, Preview, Development）

#### 步骤 3: 更新 Prisma Schema（如果需要）

如果使用连接池，可能需要在连接字符串中添加额外参数：

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

### 方案 2: 迁移 Supabase 数据库到美国地区

如果可能，将 Supabase 项目迁移到美国地区：

1. 在 Supabase 控制台创建新项目
2. 选择美国地区（如 `us-east-1` 或 `us-west-1`）
3. 运行数据库迁移：
   ```bash
   npx prisma migrate deploy
   ```
4. 填充初始数据：
   ```bash
   npx prisma db seed
   ```
5. 更新 Vercel 环境变量为新数据库的连接字符串

### 方案 3: 使用 Vercel Postgres（最简单）

Vercel 提供了内置的 PostgreSQL 数据库，与部署在同一地区：

1. 在 Vercel 项目设置中
2. 找到 "Storage" 或 "Database" 部分
3. 创建 Postgres 数据库
4. 会自动添加 `DATABASE_URL` 环境变量
5. 运行迁移：
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

### 方案 4: 优化连接参数

在连接字符串中添加超时和重试参数：

```
postgresql://user:password@host:5432/database?sslmode=require&connect_timeout=10&pool_timeout=10
```

## 验证连接

部署后，检查 Vercel 函数日志，确认数据库连接是否成功。

如果仍然失败，检查：
1. 防火墙设置
2. IP 白名单（如果 Supabase 启用了）
3. SSL 证书配置
4. 网络延迟

## 推荐配置

对于生产环境，推荐使用：
- **Supabase 连接池**（端口 6543）
- 或 **Vercel Postgres**（同地区部署）

这样可以获得最佳的性能和稳定性。


