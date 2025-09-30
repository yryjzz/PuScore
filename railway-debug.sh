#!/bin/bash

# Railway 部署调试脚本

echo "🔍 Railway 部署调试信息"
echo "========================"

echo "📂 当前目录结构:"
echo "根目录内容:"
ls -la

echo ""
echo "server 目录内容:"
if [ -d "server" ]; then
    ls -la server/
else
    echo "❌ server 目录不存在"
fi

echo ""
echo "📋 package.json 检查:"
if [ -f "server/package.json" ]; then
    echo "✅ server/package.json 存在"
    echo "Scripts 配置:"
    cat server/package.json | grep -A 10 '"scripts"'
else
    echo "❌ server/package.json 不存在"
fi

echo ""
echo "🔧 配置文件检查:"
echo "railway.toml:" 
if [ -f "server/railway.toml" ]; then
    echo "✅ 存在"
    cat server/railway.toml
else
    echo "❌ 不存在"
fi

echo ""
echo "nixpacks.toml:"
if [ -f "server/nixpacks.toml" ]; then
    echo "✅ 存在" 
    cat server/nixpacks.toml
else
    echo "❌ 不存在"
fi

echo ""
echo "Procfile:"
if [ -f "server/Procfile" ]; then
    echo "✅ 存在"
    cat server/Procfile
else
    echo "❌ 不存在"
fi

echo ""
echo "💡 Railway 配置建议:"
echo "1. Root Directory: server"
echo "2. 让 Railway 自动检测构建和启动命令"
echo "3. 或手动设置:"
echo "   - Build Command: npm ci --only=production"
echo "   - Start Command: npm start"