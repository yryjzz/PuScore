# PuScore 朴分系统 - 前端应用

## 概述

PuScore 前端是一个基于 React + Vite 的赛博朋克风格 H5 应用，专为移动端设计，复现手机 APP 的使用体验。

## 技术栈

- **框架**: React 19.1.1
- **构建工具**: Vite 7.1.7
- **路由**: React Router DOM
- **HTTP 客户端**: Axios
- **样式**: CSS3 + CSS Variables
- **字体**: Google Fonts (Orbitron, Rajdhani)
- **设计风格**: 赛博朋克 (Cyberpunk)

## 已实现功能

### ✅ 用户认证系统

- [x] 用户登录 (`/login`)
- [x] 用户注册 (`/register`)
- [x] 修改密码 (`/change-password`)
- [x] 退出登录
- [x] 路由保护
- [x] 自动 Token 管理

### ✅ 核心界面

- [x] 登录页面 - 赛博朋克风格设计
- [x] 注册页面 - 完整表单验证
- [x] 仪表板页面 - 用户信息展示
- [x] 修改密码页面 - 安全密码更新

### ✅ UI 组件库

- [x] 输入框组件 (Input) - 支持密码显示切换
- [x] 按钮组件 (Button) - 多种变体和状态
- [x] 卡片组件 (Card) - 统一的容器样式
- [x] 加载组件 - 优雅的加载动画

### ✅ 设计特色

- [x] 赛博朋克配色方案 (霓虹蓝、粉、绿等)
- [x] 动态背景效果 (电路线、浮动粒子)
- [x] 霓虹发光效果
- [x] 故障风格动画
- [x] 响应式设计 (移动端优先)

## 开发环境

### 启动开发服务器

```bash
cd /Users/pupu/Desktop/PuScore/client
npm run dev  # 启动开发服务器
```

服务器将在 `http://localhost:5173/` 启动

### API 集成

- 后端 API 地址: `http://localhost:3000/api`
- 使用 JWT Token 认证
- 自动处理 Token 存储和请求拦截

## 下一步开发计划

1. **签到系统** - 签到日历和奖励展示
2. **商品兑换** - 商品券列表和兑换功能
3. **组队功能** - 创建和加入组队
4. **UI/UX 优化** - 更多交互动画和效果

---

**版本**: v1.0.0 - Cyberpunk Edition  
**状态**: 认证功能已完成 ✅+ Vite