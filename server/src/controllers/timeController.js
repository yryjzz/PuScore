const timeService = require("../services/timeService");

class TimeController {
  /**
   * 设置系统时间
   */
  async setTime(request, reply) {
    try {
      const { timestamp, dateString, fastForwardHours } = request.body;

      let result;

      if (fastForwardHours !== undefined) {
        // 时间快进
        result = timeService.fastForward(fastForwardHours);
      } else if (timestamp) {
        // 设置具体时间戳
        result = timeService.setSystemTime(timestamp);
      } else if (dateString) {
        // 设置具体日期字符串
        result = timeService.setSystemTime(dateString);
      } else {
        throw new Error(
          "请提供 timestamp、dateString 或 fastForwardHours 参数"
        );
      }

      reply.send({
        code: 200,
        message: "系统时间设置成功",
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
   * 获取时间状态
   */
  async getTimeStatus(request, reply) {
    try {
      const status = timeService.getTimeStatus();

      reply.send({
        code: 200,
        message: "获取时间状态成功",
        data: status,
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
   * 重置系统时间
   */
  async resetTime(request, reply) {
    try {
      const result = timeService.resetSystemTime();

      reply.send({
        code: 200,
        message: "系统时间已重置",
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
   * 获取系统统计信息（扩展功能）
   */
  async getStats(request, reply) {
    try {
      const { User } = require("../models");

      // 统计用户数量
      const userCount = await User.count({
        where: { status: 1 },
      });

      // 统计总朴分
      const totalPointsResult = await User.sum("total_points", {
        where: { status: 1 },
      });

      const timeStatus = timeService.getTimeStatus();

      reply.send({
        code: 200,
        message: "获取系统统计成功",
        data: {
          userCount,
          totalPoints: totalPointsResult || 0,
          timeStatus,
          serverStartTime:
            process.env.SERVER_START_TIME || new Date().toISOString(),
        },
      });
    } catch (error) {
      reply.status(500).send({
        code: 500,
        message: error.message,
        data: null,
      });
    }
  }
}

module.exports = new TimeController();
