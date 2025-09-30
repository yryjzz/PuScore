const { Op } = require("sequelize");
const { Product, CheckinCycle, UserCheckinConfig } = require("../models");
const checkinConfig = require("../config/checkin");
const timeService = require("./timeService");
const DateUtils = require("../utils/dateUtil");

class CheckinService {
  /**
   * 获取当前周的周一和周日日期
   * @param {Date} date - 基准日期
   * @returns {Object} - {monday, sunday}
   */
  getWeekRange(date = timeService.now()) {
    const monday = DateUtils.getCurrentWeekMonday(date);
    const sunday = DateUtils.getCurrentWeekSunday(date);
    return { monday, sunday };
  }

  /**
   * 生成随机朴分
   * @returns {number}
   */
  generateRandomPoints() {
    const { min, max } = checkinConfig.points;
    return Math.floor(Math.random() * (max - min + 1)) + min; // random [0,1)
  }

  /**
   * 从商品表中随机选择一个status为2的商品券
   * @returns {Promise<Object|null>}
   */
  async getRandomCoupon() {
    try {
      const coupons = await Product.findAll({
        where: { status: 2 },
        raw: true,
      });

      if (coupons.length === 0) {
        console.warn("没有可用的商品券（status=2）");
        return null;
      }

      const randomIndex = Math.floor(Math.random() * coupons.length);
      return coupons[randomIndex];
    } catch (error) {
      console.error("获取随机商品券失败:", error);
      return null;
    }
  }

  /**
   * 生成瓜分奖励信息
   * @returns {Object}
   */
  generateLotteryReward() {
    const { pools } = checkinConfig.surpriseConfig.rewardTypes.lottery;
    const randomPool = pools[Math.floor(Math.random() * pools.length)];

    return {
      type: "lottery",
      pool_name: randomPool.name,
      total_points: randomPool.totalPoints,
      probabilities: randomPool.probabilities,
    };
  }

  /**
   * 生成一周的签到配置
   * @returns {Promise<Array>}
   */
  async generateWeeklyConfig() {
    const weekConfig = [];

    // 确定有惊喜的天数
    const { min, max } = checkinConfig.surpriseConfig.surpriseDaysRange;
    const surpriseDays = Math.floor(Math.random() * (max - min + 1)) + min;

    // 随机选择哪几天有惊喜
    const surpriseDaysList = [];
    while (surpriseDaysList.length < surpriseDays) {
      const day = Math.floor(Math.random() * 7) + 1; // 1-7
      if (!surpriseDaysList.includes(day)) {
        surpriseDaysList.push(day);
      }
    }

    // 生成7天的配置
    for (let day = 1; day <= 7; day++) {
      const dayConfig = {
        day_of_week: day,
        points: this.generateRandomPoints(),
        is_surprise: surpriseDaysList.includes(day) ? 1 : 0,
        surprise_info: null,
      };

      // 如果这天有惊喜，生成惊喜信息
      if (dayConfig.is_surprise) {
        const { coupon, lottery } = checkinConfig.surpriseConfig.rewardTypes;
        const rand = Math.random();

        if (rand < coupon.weight) {
          // 商品券惊喜
          const randomCoupon = await this.getRandomCoupon();
          if (randomCoupon) {
            dayConfig.surprise_info = {
              type: "coupon",
              coupon_id: randomCoupon.id,
              coupon_name: randomCoupon.name,
              coupon_description: randomCoupon.description,
            };
          } else {
            // 如果没有可用商品券，改为瓜分奖励
            dayConfig.surprise_info = this.generateLotteryReward();
          }
        } else {
          // 瓜分奖励惊喜
          dayConfig.surprise_info = this.generateLotteryReward();
        }
      }

      weekConfig.push(dayConfig);
    }

    return weekConfig;
  }

  /**
   * 生成指定周的签到周期数据
   * @param {Date} date - 基准日期
   * @returns {Promise<void>}
   */
  async generateWeeklyCycles(date = timeService.now()) {
    try {
      const { monday, sunday } = this.getWeekRange(date);

      // 检查该周是否已经生成过
      const existingCount = await CheckinCycle.count({
        where: {
          start_date: monday,
          end_date: sunday,
        },
      });

      if (existingCount > 0) {
        console.log(`周期 ${monday} 到 ${sunday} 已存在签到配置`);
        return;
      }

      console.log(`开始生成 ${monday} 到 ${sunday} 的签到周期配置...`);

      // 生成指定数量的签到周期
      const cycles = [];
      for (let i = 0; i < checkinConfig.cycleCount; i++) {
        const weeklyConfig = await this.generateWeeklyConfig();

        cycles.push({
          start_date: monday,
          end_date: sunday,
          config: weeklyConfig,
        });
      }

      // 批量插入数据库
      await CheckinCycle.bulkCreate(cycles);

      console.log(`成功生成 ${cycles.length} 个签到周期配置`);
    } catch (error) {
      console.error("生成签到周期失败:", error);
      throw error;
    }
  }

