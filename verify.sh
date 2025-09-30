#!/bin/bash

# PuScore 后端服务验证脚本

echo "🔍 正在验证 PuScore 后端服务..."

# 检查容器状态
echo "📊 容器状态:"
docker compose ps

echo ""

# 检查健康状态
echo "💓 健康检查:"
HEALTH_RESPONSE=$(curl -s http://localhost:3000/api/health)
if [[ $? -eq 0 ]]; then
    echo "✅ 健康检查通过"
    echo "📝 响应: $HEALTH_RESPONSE"
else
    echo "❌ 健康检查失败"
    exit 1
fi

echo ""

# 检查容器资源使用
echo "📈 资源使用情况:"
docker stats puscore-server --no-stream

echo ""

# 显示最新日志
echo "📋 最新日志 (最后 10 行):"
docker compose logs puscore-backend --tail 10

echo ""
echo "✅ PuScore 后端服务运行正常！"
echo ""
echo "🌐 API 地址: http://localhost:3000/api"
echo "💓 健康检查: http://localhost:3000/api/health"
echo ""
echo "📋 常用命令:"
echo "  查看日志: docker compose logs -f puscore-backend"
echo "  重启服务: docker compose restart puscore-backend"
echo "  停止服务: docker compose down"
echo "  进入容器: docker compose exec puscore-backend sh"