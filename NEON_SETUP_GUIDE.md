# Neon Free Tier 设置指南

## 🎯 为什么选择 Neon？

✅ **专为 Serverless 设计** - 完美适配 Vercel  
✅ **免费额度充足** - 每月 0.5GB 存储，足够小型项目使用  
✅ **跨地区性能优秀** - 全球边缘节点，延迟低  
✅ **自动连接池** - 无需额外配置  
✅ **PostgreSQL 兼容** - 与现有 Prisma 配置完全兼容  

---

## 📋 完整设置步骤

### 步骤 1: 创建 Neon 账号和项目

1. **访问 Neon 官网**
   - 打开 https://neon.tech
   - 点击 "Sign Up" 注册账号
   - 可以使用 GitHub 账号快速注册

2. **创建新项目**
   - 登录后，点击 "Create Project"
   - 填写项目信息：
     - **Project Name**: `toon-fit`（或你喜欢的名称）
     - **Region**: 选择 **美国地区**
       - `us-east-1` (N. Virginia) ⭐ 推荐
       - `us-west-1` (N. California)
     - **PostgreSQL Version**: 选择最新版本（如 16）
   - 点击 "Create Project"

3. **等待项目创建**
   - 通常需要 1-2 分钟
   - 创建完成后会自动跳转到项目页面

---

### 步骤 2: 获取连接字符串

1. **找到连接字符串**
   - 在项目页面，你会看到 "Connection string" 部分
   - 默认显示的是 "Pooled connection"（连接池）
   - 这是推荐使用的连接方式

2. **复制连接字符串**
   - 点击连接字符串旁边的复制按钮
   - 格式类似：
     ```
     postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
     ```
   
   **注意**：
   - Neon 提供两种连接方式：
     - **Pooled connection**（连接池）- 推荐，性能更好
     - **Direct connection**（直接连接）- 用于迁移等操作
   - 我们使用 **Pooled connection**

3. **保存密码**
   - Neon 会显示数据库密码
   - **重要**：复制并保存这个密码，之后无法再次查看
   - 如果忘记，需要重置密码

---

### 步骤 3: 配置 Vercel 环境变量

1. **进入 Vercel 项目设置**
   - 访问 https://vercel.com
   - 登录并选择你的项目
   - 点击 "Settings"（设置）

2. **添加环境变量**
   - 在左侧菜单找到 **"Environment Variables"**
   - 点击 "Add New"
   - 填写：
     - **Name**: `DATABASE_URL`
     - **Value**: 粘贴从 Neon 复制的连接字符串
     - **Environment**: 选择所有环境
       - ✅ Production（生产环境）
       - ✅ Preview（预览环境）
       - ✅ Development（开发环境）
   - 点击 "Save"

3. **验证环境变量**
   - 确认 `DATABASE_URL` 已添加
   - 确认应用到所有环境

---

### 步骤 4: 运行数据库迁移

1. **更新本地环境变量（可选）**
   - 如果你想在本地也使用 Neon 数据库
   - 更新 `.env.local` 文件：
     ```env
     DATABASE_URL="你从Neon复制的连接字符串"
     ```

2. **运行迁移**
   ```bash
   # 确保在项目根目录
   cd D:\toon-fit
   
   # 生成 Prisma Client
   npx prisma generate
   
   # 运行数据库迁移（创建表结构）
   npx prisma migrate deploy
   ```

3. **填充初始数据**
   ```bash
   # 运行种子脚本填充食物和运动数据
   npx prisma db seed
   ```

4. **验证数据库（可选）**
   ```bash
   # 打开 Prisma Studio 查看数据
   npx prisma studio
   ```
   - 这会打开浏览器，显示数据库内容
   - 确认表和数据已正确创建

---

### 步骤 5: 重新部署到 Vercel

1. **触发重新部署**
   - 方法 1：推送代码到 GitHub
     ```bash
     git add .
     git commit -m "Switch to Neon database"
     git push origin main
     ```
   - 方法 2：在 Vercel 控制台点击 "Redeploy"

2. **等待部署完成**
   - 通常需要 2-5 分钟
   - 可以在 Vercel 控制台查看部署进度

