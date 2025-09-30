// 签到配置文件
module.exports = {
  // 每周生成的签到配置数量
  cycleCount: 5,

  // 签到朴分配置
  points: {
    min: 5, // 最小朴分
    max: 25, // 最大朴分
  },

  // 惊喜奖励配置
  surpriseConfig: {
    // 每周有惊喜的天数范围
    surpriseDaysRange: {
      min: 1,
      max: 3,
    },

    // 惊喜奖励类型及其权重
    rewardTypes: {
      // 商品券类型惊喜
      coupon: {
        weight: 0.6, // 60%概率
        type: "coupon",
      },

      // 瓜分奖励类型惊喜
      lottery: {
        weight: 0.4, // 40%概率
        type: "lottery",
        pools: [
          {
            name: "瓜分666朴分",
            totalPoints: 666,
            probabilities: [
              { prob: 0.2, points: 0, message: "很遗憾，未中奖" }, // 20%不中奖
              { prob: 0.2, points: 5, message: "安慰奖" }, // 20%安慰奖5分
              { prob: 0.4, points: 30, message: "恭喜获得30朴分" }, // 40%得30分
              { prob: 0.15, points: 100, message: "恭喜获得100朴分" }, // 15%得100分
              { prob: 0.04, points: 200, message: "恭喜获得200朴分" }, // 4%得200分
              { prob: 0.01, points: 666, message: "恭喜获得大奖666朴分！" }, // 1%得666分
            ],
          },
          {
            name: "瓜分888朴分",
            totalPoints: 888,
            probabilities: [
              { prob: 0.2, points: 0, message: "很遗憾，未中奖" }, // 20%不中奖
              { prob: 0.2, points: 5, message: "安慰奖" }, // 20%安慰奖5分
              { prob: 0.35, points: 50, message: "恭喜获得50朴分" }, // 35%得50分
              { prob: 0.2, points: 150, message: "恭喜获得150朴分" }, // 20%得150分
              { prob: 0.04, points: 300, message: "恭喜获得300朴分" }, // 4%得300分
              { prob: 0.01, points: 888, message: "恭喜获得大奖888朴分！" }, // 1%得888分
            ],
          },
        ],
      },
    },
  },

  // 定时任务设置 周一自动生成时间（24小时制）
  generateTime: {
    hour: 0, // 0点
    minute: 0, // 0分
  },
};
