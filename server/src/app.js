const createApp = require("./config/fastify");
const { syncDatabase } = require("./models");
const routes = require("./routes");
const { initializeProducts } = require("./utils/initData");
const checkinService = require("./services/checkinService");
const ScheduleService = require("./services/scheduleService");
require("dotenv").config(); // 加载环境变量

/**
 * 启动应用服务器
 */
const start = async () => {
  try {
    // 创建Fastify应用实例
    const app = createApp();

    // 初始化数据库
    await syncDatabase();

    // 初始化商品券数据
    await initializeProducts();

    // 生成当前周的签到配置
    await checkinService.autoGenerateCurrentWeek();

    // 启动定时任务
    ScheduleService.startAll();

    // 注册路由
    app.register(routes, { prefix: "/api" });

    // 启动服务器
    const port = process.env.PORT || 3000;
    const host = process.env.HOST || "0.0.0.0";

    await app.listen({ port, host });

    console.log(`PuScore服务器启动成功！`);
    console.log(`服务地址: http://localhost:${port}`);
    console.log(`环境模式: ${process.env.NODE_ENV || "development"}`);
  } catch (error) {
    console.error("服务器启动失败:", error);
    process.exit(1);
  }
};

// 优雅关闭处理
process.on("SIGINT", () => {
  console.log("\n接收到关闭信号，正在优雅关闭服务器...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n接收到终止信号，正在优雅关闭服务器...");
  process.exit(0);
});

// 启动应用
start();
