const pointService = require("../services/pointService");

/**
 * 生成签到成功消息
 * @param {Object} result - 签到结果
 * @returns {string} 签到消息
 */
function generateCheckinMessage(result) {
  let message = `签到成功！获得${result.basicPoints}朴分`;

  if (result.surpriseRewards.length > 0) {
    result.surpriseRewards.forEach((reward) => {
      if (reward.type === "coupon") {
        message += `，惊喜获得${reward.coupon_name}`;
      } else if (reward.type === "lottery") {
        message += `，${reward.message}`;
      }
    });
  }

  return message;
}

class PointController {
  /**
   * 用户签到接口
   */
  async checkin(request, reply) {
    try {
      // 从JWT middleware中获取用户ID
      const userId = request.user.userId;

      const result = await pointService.performCheckin(userId);

      reply.send({
        code: 200,
        message: "签到成功",
        data: {
          success: result.success,
          basic_points: result.basicPoints,
          total_points_earned: result.totalPoints,
          surprise_rewards: result.surpriseRewards,
          message: generateCheckinMessage(result),
        },
      });
    } catch (error) {
      console.error("用户签到失败:", error);
      reply.status(400).send({
        code: 400,
        message: error.message,
        data: null,
      });
    }
  }

  /**
   * 获取用户朴分记录
   */
  async getPointRecords(request, reply) {
    try {
      const userId = request.user.userId;
      const { page, limit, change_type, start_date, end_date } = request.query;

      const result = await pointService.getUserPointRecords(userId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        changeType: change_type,
        startDate: start_date,
        endDate: end_date,
      });

      reply.send({
        code: 200,
        message: "获取朴分记录成功",
        data: result,
      });
    } catch (error) {
      console.error("获取朴分记录失败:", error);
      reply.status(500).send({
        code: 500,
        message: "获取朴分记录失败",
        error: error.message,
      });
    }
  }

  /**
   * 手动执行朴分过期操作
   * POST /api/admin/point/expire
   */
  async expirePoints(request, reply) {
    try {
      console.log("管理员手动触发朴分过期操作");

      const result = await pointService.expireUserPoints();

      reply.send({
        code: 200,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error("手动朴分过期操作失败:", error);
      reply.status(500).send({
        code: 500,
        message: "朴分过期操作失败",
        error: error.message,
      });
    }
  }

  /**
   * 检查当前日期是否为朴分过期日
   * GET /api/admin/point/expire-check
   */
  async checkExpireDate(request, reply) {
    try {
      const isExpireDate = pointService.isPointExpireDate();
      const nextExpireDates = pointService.getNextExpireDates();
      const timeService = require("../services/timeService");
      const currentDate = timeService.now();
      const pointExpireConfig = require("../config/pointExpire");

      reply.send({
        code: 200,
        message: "获取朴分过期日期检查结果成功",
        data: {
          currentDate: currentDate.toISOString().split("T")[0],
          currentDateTime: currentDate.toISOString(),
          isExpireDate: isExpireDate,
          config: {
            dates: pointExpireConfig.dates,
            time: `${String(pointExpireConfig.time.hour).padStart(
              2,
              "0"
            )}:${String(pointExpireConfig.time.minute).padStart(2, "0")}`,
            autoExpire: pointExpireConfig.execution.autoExpire,
          },
          nextExpireDates: nextExpireDates.slice(0, 5), // 只返回前5个即将到来的过期日期
        },
      });
    } catch (error) {
      console.error("检查朴分过期日期失败:", error);
      reply.status(500).send({
        code: 500,
        message: "检查朴分过期日期失败",
        error: error.message,
      });
    }
  }
}

module.exports = new PointController();