3. **检查部署日志**
   - 在 Vercel 项目页面
   - 点击最新的部署
   - 查看 "Build Logs"
   - 确认没有错误

---

### 步骤 6: 验证连接

1. **测试网站功能**
   - 访问你的网站
   - 测试以下功能：
     - 添加食物记录
     - 添加运动记录
     - 查看统计数据
     - 设置目标
   - 确认所有功能正常工作

2. **检查 Vercel 函数日志**
   - 在 Vercel 项目页面
   - 点击 "Functions" 标签
   - 查看函数执行日志
   - 确认没有数据库连接错误

3. **检查 Neon 控制台**
   - 登录 Neon 控制台
   - 查看项目页面
   - 确认有数据库查询活动

---

## 🔧 故障排查

### 问题 1: 迁移失败

**错误**: `Can't reach database server`

**解决**:
1. 检查连接字符串是否正确
2. 确认密码正确（注意特殊字符需要 URL 编码）
3. 检查 Neon 项目是否已创建完成
4. 尝试使用 "Direct connection" 进行迁移

### 问题 2: 连接超时

**错误**: `Connection timeout`

**解决**:
1. 确认选择了美国地区（与 Vercel 部署地区一致）
2. 检查 Neon 项目状态是否正常
3. 尝试重新创建项目

### 问题 3: 认证失败

**错误**: `Authentication failed`

**解决**:
1. 检查密码是否正确
2. 如果忘记密码，在 Neon 控制台重置密码
3. 更新 Vercel 环境变量

### 问题 4: 表不存在

**错误**: `Table does not exist`

**解决**:
1. 确认迁移已运行：`npx prisma migrate deploy`
2. 检查 Prisma schema 是否正确
3. 在 Neon 控制台查看数据库表

---

## 📊 Neon Free Tier 限制

### 免费额度

- **存储**: 0.5 GB
- **计算时间**: 每月有限
- **项目数量**: 无限制
- **连接数**: 足够小型项目使用

### 对于 ToonFit 项目

- ✅ 完全够用
- ✅ 食物和运动数据很小
- ✅ 用户日志数据增长缓慢
- ✅ 可以长期免费使用

### 超出限制后

- Neon 会暂停项目（不会删除数据）
- 可以升级到付费计划
- 或导出数据迁移到其他服务

---

## 🔄 从 Supabase 迁移到 Neon

如果你之前使用 Supabase，迁移步骤：

1. **创建 Neon 项目**（按上述步骤）

2. **运行迁移**
   ```bash
   npx prisma migrate deploy
   ```

3. **填充数据**
   ```bash
   npx prisma db seed
   ```

4. **更新 Vercel 环境变量**
   - 将 `DATABASE_URL` 更新为 Neon 连接字符串

5. **重新部署**

**注意**：如果 Supabase 中有现有数据，需要：
- 导出数据（使用 Prisma Studio 或 SQL 导出）
- 导入到 Neon（使用 SQL 导入或 Prisma）

---

## ✅ 完成检查清单

- [ ] 创建 Neon 账号
- [ ] 创建项目（选择美国地区）
- [ ] 复制连接字符串（Pooled connection）
- [ ] 保存数据库密码
- [ ] 在 Vercel 添加 `DATABASE_URL` 环境变量
- [ ] 应用到所有环境（Production, Preview, Development）
- [ ] 运行 `npx prisma generate`
- [ ] 运行 `npx prisma migrate deploy`
- [ ] 运行 `npx prisma db seed`
- [ ] 重新部署到 Vercel
- [ ] 验证网站功能正常
- [ ] 检查 Vercel 日志无错误

---

## 🎉 完成！

配置完成后，你的网站将使用 Neon 数据库，享受：
- ✅ 稳定的跨地区连接
- ✅ 优秀的 Serverless 性能
- ✅ 免费的数据库服务
- ✅ 自动备份和监控

如果遇到任何问题，参考故障排查部分或查看 Neon 文档。

---

## 📚 相关资源

- Neon 官网: https://neon.tech
- Neon 文档: https://neon.tech/docs
- Prisma 文档: https://www.prisma.io/docs
- Vercel 文档: https://vercel.com/docs


