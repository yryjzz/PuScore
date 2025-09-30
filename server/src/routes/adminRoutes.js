const timeController = require("../controllers/timeController");
const checkinController = require("../controllers/checkinController");
const pointController = require("../controllers/pointController");
const productController = require("../controllers/productController");

/**
 * 注册管理员相关路由（开发环境专用）
 */
async function adminRoutes(fastify, options) {
  // 仅在非生产环境下启用管理员路由
  if (process.env.NODE_ENV === "production") {
    fastify.log.info("管理员路由在生产环境下不可用");
    return;
  }

  fastify.log.info("管理员路由已启用（开发环境）");

  // 设置系统时间
  fastify.post(
    "/time",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            timestamp: { type: "number" },
            dateString: { type: "string" },
            fastForwardHours: { type: "number" },
          },
        },
      },
    },
    timeController.setTime
  );

  // 获取时间状态
  fastify.get("/time", timeController.getTimeStatus);

  // 重置系统时间
  fastify.delete("/time", timeController.resetTime);

  // 获取系统统计
  fastify.get("/stats", timeController.getStats);

  // === 签到管理相关路由 ===
  // 手动生成签到配置
  fastify.post("/checkin/generate", checkinController.generateWeeklyCycles);

  // 查询签到周期列表
  fastify.get("/checkin/cycles", checkinController.getCheckinCycles);

  // 查询当前周的签到配置
  fastify.get("/checkin/current", checkinController.getCurrentWeekCycles);

  // 查看签到配置详情
  fastify.get("/checkin/cycles/:id", checkinController.getCheckinCycleDetail);

  // 查看商品券列表
  fastify.get("/checkin/products", checkinController.getProducts);

  // === 朴分管理相关路由 ===
  // 手动执行朴分过期
  fastify.post("/point/expire", pointController.expirePoints);

  // 检查是否为朴分过期日期
  fastify.get("/point/expire-check", pointController.checkExpireDate);

  // === 商品券管理相关路由 ===
  // 手动执行商品券过期
  fastify.post("/product/expire", productController.expireProducts);

  // 开发环境信息
  fastify.get("/info", async (request, reply) => {
    reply.send({
      code: 200,
      message: "开发环境信息",
      data: {
        environment: process.env.NODE_ENV,
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timeControlEnabled: true,
      },
    });
  });
}

module.exports = adminRoutes;
