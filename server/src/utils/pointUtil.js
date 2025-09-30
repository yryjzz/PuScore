const { User, PointRecord } = require("../models");
const timeService = require("../services/timeService");
/**
 * 创建朴分记录
 * @param {number} userId - 用户ID
 * @param {string} changeType - 变动类型 (checkin, team, exchange, expire)
 * @param {number} points - 变动朴分（正数增加，负数减少）
 * @param {Object} relatedInfo - 关联信息
 * @param {Object} transaction - 数据库事务（可选）
 * @returns {Promise<Object>} 朴分记录
 */
async function createPointRecord(
  userId,
  changeType,
  points,
  relatedInfo = null,
  transaction = null
) {
  try {
    // 获取用户当前总朴分
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      throw new Error("用户不存在");
    }

    const currentPoints = user.total_points;
    const newTotalPoints = currentPoints + points;

    // 确保总朴分不为负
    if (newTotalPoints < 0) {
      throw new Error("朴分余额不足");
    }

    // 创建朴分记录
    const pointRecord = await PointRecord.create(
      {
        user_id: userId,
        change_type: changeType,
        related_info: relatedInfo ? JSON.stringify(relatedInfo) : null,
        points: points,
        total_points: newTotalPoints,
        created_time: timeService.now(),
      },
      { transaction }
    );

    // 更新用户总朴分
    await User.update(
      {
        total_points: newTotalPoints,
      },
      {
        where: { id: userId },
        transaction,
      }
    );

    return {
      record: pointRecord,
      oldPoints: currentPoints,
      newPoints: newTotalPoints,
      changePoints: points,
    };
  } catch (error) {
    console.error("创建朴分记录失败:", error);
    throw error;
  }
}

module.exports = { createPointRecord };
