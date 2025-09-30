const { sequelize } = require("../models");
const {
  User,
  UserCheckinConfig,
  CheckinCycle,
  PointRecord,
} = require("../models");
const { Op } = require("sequelize");
const timeService = require("./timeService");
const DateUtils = require("../utils/dateUtil");
const pointExpireConfig = require("../config/pointExpire");
const { createPointRecord } = require("../utils/pointUtil");

class PointService {
  /**
   * 检查用户是否有漏签
   * @param {Object} userConfig - 用户签到配置
   * @param {number} currentDay - 当前签到的天数（1-7）
   * @returns {boolean} 是否有漏签
   */
  checkMissedCheckins(userConfig, currentDay) {
    // 检查当前天之前的所有天数是否有漏签
    for (let day = 1; day < currentDay; day++) {
      const dayField = `day${day}`;
      if (userConfig[dayField] !== 1) {
        return true; // 有漏签
      }
    }
    return false; // 没有漏签
  }

  /**
   * 获取用户签到信息
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 用户签到信息
   */
  async getUserCheckinInfo(userId) {
    try {
      // 获取本周日日期 YYYY-MM-DD
      const endTime = DateUtils.getCurrentWeekSunday(timeService.now());

      // 查找用户签到配置
      const userConfig = await UserCheckinConfig.findOne({
        where: {
          user_id: userId,
          end_time: endTime,
        },
        include: [
          {
            model: CheckinCycle,
            as: "cycle",
          },
        ],
      });

      if (!userConfig) {
        throw new Error("用户签到配置不存在，请先获取签到信息");
      }

      // 获取当前是周几 本机时间 周日为7
      const dayOfWeek = DateUtils.getLocalDayOfWeek(timeService.now());

      return {
        userConfig,
        currentDayOfWeek: dayOfWeek,
        cycleConfig: userConfig.cycle.config,
      };
    } catch (error) {
      console.error("获取用户签到信息失败:", error);
      throw error;
    }
  }

  /**
   * 执行签到操作
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 签到结果
   */
  async performCheckin(userId) {
    const transaction = await sequelize.transaction();

    try {
      // 获取用户签到信息
      const { userConfig, currentDayOfWeek, cycleConfig } =
        await this.getUserCheckinInfo(userId);

      // 检查今天是否已经签到
      const dayField = `day${currentDayOfWeek}`;
      if (userConfig[dayField] === 1) {
        throw new Error("今日已签到，请勿重复签到");
      }

      // 找到今天的签到配置
      const todayConfig = cycleConfig.find(
        (config) => config.day_of_week === currentDayOfWeek
      );
      if (!todayConfig) {
        throw new Error("今日签到配置不存在");
      }

      const result = {
        success: true,
        basicPoints: todayConfig.points,
        surpriseRewards: [],
        totalPoints: todayConfig.points,
        records: [],
      };

      // 1. 记录基础签到朴分
      const basicRecord = await createPointRecord(
        userId,
        "checkin",
        todayConfig.points,
        {
          type: "签到",
          description: `第${currentDayOfWeek}天签到`,
          day_of_week: currentDayOfWeek,
          points: todayConfig.points,
        },
        transaction
      );
      result.records.push(basicRecord);

      // 2. 处理惊喜奖励（需要先检查漏签情况）
      if (todayConfig.is_surprise === 1 && todayConfig.surprise_info) {
        // 检查是否有漏签，如果有漏签则无法获得惊喜奖励
        const hasMissedDays = this.checkMissedCheckins(
          userConfig,
          currentDayOfWeek
        );

        if (hasMissedDays) {
          console.log(
            `用户${userId}因漏签无法获得第${currentDayOfWeek}天的惊喜奖励`
          );
          // 不处理惊喜奖励，但仍然可以获得基础签到朴分
        } else {
          const surpriseInfo = todayConfig.surprise_info;

          if (surpriseInfo.type === "coupon") {
            // 商品券惊喜，不需要额外朴分记录，只记录在basic记录的related_info中
            result.surpriseRewards.push({
              type: "coupon",
              coupon_id: surpriseInfo.coupon_id,
              coupon_name: surpriseInfo.coupon_name,
              coupon_description: surpriseInfo.coupon_description,
            });
          } else if (surpriseInfo.type === "lottery") {
            // 概率瓜分奖励，需要额外的朴分记录
            const lotteryResult = this.calculateLotteryReward(surpriseInfo);

            if (lotteryResult.points > 0) {
              const lotteryRecord = await createPointRecord(
                userId,
                "checkin",
                lotteryResult.points,
                {
                  type: "朴分瓜分",
                  description: `签到惊喜 - ${surpriseInfo.pool_name}`,
                  lottery_type: "checkin_surprise",
                  pool_name: surpriseInfo.pool_name,
                  points: lotteryResult.points,
                  message: lotteryResult.message,
                },
                transaction
              );
              result.records.push(lotteryRecord);
              result.totalPoints += lotteryResult.points;
            }

            result.surpriseRewards.push({
              type: "lottery",
              pool_name: surpriseInfo.pool_name,
              points: lotteryResult.points,
              message: lotteryResult.message,
            });
          }
        }
      }

      // 3. 更新签到状态
      await UserCheckinConfig.update(
        {
          [dayField]: 1,
        },
        {
          where: { id: userConfig.id },
          transaction,
        }
      );

      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      console.error("签到失败:", error);
      throw error;
    }
  }