  /**
   * 检查并自动生成当前周的签到配置（定时任务调用）
   * @returns {Promise<void>}
   */
  async autoGenerateCurrentWeek() {
    try {
      console.log("检查是否需要生成当前周签到配置...");
      await this.generateWeeklyCycles();
    } catch (error) {
      console.error("自动生成签到配置失败:", error);
    }
  }

  /**
   * 检查用户是否已分配签到表
   * @param {number} userId - 用户ID
   * @returns {Promise<Object|null>} 返回用户签到配置或null
   */
  async checkUserCheckinAllocation(userId) {
    try {
      const currentWeekSunday = DateUtils.getCurrentWeekSunday(
        timeService.now()
      );

      const userConfig = await UserCheckinConfig.findOne({
        where: {
          user_id: userId,
          end_time: currentWeekSunday,
        },
        include: [
          {
            model: CheckinCycle,
            as: "cycle",
          },
        ],
      });

      return userConfig;
    } catch (error) {
      console.error("检查用户签到分配失败:", error);
      throw error;
    }
  }

  /**
   * 为用户分配签到配置
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 分配的签到配置
   */
  async allocateCheckinConfig(userId) {
    try {
      const currentWeekSunday = DateUtils.getCurrentWeekSunday(
        timeService.now()
      );
      const weekRange = this.getWeekRange(timeService.now());

      // 查询当前周的所有签到周期
      const cycles = await CheckinCycle.findAll({
        where: {
          start_date: weekRange.monday,
          end_date: weekRange.sunday,
        },
      });

      if (cycles.length === 0) {
        console.log("当前周没有可用的签到配置，尝试生成新的签到周期...");
        // 尝试生成当前周的签到周期
        await this.generateWeeklyCycles();

        // 重新查询
        const newCycles = await CheckinCycle.findAll({
          where: {
            start_date: weekRange.monday,
            end_date: weekRange.sunday,
          },
        });

        if (newCycles.length === 0) {
          throw new Error("生成签到配置失败，无法分配签到表");
        }

        cycles.push(...newCycles);
      }

      // 随机选择一个签到周期
      const randomCycle = cycles[Math.floor(Math.random() * cycles.length)];

      // 创建用户签到配置记录
      const userConfig = await UserCheckinConfig.create({
        user_id: userId,
        cycle_id: randomCycle.id,
        end_time: currentWeekSunday,
      });

      // 重新查询包含关联数据的完整记录
      const fullUserConfig = await UserCheckinConfig.findByPk(userConfig.id, {
        include: [
          {
            model: CheckinCycle,
            as: "cycle",
          },
        ],
      });

      return fullUserConfig;
    } catch (error) {
      console.error("分配签到配置失败:", error);
      throw error;
    }
  }

  /**
   * 获取用户签到信息（检查分配并返回完整信息）
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 用户签到信息
   */
  async getUserCheckinInfo(userId) {
    try {
      // 1. 检查用户是否已分配签到表
      let userConfig = await this.checkUserCheckinAllocation(userId);

      // 2. 如果没有分配，则进行分配
      if (!userConfig) {
        userConfig = await this.allocateCheckinConfig(userId);
      }

      // 3. 解析签到配置
      let cycleConfig;
      try {
        // Sequelize JSON字段自动解析，直接使用
        cycleConfig = userConfig.cycle.config;

        // 确保是数组格式
        if (!Array.isArray(cycleConfig)) {
          throw new Error("签到配置必须是数组格式");
        }
      } catch (parseError) {
        console.error("配置解析错误:", parseError);
        console.error("原始config数据:", userConfig.cycle.config);
        throw new Error("签到配置格式错误");
      }

      // 4. 获取当前是周几 本地时区 周日为7
      const dayOfWeek = DateUtils.getLocalDayOfWeek(timeService.now());

      // 5. 构建返回数据
      const checkinData = cycleConfig.map((dayConfig, index) => {
        const dayNum = index + 1;
        const checkinStatus = userConfig[`day${dayNum}`];

        return {
          day_of_week: dayConfig.day_of_week,
          points: dayConfig.points,
          is_surprise: dayConfig.is_surprise,
          surprise_info: dayConfig.surprise_info,
          is_checked_in: checkinStatus, // 0=未签到，1=已签到
          is_today: dayConfig.day_of_week === dayOfWeek, // 是否是今天
        };
      });

      return {
        user_id: userId,
        cycle_id: userConfig.cycle_id,
        current_day_of_week: dayOfWeek,
        week_range: {
          start_date: userConfig.cycle.start_date,
          end_date: userConfig.cycle.end_date,
        },
        checkin_data: checkinData,
      };
    } catch (error) {
      console.error("获取用户签到信息失败:", error);
      throw error;
    }
  }
}

module.exports = new CheckinService();
