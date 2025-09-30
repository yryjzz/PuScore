#!/bin/bash

# Railway 部署前检查脚本

echo "🚄 Railway 部署前检查..."

# 检查必要文件
echo "📂 检查文件结构..."
if [ ! -f "server/package.json" ]; then
    echo "❌ 缺少 server/package.json"
    exit 1
fi

if [ ! -f "server/src/app.js" ]; then
    echo "❌ 缺少 server/src/app.js"
    exit 1
fi

echo "✅ 文件结构检查通过"

# 检查 package.json 配置
echo "📋 检查 package.json..."
cd server

if ! grep -q '"start"' package.json; then
    echo "❌ package.json 缺少 start 脚本"
    exit 1
fi

if ! grep -q '"pg"' package.json; then
    echo "❌ package.json 缺少 PostgreSQL 驱动"
    exit 1
fi

echo "✅ package.json 检查通过"

# 检查环境变量配置
echo "🔧 检查环境变量配置..."
if [ ! -f ".env.railway" ]; then
    echo "⚠️  建议创建 .env.railway 文件作为参考"
fi

echo "✅ 环境变量配置检查完成"

# 测试依赖安装
echo "📦 测试依赖安装..."
if ! npm install --dry-run > /dev/null 2>&1; then
    echo "❌ 依赖安装测试失败"
    exit 1
fi

echo "✅ 依赖安装测试通过"

cd ..

echo ""
echo "🎉 Railway 部署检查完成！"
echo ""
echo "📝 Railway 部署步骤："
echo "1. 推送代码到 GitHub"
echo "2. 在 Railway 中连接 GitHub 仓库"
echo "3. 设置 Root Directory 为 'server'"
echo "4. 添加 PostgreSQL 数据库服务"
echo "5. 配置环境变量："
echo "   - NODE_ENV=production"
echo "   - RAILWAY_DEPLOYMENT=true"
echo "   - JWT_SECRET=your_secure_secret"
echo "   - TIME_CONTROL_ENABLED=false"
echo "6. 部署启动"
echo ""
echo "🔗 Railway 会自动提供："
echo "   - PORT (端口)"
echo "   - DATABASE_URL (PostgreSQL 连接字符串)"