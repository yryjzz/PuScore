const checkinService = require("../services/checkinService");
const { CheckinCycle, Product } = require("../models");
const { Op } = require("sequelize");

class CheckinController {
  /**
   * 手动生成指定周的签到配置（管理员功能）
   */
  async generateWeeklyCycles(request, reply) {
    try {
      const { date } = request.query; // 可选参数：指定日期
      const targetDate = date ? new Date(date) : undefined;

      await checkinService.generateWeeklyCycles(targetDate);

      reply.send({
        code: 200,
        message: "签到配置生成成功",
        data: null,
      });
    } catch (error) {
      console.error("生成签到配置失败:", error);
      reply.status(500).send({
        code: 500,
        message: "生成签到配置失败",
        error: error.message,
      });
    }
  }

  /**
   * 查询签到周期列表
   */
  async getCheckinCycles(request, reply) {
    try {
      const { page = 1, limit = 10, start_date, end_date } = request.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // 日期筛选
      if (start_date || end_date) {
        whereClause.start_date = {};
        if (start_date) whereClause.start_date[Op.gte] = start_date;
        if (end_date) whereClause.start_date[Op.lte] = end_date;
      }

      const { count, rows } = await CheckinCycle.findAndCountAll({
        where: whereClause,
        offset,
        limit: parseInt(limit),
        order: [["start_date", "DESC"]],
        raw: true,
      });

      reply.send({
        code: 200,
        message: "查询成功",
        data: {
          cycles: rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            pages: Math.ceil(count / limit),
          },
        },
      });
    } catch (error) {
      console.error("查询签到周期失败:", error);
      reply.status(500).send({
        code: 500,
        message: "查询签到周期失败",
        error: error.message,
      });
    }
  }

  /**
   * 查询当前周的签到配置
   */
  async getCurrentWeekCycles(request, reply) {
    try {
      const { monday, sunday } = checkinService.getWeekRange();

      const cycles = await CheckinCycle.findAll({
        where: {
          start_date: monday,
          end_date: sunday,
        },
        raw: true,
      });

      reply.send({
        code: 200,
        message: "查询成功",
        data: {
          week_range: { monday, sunday },
          cycles: cycles,
          count: cycles.length,
        },
      });
    } catch (error) {
      console.error("查询当前周签到配置失败:", error);
      reply.status(500).send({
        code: 500,
        message: "查询当前周签到配置失败",
        error: error.message,
      });
    }
  }

  /**
   * 查看签到配置详情
   */
  async getCheckinCycleDetail(request, reply) {
    try {
      const { id } = request.params;

      const cycle = await CheckinCycle.findByPk(id);

      if (!cycle) {
        return reply.status(404).send({
          code: 404,
          message: "签到周期不存在",
        });
      }

      reply.send({
        code: 200,
        message: "查询成功",
        data: cycle,
      });
    } catch (error) {
      console.error("查询签到配置详情失败:", error);
      reply.status(500).send({
        code: 500,
        message: "查询签到配置详情失败",
        error: error.message,
      });
    }
  }

  /**
   * 查看商品券列表（用于签到配置）
   */
  async getProducts(request, reply) {
    try {
      const { status = 2 } = request.query; // 默认查询用于签到的商品券

      const products = await Product.findAll({
        where: { status: parseInt(status) },
        attributes: ["id", "name", "description", "points", "status"],
        raw: true,
      });

      reply.send({
        code: 200,
        message: "查询成功",
        data: {
          products,
          count: products.length,
        },
      });
    } catch (error) {
      console.error("查询商品券失败:", error);
      reply.status(500).send({
        code: 500,
        message: "查询商品券失败",
        error: error.message,
      });
    }
  }

  /**
   * 获取用户签到信息
   * 需要JWT认证，从token中获取用户ID
   */
  async getUserCheckinInfo(request, reply) {
    try {
      // 从JWT middleware中获取用户ID
      const userId = request.user.userId;

      const checkinInfo = await checkinService.getUserCheckinInfo(userId);

      reply.send({
        code: 200,
        message: "获取签到信息成功",
        data: checkinInfo,
      });
    } catch (error) {
      console.error("获取用户签到信息失败:", error);
      reply.status(500).send({
        code: 500,
        message: "获取签到信息失败",
        error: error.message,
      });
    }
  }
}

module.exports = new CheckinController();
