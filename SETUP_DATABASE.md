# 数据库配置步骤

## 步骤 1: 创建 PostgreSQL 数据库

### 推荐：使用 Supabase（免费）

1. 访问 https://supabase.com
2. 注册账号并登录
3. 点击 "New Project"
4. 填写项目信息：
   - Project Name: toon-fit
   - Database Password: 设置一个强密码（记住它）
   - Region: 选择离你最近的区域
5. 点击 "Create new project"
6. 等待数据库创建完成（约 2 分钟）

### 获取连接字符串

1. 在 Supabase 项目页面，点击左侧 "Settings"
2. 选择 "Database"
3. 找到 "Connection string" 部分
4. 选择 "URI" 标签
5. 复制连接字符串，格式类似：
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
6. 将 `[YOUR-PASSWORD]` 替换为你设置的数据库密码

## 步骤 2: 配置环境变量

在项目根目录创建 `.env` 文件，添加：

```env
DATABASE_URL="你从Supabase复制的完整连接字符串"
```

例如：
```env
DATABASE_URL="postgresql://postgres:yourpassword@db.xxxxx.supabase.co:5432/postgres?sslmode=require"
```

## 步骤 3: 运行数据库迁移

配置好 DATABASE_URL 后，运行：

```bash
npx prisma migrate dev --name init_postgres
npx prisma db seed
```

## 其他数据库选项

### Vercel Postgres
- 在 Vercel 项目设置中创建 Postgres 数据库
- 会自动添加 DATABASE_URL 环境变量

### Railway
- 在 Railway 项目中添加 PostgreSQL 服务
- 会自动提供 DATABASE_URL

### Neon
- 访问 https://neon.tech
- 创建免费 PostgreSQL 数据库
- 获取连接字符串


