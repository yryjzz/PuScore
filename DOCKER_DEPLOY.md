# PuScore 后端 Docker 部署指南

## 文件结构

```
PuScore/
├── server/
│   ├── src/                    # 源代码
│   ├── package.json           # Node.js 依赖
│   ├── dockerfile             # Docker 镜像构建文件
│   ├── .dockerignore          # Docker 忽略文件
│   ├── .env.production        # 生产环境配置
│   └── database.sqlite        # SQLite 数据库文件
├── docker-compose.yml         # Docker Compose 配置文件
├── deploy.sh                  # 部署脚本 api_test/docker
└── verify.sh                  # 验证脚本
```

## 部署步骤

### 1. 确保 Docker 已安装并运行

```bash
# 检查 Docker 版本
docker --version
docker compose version
```

### 2. 执行部署

```bash
# 在项目根目录执行
cd /path/to/PuScore
./deploy.sh
```

### 3. 验证服务

```bash
# 验证服务状态
./verify.sh

# 手动检查
curl http://localhost:3000/api/health
```

## 常用命令

```bash
# 启动服务
docker compose up -d

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f puscore-backend

# 重启服务
docker compose restart puscore-backend

# 停止服务
docker compose down

# 重新构建并启动
docker compose up --build -d

# 进入容器
docker compose exec puscore-backend sh
```

## 环境变量说明

在 `server/.env.production` 文件中配置生产环境变量：

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
DOCKER_INIT=true
JWT_SECRET=your_super_secure_jwt_secret_here_change_in_production
TIME_CONTROL_ENABLED=false
LOG_LEVEL=info
```

## 数据持久化

- 数据库文件：`/app/data/database.sqlite`（容器内）
- 日志文件：`/app/logs/`（容器内）
- 通过 Docker 卷进行持久化存储

## 健康检查

服务包含内置健康检查：

- 端点：`http://localhost:3000/api/health`
- 检查间隔：30 秒
- 超时时间：10 秒
- 重试次数：3 次

## 故障排除

1. **容器启动失败**

   ```bash
   docker compose logs puscore-backend
   ```

2. **数据库连接问题**

   - 检查数据库文件是否存在
   - 确认数据库路径配置正确

3. **端口冲突**

   - 修改 docker-compose.yml 中的端口映射

4. **权限问题**
   - 检查文件权限
   - 确认容器内用户权限正确

## 安全建议

1. 修改默认的 JWT_SECRET
2. 使用 HTTPS（需要反向代理如 Nginx）
3. 限制容器网络访问
4. 定期备份数据库文件
5. 监控日志文件大小
