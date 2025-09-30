const authController = require("../controllers/authController");
const checkinController = require("../controllers/checkinController");
const { authenticateToken } = require("../utils/authMiddleware");

/**
 * 注册认证相关路由
 */
async function authRoutes(fastify, options) {
  // 用户注册
  fastify.post(
    "/register",
    {
      schema: {
        body: {
          type: "object",
          required: ["username", "password", "confirmPassword"],
          properties: {
            username: { type: "string", minLength: 3, maxLength: 20 },
            password: { type: "string", minLength: 6 },
            confirmPassword: { type: "string", minLength: 6 },
          },
        },
      },
    },
    authController.register
  );

  // 用户登录
  fastify.post(
    "/login",
    {
      schema: {
        body: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: { type: "string" },
            password: { type: "string" },
          },
        },
      },
    },
    authController.login
  );

  // 用户登出（需要认证）
  fastify.post(
    "/logout",
    {
      preHandler: [authenticateToken],
    },
    authController.logout
  );

  // 修改密码（需要认证）
  fastify.post(
    "/changepwd",
    {
      preHandler: [authenticateToken],
      schema: {
        body: {
          type: "object",
          required: ["oldPassword", "newPassword", "confirmPassword"],
          properties: {
            oldPassword: { type: "string" },
            newPassword: { type: "string", minLength: 6 },
            confirmPassword: { type: "string", minLength: 6 },
          },
        },
      },
    },
    authController.changePassword
  );

  // 注销账号（需要认证）
  fastify.delete(
    "/delete",
    {
      preHandler: [authenticateToken],
    },
    authController.deleteAccount
  );

  // 获取个人信息（需要认证）
  fastify.get(
    "/user/profile",
    {
      preHandler: [authenticateToken],
    },
    authController.getProfile
  );

  // 获取用户签到信息（需要认证）
  fastify.get(
    "/user/checkin",
    {
      preHandler: [authenticateToken],
    },
    checkinController.getUserCheckinInfo
  );
}

module.exports = authRoutes;
