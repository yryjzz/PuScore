```
client/
├── public/                 # 静态资源（图标、全局样式等）
├── src/
│   ├── assets/             # 图片、字体等资源（按模块分类）
│   │   ├── checkin/        # 签到模块相关图片
│   │   ├── team/           # 组队模块相关图片
│   │   └── common/         # 通用资源（logo等）
│   ├── components/         # 组件（区分通用组件和业务组件）
│   │   ├── common/         # 多端共用基础组件（按钮、输入框等）
│   │   ├── checkin/        # 签到模块业务组件（签到按钮、周期展示等）
│   │   ├── team/           # 组队模块业务组件（组队卡片、成员列表等）
│   │   └── pc/             # 电脑端专用组件（宽屏表格、批量筛选器等）
│   ├── hooks/              # 自定义Hooks（多端适配核心）
│   │   ├── useDeviceLayout.js  # 屏幕判断与布局切换（关键适配逻辑）
│   │   ├── useApi.js        # API请求封装（多端共用）
│   │   └── useAuth.js       # 登录状态管理
│   ├── layouts/            # 布局组件（多端差异化布局）
│   │   ├── MobileLayout.jsx  # 移动端布局（≤768px）
│   │   ├── PcNarrowLayout.jsx # 电脑端窄屏布局（默认）
│   │   └── PcWideLayout.jsx   # 电脑端宽屏布局（可选）
│   ├── pages/              # 页面（按模块划分）
│   │   ├── Login/          # 登录页
│   │   ├── Home/           # 首页
│   │   ├── Checkin/        # 签到页
│   │   ├── Team/           # 组队页
│   │   ├── Product/        # 商品页
│   │   └── User/           # 个人中心页
│   ├── services/           # API服务封装（按模块对应后端接口）
│   │   ├── auth.js         # 登录/注册接口
│   │   ├── checkin.js      # 签到相关接口
│   │   ├── team.js         # 组队相关接口
│   │   └── point.js        # 朴分相关接口
│   ├── store/              # 状态管理（Context + useReducer）
│   │   ├── AuthContext.js  # 登录状态上下文
│   │   └── LayoutContext.js # 布局状态上下文（多端适配）
│   ├── utils/              # 工具函数
│   │   ├── date.js         # 日期处理（如周期计算）
│   │   ├── storage.js      # localStorage封装（布局偏好存储）
│   │   └── device.js       # 终端判断辅助函数
│   ├── App.jsx             # 根组件（布局切换入口）
│   ├── main.jsx            # 入口文件
│   └── vite.config.js      # Vite配置（多端编译）
└── package.json            # 前端依赖

server/
├── src/
│   ├── config/             # 配置文件
│   │   ├── database.js     # 数据库配置（SQLite连接信息）
│   │   ├── fastify.js      # Fastify配置（端口、插件等）
│   │   └── schedule.js     # 定时任务配置（如朴分过期清理）
│   ├── controllers/        # 控制器（处理请求、返回响应）
│   │   ├── authController.js  # 登录/注册控制器
│   │   ├── checkinController.js # 签到控制器
│   │   ├── teamController.js   # 组队控制器
│   │   └── pointController.js  # 朴分控制器
│   ├── models/             # Sequelize数据模型（对应数据库表）
│   │   ├── index.js        # 模型入口（初始化Sequelize）
│   │   ├── user.js         # users表模型
│   │   ├── checkinCycle.js # checkin_cycles表模型
│   │   ├── userCheckin.js  # user_checkins表模型
│   │   └── ...（其他表模型）
│   ├── routes/             # 路由配置（API网关层）
│   │   ├── index.js        # 路由入口（注册所有路由）
│   │   ├── authRoutes.js   # 认证相关路由
│   │   ├── checkinRoutes.js # 签到相关路由
│   │   └── teamRoutes.js   # 组队相关路由
│   ├── services/           # 业务服务层（核心逻辑）
│   │   ├── authService.js  # 登录/注册业务逻辑
│   │   ├── checkinService.js # 签到逻辑（周期判断、事务处理等）
│   │   ├── teamService.js  # 组队逻辑（次数限制、成员管理等）
│   │   └── pointService.js # 朴分逻辑（过期计算、余额更新等）
│   ├── utils/              # 工具函数
│   │   ├── logger.js       # 日志工具（对应工具服务层）
│   │   ├── errorHandler.js # 统一错误处理
│   │   └── date.js         # 日期工具（如季度末计算）
│   ├── jobs/               # 定时任务（工具服务层）
│   │   └── pointExpireJob.js # 朴分过期清理任务
│   └── app.js              # 应用入口（初始化Fastify、加载组件）
├── migrations/             # 数据库迁移文件（Sequelize迁移）
├── seeders/                # 测试数据种子文件
└── package.json            # 后端依赖
```
