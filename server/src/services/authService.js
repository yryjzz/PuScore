const { User } = require("../models");
const jwt = require("jsonwebtoken");
const timeService = require("./timeService");

class AuthService {
  /**
   * 用户注册
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @param {string} confirmPassword - 确认密码
   * @returns {Object} 注册结果
   */
  async register(username, password, confirmPassword) {
    // 参数验证
    if (!username || !password || !confirmPassword) {
      throw new Error("用户名、密码和确认密码不能为空");
    }

    if (password !== confirmPassword) {
      throw new Error("两次输入的密码不一致");
    }

    if (username.length < 3 || username.length > 20) {
      throw new Error("用户名长度应在3-20个字符之间");
    }

    if (password.length < 6) {
      throw new Error("密码长度不能少于6位");
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({
      where: { username },
    });

    if (existingUser) {
      throw new Error("用户名已存在");
    }

    // 创建新用户（开发模式密码明文存储）
    const user = await User.create({
      username,
      password, // 开发环境明文存储，生产环境需要加密
      total_points: 0,
      status: 1,
    });

    // 生成JWT令牌
    const token = this.generateToken(user.id, user.username);

    return {
      userId: user.id,
      username: user.username,
      token,
    };
  }

  /**
   * 用户登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Object} 登录结果
   */
  async login(username, password) {
    // 参数验证
    if (!username || !password) {
      throw new Error("用户名和密码不能为空");
    }

    // 查找用户
    const user = await User.findOne({
      where: {
        username,
        status: 1, // 仅查找正常状态的用户
      },
    });

    if (!user) {
      throw new Error("用户名或密码错误");
    }

    // 验证密码（开发模式明文对比）
    if (user.password !== password) {
      throw new Error("用户名或密码错误");
    }

    // 更新最后登录时间（使用时间服务）
    await user.update({
      last_login_time: timeService.now(),
    });

    // 生成JWT令牌
    const token = this.generateToken(user.id, user.username);

    return {
      userId: user.id,
      username: user.username,
      token,
      totalPoints: user.total_points,
    };
  }

  /**
   * 修改密码
   * @param {number} userId - 用户ID
   * @param {string} oldPassword - 原密码
   * @param {string} newPassword - 新密码
   * @param {string} confirmPassword - 确认新密码
   * @returns {Object} 修改结果
   */
  async changePassword(userId, oldPassword, newPassword, confirmPassword) {
    // 参数验证
    if (!oldPassword || !newPassword || !confirmPassword) {
      throw new Error("原密码、新密码和确认密码不能为空");
    }

    if (newPassword !== confirmPassword) {
      throw new Error("两次输入的新密码不一致");
    }

    if (newPassword.length < 6) {
      throw new Error("新密码长度不能少于6位");
    }

    if (oldPassword === newPassword) {
      throw new Error("新密码不能与原密码相同");
    }

    // 查找用户
    const user = await User.findByPk(userId);
    if (!user || user.status !== 1) {
      throw new Error("用户不存在或账号已注销");
    }

    // 验证原密码
    if (user.password !== oldPassword) {
      throw new Error("原密码错误");
    }

    // 更新密码
    await user.update({
      password: newPassword, // 开发环境明文存储
    });

    return {
      success: true,
    };
  }

  /**
   * 注销账号
   * @param {number} userId - 用户ID
   * @returns {Object} 注销结果
   */
  async deleteAccount(userId) {
    // 查找用户
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("用户不存在");
    }

    if (user.status === 0) {
      throw new Error("账号已注销");
    }

    // 软删除：将状态设为0而不是物理删除（使用时间服务）
    await user.update({
      status: 0,
      updated_at: timeService.now(),
    });

    return {
      success: true,
    };
  }

  /**
   * 获取用户个人信息
   * @param {number} userId - 用户ID
   * @returns {Object} 用户信息
   */
  async getUserProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: [
        "id",
        "username",
        "total_points",
        "last_login_time",
        "created_at",
        "status",
      ],
    });

    if (!user || user.status !== 1) {
      throw new Error("用户不存在或账号已注销");
    }

    return {
      userId: user.id,
      username: user.username,
      totalPoints: user.total_points,
      lastLoginTime: user.last_login_time,
      createdAt: user.created_at,
    };
  }

  /**
   * 生成JWT令牌
   * @param {number} userId - 用户ID
   * @param {string} username - 用户名
   * @returns {string} JWT令牌
   */
  generateToken(userId, username) {
    return jwt.sign(
      {
        userId,
        username,
      },
      process.env.JWT_SECRET || "pu-score-secret-key",
      {
        expiresIn: "7d", // 令牌7天有效期
      }
    );
  }

  /**
   * 验证JWT令牌
   * @param {string} token - JWT令牌
   * @returns {Object} 解析后的用户信息
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || "pu-score-secret-key");
    } catch (error) {
      throw new Error("无效的令牌");
    }
  }
}

module.exports = new AuthService();
