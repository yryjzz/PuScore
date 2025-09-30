const pointController = require("../controllers/pointController");
const { authenticateToken } = require("../utils/authMiddleware");

/**
 * 注册朴分相关路由
 */
async function pointRoutes(fastify, options) {
  // 用户签到
  fastify.post(
    "/checkin",
    {
      preHandler: [authenticateToken],
      schema: {
        description: "用户签到",
        tags: ["朴分系统"],
        security: [{ bearerAuth: [] }],
      },
    },
    pointController.checkin
  );

  // 获取朴分记录
  fastify.get(
    "/records",
    {
      preHandler: [authenticateToken],
      schema: {
        description: "获取用户朴分记录",
        tags: ["朴分系统"],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            page: { type: "integer", minimum: 1, default: 1 },
            limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
            change_type: {
              type: "string",
              enum: ["checkin", "team", "exchange", "expire"],
              description: "变动类型筛选",
            },
            start_date: {
              type: "string",
              format: "date",
              description: "开始日期 YYYY-MM-DD",
            },
            end_date: {
              type: "string",
              format: "date",
              description: "结束日期 YYYY-MM-DD",
            },
          },
        },
      },
    },
    pointController.getPointRecords
  );
}

module.exports = pointRoutes;
