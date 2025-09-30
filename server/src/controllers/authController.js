const authService = require("../services/authService");

class AuthController {
  /**
   * 用户注册接口
   */
  async register(request, reply) {
    try {
      const { username, password, confirmPassword } = request.body;

      const result = await authService.register(
        username,
        password,
        confirmPassword
      );

      reply.send({
        code: 200,
        message: "注册成功",
        data: result,
      });
    } catch (error) {
      reply.status(400).send({
        code: 400,
        message: error.message,
        data: null,
      });
    }
  }

  /**
   * 用户登录接口
   */
  async login(request, reply) {
    try {
      const { username, password } = request.body;

      const result = await authService.login(username, password);

      reply.send({
        code: 200,
        message: "登录成功",
        data: result,
      });
    } catch (error) {
      reply.status(400).send({
        code: 400,
        message: error.message,
        data: null,
      });
    }
  }

  /**
   * 用户登出接口（客户端清除token即可）
   */
  async logout(request, reply) {
    try {
      // JWT是无状态的，服务端无需处理，客户端清除token即可
      reply.send({
        code: 200,
        message: "登出成功",
        data: null,
      });
    } catch (error) {
      reply.status(500).send({
        code: 500,
        message: error.message,
        data: null,
      });
    }
  }

  /**
   * 修改密码接口
   */
  async changePassword(request, reply) {
    try {
      const userId = request.user.userId; // 从JWT中获取用户ID
      const { oldPassword, newPassword, confirmPassword } = request.body;

      const result = await authService.changePassword(
        userId,
        oldPassword,
        newPassword,
        confirmPassword
      );

      reply.send({
        code: 200,
        message: "密码修改成功",
        data: result,
      });
    } catch (error) {
      reply.status(400).send({
        code: 400,
        message: error.message,
        data: null,
      });
    }
  }

  /**
   * 注销账号接口
   */
  async deleteAccount(request, reply) {
    try {
      const userId = request.user.userId; // 从JWT中获取用户ID

      const result = await authService.deleteAccount(userId);

      reply.send({
        code: 200,
        message: "账号注销成功",
        data: result,
      });
    } catch (error) {
      reply.status(400).send({
        code: 400,
        message: error.message,
        data: null,
      });
    }
  }

  /**
   * 获取用户个人信息接口
   */
  async getProfile(request, reply) {
    try {
      const userId = request.user.userId; // 从JWT中获取用户ID

      const result = await authService.getUserProfile(userId);

      reply.send({
        code: 200,
        message: "获取成功",
        data: result,
      });
    } catch (error) {
      reply.status(400).send({
        code: 400,
        message: error.message,
        data: null,
      });
    }
  }
}

module.exports = new AuthController();
