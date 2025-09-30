const cron = require("node-cron");
const checkinService = require("./checkinService");
const pointService = require("./pointService");
const productService = require("./productService");
const checkinConfig = require("../config/checkin");
const pointExpireConfig = require("../config/pointExpire");

class ScheduleService {
  /**
   * 启动所有定时任务
   */
  static startAll() {
    this.startWeeklyCheckinGeneration();
    this.startProductExpiration();

    // 只有在配置启用自动过期时才启动过期任务
    if (pointExpireConfig.execution.autoExpire) {
      this.startPointExpiration();
    } else {
      console.log("⚠️ 朴分自动过期已禁用，跳过过期定时任务");
    }

    console.log("✅ 所有定时任务已启动");
  }

  /**
   * 启动每周一自动生成签到配置的定时任务
   */
  static startWeeklyCheckinGeneration() {
    const { hour, minute } = checkinConfig.generateTime;

    // cron表达式: 每周一的指定时间执行
    // 格式: 分 时 日 月 周
    // 周: 0=周日, 1=周一, 2=周二...
    const cronExpression = `${minute} ${hour} * * 1`;

    cron.schedule(
      cronExpression,
      async () => {
        console.log("🔄 定时任务：开始生成新一周的签到配置...");
        try {
          await checkinService.autoGenerateCurrentWeek();
          console.log("✅ 定时任务：签到配置生成完成");
        } catch (error) {
          console.error("❌ 定时任务：签到配置生成失败", error);
        }
      },
      {
        timezone: "Asia/Shanghai", // 设置时区
      }
    );

    console.log(
      `📅 定时任务已启动: 每周一 ${String(hour).padStart(2, "0")}:${String(
        minute
      ).padStart(2, "0")} 自动生成签到配置`
    );
  }

  /**
   * 启动朴分过期定时任务
   */
  static startPointExpiration() {
    const { hour, minute } = pointExpireConfig.time;

    // 为每个配置的过期日期创建定时任务
    pointExpireConfig.dates.forEach(({ month, day, name }) => {
      const cronExpression = `${minute} ${hour} ${day} ${month} *`;

      cron.schedule(
        cronExpression,
        async () => {
          console.log(`🔄 定时任务：开始执行${name}朴分过期操作...`);
          await this.executePointExpiration(name);
        },
        {
          timezone: pointExpireConfig.execution.timezone,
        }
      );
    });

    console.log(
      `📅 朴分过期定时任务已启动 (${String(hour).padStart(2, "0")}:${String(
        minute
      ).padStart(2, "0")})`
    );
    pointExpireConfig.dates.forEach(({ month, day, name }) => {
      console.log(`   - ${month}月${day}日 ${name}`);
    });
  }

  /**
   * 执行朴分过期操作的通用方法
   */
  static async executePointExpiration(taskName) {
    try {
      const result = await pointService.expireUserPoints();
      console.log(`✅ 定时任务：${taskName}完成`);

      if (pointExpireConfig.execution.logging.enabled) {
        console.log(
          `📊 过期统计：${result.data.expiredUsers}个用户，共过期${result.data.totalExpiredPoints}朴分`
        );
      }
    } catch (error) {
      console.error(`❌ 定时任务：${taskName}失败`, error);
    }
  }

  /**
   * 启动商品券过期检查定时任务
   * 每天0点执行过期检查
   */
  static startProductExpiration() {
    // 每天0点0分执行
    const cronExpression = "0 0 * * *";

    cron.schedule(
      cronExpression,
      async () => {
        console.log("🔄 定时任务：开始检查商品券过期...");
        try {
          const result = await productService.checkAndExpireProducts();
          console.log(
            `✅ 定时任务：商品券过期检查完成，${result.expiredCount}个兑换记录已过期`
          );
        } catch (error) {
          console.error("❌ 定时任务：商品券过期检查失败", error);
        }
      },
      {
        timezone: "Asia/Shanghai", // 设置时区
      }
    );

    console.log("📅 商品券过期检查定时任务已启动: 每天 00:00 自动检查过期");
  }
}

module.exports = ScheduleService;
