# 数据库跨地区连接问题 - 更多解决方案

## 方案 5: 使用 Neon（推荐用于跨地区）

Neon 是一个现代化的 PostgreSQL 服务，专为 Serverless 设计，跨地区连接性能优秀。

### 步骤：
1. 访问 https://neon.tech
2. 注册账号（免费）
3. 创建新项目
4. 选择美国地区（如 `us-east-1`）
5. 获取连接字符串
6. 更新 Vercel 环境变量

Neon 的优势：
- 专为 Serverless 优化
- 自动连接池管理
- 跨地区延迟低
- 免费额度充足

## 方案 6: 使用 Railway（简单易用）

Railway 提供简单的 PostgreSQL 部署，支持多地区。

### 步骤：
1. 访问 https://railway.app
2. 注册账号
3. 创建新项目
4. 添加 PostgreSQL 服务
5. 复制 `DATABASE_URL` 环境变量
6. 在 Vercel 中设置相同的环境变量

## 方案 7: 使用 PlanetScale（MySQL，但性能优秀）

如果愿意切换到 MySQL：
1. 访问 https://planetscale.com
2. 创建数据库
3. 使用 Prisma MySQL 驱动
4. 修改 `prisma/schema.prisma` 的 provider

## 方案 8: 优化连接字符串参数

在现有连接字符串中添加以下参数：

```
postgresql://user:password@host:5432/database?sslmode=require&connect_timeout=10&pool_timeout=10&statement_timeout=30000&application_name=toon-fit
```

参数说明：
- `connect_timeout=10`: 连接超时 10 秒
- `pool_timeout=10`: 连接池超时 10 秒
- `statement_timeout=30000`: 查询超时 30 秒
- `application_name`: 应用名称（用于监控）

## 方案 9: 使用 Prisma Data Proxy（Prisma Accelerate）

Prisma 提供了数据代理服务，可以改善跨地区连接：

1. 访问 https://www.prisma.io/data-platform
2. 创建 Accelerate 项目
3. 获取加速 URL
4. 在环境变量中添加：
   ```
   DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
   ```

## 方案 10: 添加重试逻辑（代码层面）

已在代码中添加了 `withRetry` 工具函数，可以在数据库操作失败时自动重试。

使用示例：
```typescript
import { withRetry } from '@/lib/db-retry'
import { prisma } from '@/lib/prisma'

export async function getData() {
  return await withRetry(async () => {
    return await prisma.food.findMany()
  }, 3, 1000) // 最多重试 3 次，每次间隔 1 秒
}
```

## 方案 11: 使用 Vercel Edge Functions + 数据库代理

如果使用 Edge Functions：
1. 在 Vercel 中配置 Edge Config
2. 使用数据库代理服务
3. 通过 Edge Network 减少延迟

## 方案 12: 连接健康检查

添加定期健康检查，确保连接可用：

```typescript
async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch {
    return false
  }
}
```

## 方案 13: 使用 Supabase 的 Direct Connection（如果连接池不行）

如果连接池仍有问题，尝试直接连接但添加更多参数：

```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require&connect_timeout=15&keepalives=1&keepalives_idle=30&keepalives_interval=10&keepalives_count=5
```

## 方案 14: 使用环境变量区分连接方式

可以设置两个环境变量：
- `DATABASE_URL`: 生产环境（连接池）
- `DATABASE_DIRECT_URL`: 直接连接（用于迁移）

在 `prisma/schema.prisma` 中：
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DATABASE_DIRECT_URL")
}
```

## 推荐方案优先级

1. **Neon** - 最适合 Serverless，跨地区性能好
2. **Vercel Postgres** - 最简单，同地区部署
3. **Supabase 连接池** - 如果已使用 Supabase
4. **Railway** - 简单易用
5. **代码优化** - 添加重试和超时配置（已实现）

## 快速测试连接

在 Vercel 函数中添加测试端点：

```typescript
// app/api/test-db/route.ts
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return Response.json({ status: 'connected' })
  } catch (error) {
    return Response.json({ 
      status: 'error', 
      message: error.message 
    }, { status: 500 })
  }
}
```

访问 `/api/test-db` 可以快速测试数据库连接。