  /**
   * 计算概率瓜分奖励
   * @param {Object} surpriseInfo - 惊喜信息
   * @returns {Object} 奖励结果
   */
  calculateLotteryReward(surpriseInfo) {
    const random = Math.random();
    let cumulativeProb = 0;

    for (const prob of surpriseInfo.probabilities) {
      cumulativeProb += prob.prob;
      if (random <= cumulativeProb) {
        return {
          points: prob.points,
          message: prob.message,
        };
      }
    }

    // 如果没有匹配到，返回最后一个
    const lastProb =
      surpriseInfo.probabilities[surpriseInfo.probabilities.length - 1];
    return {
      points: lastProb.points,
      message: lastProb.message,
    };
  }

  /**
   * 获取用户朴分记录
   * @param {number} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} 朴分记录列表
   */
  async getUserPointRecords(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        changeType = null,
        startDate = null,
        endDate = null,
      } = options;

      const whereClause = { user_id: userId };

      if (changeType) {
        whereClause.change_type = changeType;
      }

      if (startDate || endDate) {
        whereClause.created_time = {};
        if (startDate) whereClause.created_time[Op.gte] = new Date(startDate);
        if (endDate) whereClause.created_time[Op.lte] = new Date(endDate);
      }

      const records = await PointRecord.findAndCountAll({
        where: whereClause,
        order: [["created_time", "DESC"]],
        limit: limit,
        offset: (page - 1) * limit,
      });

      return {
        records: records.rows,
        total: records.count,
        page,
        limit,
        totalPages: Math.ceil(records.count / limit),
      };
    } catch (error) {
      console.error("获取朴分记录失败:", error);
      throw error;
    }
  }

  /**
   * 执行用户朴分过期操作
   * 根据配置文件中的规则执行过期操作
   * @returns {Promise<Object>} 过期操作结果
   */
  async expireUserPoints() {
    const transaction = await sequelize.transaction();

    try {
      console.log("🔄 开始执行朴分过期操作...");

      // 查询需要过期的用户
      const whereClause = {
        total_points: {
          [Op.gt]: pointExpireConfig.rules.minExpirePoints,
        },
        status: {
          [Op.in]: pointExpireConfig.rules.userStatus,
        },
      };

      const usersWithPoints = await User.findAll({
        where: whereClause,
        transaction,
      });

      if (usersWithPoints.length === 0) {
        console.log("📊 没有用户需要执行朴分过期操作");
        await transaction.commit();
        return {
          success: true,
          message: "没有用户需要执行朴分过期操作",
          data: {
            expiredUsers: 0,
            totalExpiredPoints: 0,
            expireDate: timeService.now().toISOString().split("T")[0],
            config: {
              dates: pointExpireConfig.dates,
              minExpirePoints: pointExpireConfig.rules.minExpirePoints,
            },
          },
        };
      }

      const expireResults = [];
      let totalExpiredPoints = 0;
      const expireDate = timeService.now().toISOString().split("T")[0];

      // 为每个用户执行朴分过期操作
      for (const user of usersWithPoints) {
        const currentPoints = user.total_points;

        // 创建朴分过期记录
        const expireRecord = await createPointRecord(
          user.id,
          pointExpireConfig.rules.recordType,
          -currentPoints, // 负数，表示减少
          {
            type: "过期",
            description: pointExpireConfig.rules.description,
            expire_date: expireDate,
            previous_points: currentPoints,
          },
          transaction
        );

        expireResults.push({
          userId: user.id,
          username: user.username,
          expiredPoints: currentPoints,
          recordId: expireRecord.record.id,
        });

        totalExpiredPoints += currentPoints;
      }

      await transaction.commit();

      const logMessage = `✅ 朴分过期操作完成：${expireResults.length}个用户，共过期${totalExpiredPoints}朴分`;
      console.log(logMessage);

      return {
        success: true,
        message: logMessage,
        data: {
          expiredUsers: expireResults.length,
          totalExpiredPoints,
          expireDate,
          config: {
            dates: pointExpireConfig.dates,
            minExpirePoints: pointExpireConfig.rules.minExpirePoints,
          },
          details: expireResults,
        },
      };
    } catch (error) {
      await transaction.rollback();
      console.error("朴分过期操作失败:", error);
      throw error;
    }
  }

  /**
   * 检查是否为朴分过期日期
   * @returns {boolean} 是否为过期日期
   */
  isPointExpireDate() {
    const now = timeService.now();
    const month = now.getMonth() + 1; // getMonth() 返回 0-11
    const day = now.getDate();

    return pointExpireConfig.dates.some(
      (date) => date.month === month && date.day === day
    );
  }

  /**
   * 获取下一个过期日期列表
   * @returns {Array} 下一个过期日期列表
   */
  getNextExpireDates() {
    const now = timeService.now();
    const currentYear = now.getFullYear();
    const currentDate = now.toISOString().split("T")[0];
    
    // 生成当年的过期日期
    let dates = pointExpireConfig.dates.map((date) => ({
      date: `${currentYear}-${String(date.month).padStart(2, "0")}-${String(
        date.day
      ).padStart(2, "0")}`,
      name: date.name,
    }));

    // 如果当年的所有日期都已过，添加明年的日期
    const futureDates = dates.filter((item) => item.date > currentDate);
    if (futureDates.length === 0) {
      dates = pointExpireConfig.dates.map((date) => ({
        date: `${currentYear + 1}-${String(date.month).padStart(2, "0")}-${String(
          date.day
        ).padStart(2, "0")}`,
        name: `${currentYear + 1}年${date.name}`,
      }));
    }

    // 返回未来的日期并排序
    return dates
      .filter((item) => item.date > currentDate)
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}

module.exports = new PointService();
