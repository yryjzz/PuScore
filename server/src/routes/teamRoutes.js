const teamController = require("../controllers/teamController");
const { authenticateToken } = require("../utils/authMiddleware");

/**
 * 组队相关路由 - /api/team/*
 */
async function teamRoutes(fastify, options) {
  // 检查用户今日是否已作为队长创建组队
  fastify.get(
    "/check-created-today",
    {
      preHandler: [authenticateToken],
      schema: {
        description: "检查用户今日是否已作为队长创建组队",
        tags: ["组队系统"],
        security: [{ bearerAuth: [] }],
      },
    },
    teamController.checkUserCreatedTeamToday
  );

  // 检查用户今日是否已作为队员参与组队
  fastify.get(
    "/check-joined-today",
    {
      preHandler: [authenticateToken],
      schema: {
        description: "检查用户今日是否已作为队员参与组队",
        tags: ["组队系统"],
        security: [{ bearerAuth: [] }],
      },
    },
    teamController.checkUserJoinedTeamToday
  );

  // 检查组队码对应的组队是否过期（并更新状态）
  fastify.get(
    "/:team_code/check-expired",
    {
      schema: {
        description: "检查组队码对应的组队是否过期（并更新状态）",
        tags: ["组队系统"],
        params: {
          type: "object",
          properties: {
            team_code: {
              type: "string",
              pattern: "^[a-zA-Z0-9]{8}$",
              description: "8位混合字符组队码（数字+大小写字母）",
            },
          },
          required: ["team_code"],
        },
      },
    },
    teamController.checkTeamExpiredStatus
  );

  // 队长创建组队
  fastify.post(
    "/create",
    {
      preHandler: [authenticateToken],
      schema: {
        description: "队长创建组队",
        tags: ["组队系统"],
        security: [{ bearerAuth: [] }],
      },
    },
    teamController.createTeam
  );

  // 队员加入组队
  fastify.post(
    "/join",
    {
      preHandler: [authenticateToken],
      schema: {
        description: "队员加入组队",
        tags: ["组队系统"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["team_code"],
          properties: {
            team_code: {
              type: "string",
              pattern: "^[a-zA-Z0-9]{8}$",
              description: "8位混合字符组队码（数字+大小写字母）",
            },
          },
        },
      },
    },
    teamController.joinTeam
  );

  // 获取用户组队记录
  fastify.get(
    "/records",
    {
      preHandler: [authenticateToken],
      schema: {
        description: "获取用户组队记录",
        tags: ["组队系统"],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            page: {
              type: "integer",
              minimum: 1,
              default: 1,
              description: "页码",
            },
            limit: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 20,
              description: "每页数量",
            },
            status: {
              type: "string",
              enum: ["pending", "completed", "expired"],
              description: "组队状态筛选",
            },
            role: {
              type: "string",
              enum: ["captain", "member"],
              description: "角色筛选（captain: 队长, member: 队员）",
            },
            start_date: {
              type: "string",
              format: "date",
              description: "开始日期 (YYYY-MM-DD)",
            },
            end_date: {
              type: "string",
              format: "date",
              description: "结束日期 (YYYY-MM-DD)",
            },
          },
        },
      },
    },
    teamController.getUserTeamRecords
  );

  // 获取组队详情
  fastify.get(
    "/:team_code",
    {
      schema: {
        description: "获取组队详情",
        tags: ["组队系统"],
        params: {
          type: "object",
          properties: {
            team_code: {
              type: "string",
              pattern: "^[a-zA-Z0-9]{8}$",
              description: "8位混合字符组队码（数字+大小写字母）",
            },
          },
          required: ["team_code"],
        },
      },
    },
    teamController.getTeamDetails
  );
}

module.exports = teamRoutes;
