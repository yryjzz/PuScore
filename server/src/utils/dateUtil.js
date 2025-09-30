/**
 * 日期工具类
 */
class DateUtils {
  /**
   * 获取本周周一的日期（基于指定时间）
   * @param {Date} now - 当前时间
   * @returns {string} 本周周一日期 YYYY-MM-DD格式
   */
  static getCurrentWeekMonday(now = new Date()) {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split("T")[0];
  }

  /**
   * 获取本周周日的日期（基于指定时间）
   * @param {Date} now - 当前时间
   * @returns {string} 本周周日的日期 YYYY-MM-DD格式
   */
  static getCurrentWeekSunday(now = new Date()) {
    const dayOfWeek = now.getDay();
    if (dayOfWeek === 0) {
      return now.toISOString().split("T")[0];
    }
    const daysToSunday = 7 - dayOfWeek;
    const sunday = new Date(now);
    sunday.setDate(now.getDate() + daysToSunday);
    return sunday.toISOString().split("T")[0];
  }

  /**
   * 获取本地时间 dayOfWeek（周日为7）
   * @param {Date} now - 当前时间
   * @returns {number} 本地时间 dayOfWeek
   */
  static getLocalDayOfWeek(now = new Date()) {
    return now.getDay() === 0 ? 7 : now.getDay();
  }

  /**
   * 将 Date 对象转换为本机时区的 YYYY-MM-DD 日期
   * @param {Date} date - 传入的 Date 对象（如 new Date() 或从外部接收的 Date）
   * @returns {string} 本机时区的日期字符串（如 "2025-09-28"）
   */
  static toCurrentDateString(now = new Date()) {
    if (!(now instanceof Date) || isNaN(now.getTime())) {
      throw new Error("请传入有效的 Date 对象");
    }
    const year = now.getFullYear(); 
    const month = now.getMonth() + 1; 
    const day = now.getDate(); 
    const paddedMonth = String(month).padStart(2, "0");
    const paddedDay = String(day).padStart(2, "0");
    return `${year}-${paddedMonth}-${paddedDay}`;
  }
}

module.exports = DateUtils;
