/**
 * 朴分过期配置
 * 用于配置朴分过期的时间和规则
 */
module.exports = {
  // 过期时间设置 (小时:分钟)
  time: {
    hour: 23,
    minute: 59,
  },

  // 过期日期配置 - 统一格式 {month: 月份, day: 日期, name: "说明"}
  // 可以随意添加、删除或修改过期日期
  dates: [
    { month: 3, day: 31, name: "第一季度" },
    { month: 6, day: 30, name: "第二季度" },
    { month: 9, day: 30, name: "第三季度" },
    { month: 12, day: 31, name: "第四季度" },
  ],

  // 执行配置
  execution: {
    // 时区设置
    timezone: "Asia/Shanghai",

    // 是否启用自动过期
    autoExpire: true,

    // 过期日志设置
    logging: {
      enabled: true,
      level: "info", // 'info' | 'debug' | 'warn' | 'error'
    },
  },

  // 过期规则配置
  rules: {
    // 过期用户状态过滤 (只过期正常状态的用户) 1-正常
    userStatus: [1],

    // 最小过期朴分
    minExpirePoints: 0,

    // 过期描述模板
    description: "朴分过期",

    // 过期记录类型
    recordType: "expire",
  },
};
