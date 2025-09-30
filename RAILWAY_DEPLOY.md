# Railway.app 部署指南

## 前置条件

1. GitHub 仓库已推送最新代码
2. Railway 账户已创建
3. 代码结构正确

## 部署步骤

### 1. 连接 Railway

- 访问 https://railway.app
- 使用 GitHub 账户登录
- 选择 "New Project" → "Deploy from GitHub repo"
- 选择你的 PuScore 仓库

### 2. 配置服务

- 设置 Root Directory: `server`
- Start Command: `npm start`
- Build Command: `npm install`

### 3. 环境变量配置

在 Railway 项目设置中添加以下环境变量：

```
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
JWT_SECRET=your_super_secure_jwt_secret_change_this
TIME_CONTROL_ENABLED=false
RAILWAY_DEPLOYMENT=true
```

## 注意事项

### ✅ 优势

- Node.js 应用，Railway 原生支持
- 代码结构清晰，依赖明确
- 端口配置正确（使用环境变量）

### ⚠️ 需要调整的地方

1. **数据库路径问题**：需要修改数据库配置以适配 Railway
2. **SQLite 持久化**：Railway 重启会丢失文件，建议改用 PostgreSQL
3. **文件上传**：如果有文件上传需求，需要使用云存储

### 🔧 推荐修改

1. 使用 Railway 提供的 PostgreSQL 数据库
2. 调整数据库配置以支持多种数据库类型

## 详细部署流程

### 4. 添加 PostgreSQL 数据库

- 在 Railway 项目中点击 "Add Service"
- 选择 "Database" → "PostgreSQL"
- Railway 会自动创建 DATABASE_URL 环境变量

### 5. 完整环境变量配置

```
NODE_ENV=production
RAILWAY_DEPLOYMENT=true
JWT_SECRET=your_super_secure_jwt_secret_change_this
TIME_CONTROL_ENABLED=false
```

### 6. 验证部署

部署成功后，访问以下端点验证：

- `https://your-app.railway.app/api/health` - 健康检查
- `https://your-app.railway.app/api/auth/register` - 注册接口

## 部署前检查

运行检查脚本确保配置正确：

```bash
./railway-check.sh
```

## 故障排除

### 常见问题

1. **数据库连接失败**：检查 DATABASE_URL 是否正确配置
2. **端口绑定错误**：确保使用 process.env.PORT
3. **依赖安装失败**：检查 package.json 中的依赖版本

### 查看日志

在 Railway 控制台中查看部署日志和运行时日志
