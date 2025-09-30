const authService = require("../services/authService");

/**
 * JWT认证中间件
 * 验证请求头中的Authorization token
 */
const authenticateToken = async (request, reply) => {
  try {
    // 从请求头获取token
    const authorization = request.headers.authorization;

    if (!authorization) {
      return reply.status(401).send({
        code: 401,
        message: "缺少认证令牌",
        data: null,
      });
    }

    // 检查Bearer格式
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : authorization;

    if (!token) {
      return reply.status(401).send({
        code: 401,
        message: "认证令牌格式错误",
        data: null,
      });
    }

    // 验证token
    const decoded = authService.verifyToken(token);

    // 将用户信息附加到request对象
    request.user = decoded;
  } catch (error) {
    return reply.status(401).send({
      code: 401,
      message: "认证令牌无效或已过期",
      data: null,
    });
  }
};

module.exports = {
  authenticateToken,
};
