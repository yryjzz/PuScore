#!/bin/bash

# PuScore 后端 Docker 部署脚本

echo "🚀 开始部署 PuScore 后端服务..."

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose 是否可用
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose 不可用，请确保 Docker Desktop 正在运行"
    exit 1
fi

# 停止并删除现有容器
echo "🛑 停止现有容器..."
docker compose down

# 删除旧镜像（可选）
echo "🧹 清理旧镜像..."
docker image prune -f

# 构建并启动服务
echo "🔨 构建并启动服务..."
docker compose up --build -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "🔍 检查服务状态..."
docker compose ps

# 检查健康状态
echo "💓 检查服务健康状态..."
curl -f http://localhost:3000/api/health && echo -e "\n✅ 服务部署成功！" || echo -e "\n❌ 服务启动失败"

echo "📋 查看日志命令: docker compose logs -f puscore-backend"
echo "🛑 停止服务命令: docker compose down"
echo "🔄 重启服务命令: docker compose restart puscore-backend"