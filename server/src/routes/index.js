const authRoutes = require("./authRoutes");
const adminRoutes = require("./adminRoutes");
const pointRoutes = require("./pointRoutes");
const productRoutes = require("./productRoutes");
const teamRoutes = require("./teamRoutes");
const timeService = require("../services/timeService");

/**
 * 注册所有API路由
 */
async function routes(fastify, options) {
  // 认证相关接口 - /api/auth/*
  fastify.register(authRoutes, { prefix: "/auth" });

  // 朴分相关接口 - /api/point/*
  fastify.register(pointRoutes, { prefix: "/point" });

  // 商品相关接口 - /api/product/*
  fastify.register(productRoutes, { prefix: "/product" });

  // 组队相关接口 - /api/team/*
  fastify.register(teamRoutes, { prefix: "/team" });

  // 管理员相关接口 - /api/admin/*（仅开发环境）
  fastify.register(adminRoutes, { prefix: "/admin" });

  // 健康检查接口（使用时间服务）
  fastify.get("/health", async (request, reply) => {
    return {
      code: 200,
      message: "PuScore API服务运行正常",
      data: {
        timestamp: timeService.now().toISOString(),
        version: "1.0.0",
        timeControlEnabled: timeService.isTimeControlEnabled,
        environment: process.env.NODE_ENV || "development",
      },
    };
  });
}

module.exports = routes;
