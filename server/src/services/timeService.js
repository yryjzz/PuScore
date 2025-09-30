/**
 * 时间管理服务 - 开发模式下支持时间调控
 */
class TimeService {
  constructor() {
    // 时间偏移量（毫秒），默认为0表示使用真实时间
    this.timeOffset = 0;

    // 是否启用时间调控（非生产环境）
    this.isTimeControlEnabled = process.env.NODE_ENV !== "production";
  }

  /**
   * 获取当前时间（考虑时间调控）
   * @returns {Date} 当前时间
   */
  now() {
    if (this.isTimeControlEnabled && this.timeOffset !== 0) {
      return new Date(Date.now() + this.timeOffset);
    }
    return new Date();
  }

  /**
   * 获取当前时间戳（考虑时间调控）
   * @returns {number} 当前时间戳
   */
  timestamp() {
    if (this.isTimeControlEnabled && this.timeOffset !== 0) {
      return Date.now() + this.timeOffset;
    }
    return Date.now();
  }

  /**
   * 设置系统时间（非生产环境专用）
   * @param {number|string|Date} targetTime - 目标时间
   * @returns {Object} 设置结果
   */
  setSystemTime(targetTime) {
    if (!this.isTimeControlEnabled) {
      throw new Error("时间调控功能仅在非生产环境下可用");
    }

    let targetTimestamp;

    if (typeof targetTime === "number") {
      // 时间戳格式
      targetTimestamp = targetTime;
    } else if (typeof targetTime === "string") {
      // 字符串格式，尝试解析
      targetTimestamp = new Date(targetTime).getTime();
    } else if (targetTime instanceof Date) {
      // Date对象
      targetTimestamp = targetTime.getTime();
    } else {
      throw new Error("无效的时间格式");
    }

    if (isNaN(targetTimestamp)) {
      throw new Error("无法解析的时间格式");
    }

    // 计算偏移量
    this.timeOffset = targetTimestamp - Date.now();

    console.log(
      `系统时间已调整: ${new Date(targetTimestamp).toLocaleString()}`
    );
    console.log(`时间偏移量: ${this.timeOffset}ms`);

    return {
      success: true,
      currentTime: new Date(targetTimestamp).toISOString(),
      offset: this.timeOffset,
      realTime: new Date().toISOString(),
    };
  }

  /**
   * 重置系统时间为真实时间
   * @returns {Object} 重置结果
   */
  resetSystemTime() {
    if (!this.isTimeControlEnabled) {
      throw new Error("时间调控功能仅在非生产环境下可用");
    }

    this.timeOffset = 0;

    console.log("系统时间已重置为真实时间");

    return {
      success: true,
      currentTime: new Date().toISOString(),
      offset: 0,
    };
  }

  /**
   * 获取时间状态信息
   * @returns {Object} 时间状态
   */
  getTimeStatus() {
    return {
      isTimeControlEnabled: this.isTimeControlEnabled,
      currentTime: this.now().toISOString(),
      realTime: new Date().toISOString(),
      offset: this.timeOffset,
      offsetHours: Math.round((this.timeOffset / (1000 * 60 * 60)) * 100) / 100,
    };
  }

  /**
   * 时间快进（相对当前调控时间）
   * @param {number} hours - 快进小时数
   * @returns {Object} 快进结果
   */
  fastForward(hours) {
    if (!this.isTimeControlEnabled) {
      throw new Error("时间调控功能仅在非生产环境下可用");
    }

    const milliseconds = hours * 60 * 60 * 1000;
    this.timeOffset += milliseconds;

    console.log(`时间快进 ${hours} 小时`);
    console.log(`当前系统时间: ${this.now().toLocaleString()}`);

    return {
      success: true,
      currentTime: this.now().toISOString(),
      fastForwardHours: hours,
      totalOffset: this.timeOffset,
    };
  }
}

// 创建单例实例
const timeService = new TimeService();

module.exports = timeService;
