const { User, Team, TeamMember, sequelize } = require("../models");
const timeService = require("./timeService");
const { createPointRecord } = require("../utils/pointUtil");
const { Op } = require("sequelize");

/**
 * 生成8位混合字符组队码（包含数字、大写字母、小写字母）
 * @returns {string} 8位混合字符组队码
 */
function generateTeamCode() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  // 确保至少包含一个数字、一个大写字母、一个小写字母
  const numbers = "0123456789";
  const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowerCase = "abcdefghijklmnopqrstuvwxyz";

  // 随机选择一个数字、大写字母、小写字母
  result += numbers.charAt(Math.floor(Math.random() * numbers.length));
  result += upperCase.charAt(Math.floor(Math.random() * upperCase.length));
  result += lowerCase.charAt(Math.floor(Math.random() * lowerCase.length));

  // 剩余5位从所有字符中随机选择
  for (let i = 3; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // 打乱字符顺序
  return result
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

/**
 * 计算组队过期时间
 * @param {Date} currentTime - 当前时间
 * @returns {Date} 过期时间
 */
function calculateExpireTime(currentTime) {
  // 获取当天的结束时间 (第二天的00:00)
  const nextDayStart = new Date(currentTime);
  nextDayStart.setDate(nextDayStart.getDate() + 1);
  nextDayStart.setHours(0, 0, 0, 0);

  // 计算4小时后的时间
  const fourHoursLater = new Date(currentTime.getTime() + 4 * 60 * 60 * 1000);

  // 如果4小时后超过今天结束时间（即第二天0:00），则设置为第二天0:00
  return fourHoursLater >= nextDayStart ? nextDayStart : fourHoursLater;
}

/**
 * 执行组队朴分瓜分奖励
 * @param {number} teamId - 组队ID
 * @param {Array} members - 组队成员列表
 * @param {Object} transaction - 数据库事务
 * @returns {Promise<Object>} 瓜分结果
 */
async function distributeTeamRewards(teamId, members, transaction) {
  try {
    const rewards = [];

    // 给队长70分，队员每人10分
    for (const member of members) {
      const points = member.role === "captain" ? 70 : 10;
      const relatedInfo = {
        type: "组队朴分瓜分",
        description:
          member.role === "captain" ? "组队成功队长奖励" : "组队成功队员奖励",
        team_id: teamId,
        role: member.role,
        points: points,
      };

      const pointResult = await createPointRecord(
        member.user_id,
        "team",
        points,
        relatedInfo,
        transaction
      );

      rewards.push({
        user_id: member.user_id,
        username: member.user.username,
        role: member.role,
        points: points,
        old_points: pointResult.oldPoints,
        new_points: pointResult.newPoints,
      });
    }

    return {
      success: true,
      rewards,
      total_points_distributed: rewards.reduce((sum, r) => sum + r.points, 0),
    };
  } catch (error) {
    console.error("组队朴分瓜分失败:", error);
    throw error;
  }
}

/**
 * 检查用户今日是否已作为队长创建组队
 * @param {number} userId - 用户ID
 * @returns {Promise<Object>} { hasCreated: boolean, teamCode?: string, team?: Object }
 */
async function hasUserCreatedTeamToday(userId) {
  const currentTime = timeService.now();
  const startOfDay = new Date(currentTime);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(currentTime);
  endOfDay.setHours(23, 59, 59, 999);
  const existingTeam = await Team.findOne({
    where: {
      captain_id: userId,
      created_time: {
        [Op.between]: [startOfDay, endOfDay],
      },
    },
  });

  if (existingTeam) {
    return {
      hasCreated: true,
      teamCode: existingTeam.team_code,
      team: existingTeam,
    };
  }

  return { hasCreated: false };
}

/**
 * 检查用户今日是否已作为队员参与组队
 * @param {number} userId - 用户ID
 * @returns {Promise<Object>} { hasJoined: boolean, teamCode?: string, team?: Object }
 */
async function hasUserJoinedTeamToday(userId) {
  const currentTime = timeService.now();
  const startOfDay = new Date(currentTime);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(currentTime);
  endOfDay.setHours(23, 59, 59, 999);

  const existingMembership = await TeamMember.findOne({
    where: {
      user_id: userId,
      role: "member", // 只检查角色为member的记录
      join_time: {
        [Op.between]: [startOfDay, endOfDay],
      },
    },
    include: [
      {
        model: Team,
        as: "team", // 需要确保TeamMember模型中有正确的关联定义
      },
    ],
  });

  if (existingMembership && existingMembership.team) {
    return {
      hasJoined: true,
      teamCode: existingMembership.team.team_code,
      team: existingMembership.team,
    };
  }

  return { hasJoined: false };
}

/**
 * 更新过期组队的状态
 * @param {string} teamCode - 组队码
 * @returns {Promise<Object>} 更新结果
 */
async function updateExpiredTeamStatus(teamCode) {
  const currentTime = timeService.now();

  const team = await Team.findOne({
    where: { team_code: teamCode },
  });

  if (!team) {
    return {
      exists: false,
      isExpired: false,
      message: "组队不存在",
    };
  }

  // 检查是否过期
  const isExpired = currentTime > team.expire_time;

  // 如果过期且状态未更新，则更新状态
  if (isExpired && team.status === "pending") {
    await Team.update({ status: "expired" }, { where: { id: team.id } });

    return {
      exists: true,
      isExpired: true,
      message: "组队已过期",
      team: {
        ...team.toJSON(),
        status: "expired",
      },
    };
  }

  return {
    exists: true,
    isExpired: isExpired,
    message: isExpired ? "组队已过期" : "组队有效",
    team: team.toJSON(),
  };
}

/**
 * 队长创建组队
 * @param {number} userId - 队长用户ID
 * @returns {Promise<Object>} 创建结果
 */
async function createTeam(userId) {
  const transaction = await sequelize.transaction();

  try {
    // 检查用户是否存在
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("用户不存在");
    }

    // 检查今日是否已创建组队
    const createdResult = await hasUserCreatedTeamToday(userId);
    if (createdResult.hasCreated) {
      throw new Error("今日已创建组队，无法重复创建");
    }

    // 生成唯一组队码
    let teamCode;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      teamCode = generateTeamCode();
      const existingTeam = await Team.findOne({
        where: { team_code: teamCode },
        transaction,
      });
      if (!existingTeam) break;
      attempts++;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new Error("生成组队码失败，请重试");
    }

    // 计算过期时间
    const currentTime = timeService.now();
    const expireTime = calculateExpireTime(currentTime);

    // 创建组队
    const team = await Team.create(
      {
        team_code: teamCode,
        captain_id: userId,
        status: "pending",
        created_time: currentTime,
        expire_time: expireTime,
      },
      { transaction }
    );

    // 将队长加入组队成员表
    await TeamMember.create(
      {
        team_id: team.id,
        user_id: userId,
        role: "captain",
        join_time: currentTime,
      },
      { transaction }
    );

    await transaction.commit();

    return {
      success: true,
      team: {
        id: team.id,
        team_code: teamCode,
        captain_id: userId,
        status: team.status,
        created_time: team.created_time,
        expire_time: team.expire_time,
        captain_username: user.username,
      },
      message: "组队创建成功",
    };
  } catch (error) {
    await transaction.rollback();
    console.error("创建组队失败:", error);
    throw error;
  }
}

/**
 * 队员加入组队
 * @param {number} userId - 队员用户ID
 * @param {string} teamCode - 组队码
 * @returns {Promise<Object>} 加入结果
 */
async function joinTeam(userId, teamCode) {
  const transaction = await sequelize.transaction();

  try {
    // 检查用户是否存在
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("用户不存在");
    }

    // 检查今日是否已参与组队
    const joinedResult = await hasUserJoinedTeamToday(userId);
    if (joinedResult.hasJoined) {
      throw new Error("今日已参与组队，无法重复参与");
    }

    // 检查并更新组队状态
    const teamStatus = await updateExpiredTeamStatus(teamCode);
    if (!teamStatus.exists) {
      throw new Error("组队码无效");
    }
    if (teamStatus.isExpired) {
      throw new Error("组队已过期");
    }

    const team = teamStatus.team;

    // 检查组队是否为pending状态
    if (team.status !== "pending") {
      throw new Error(`组队状态异常：${team.status}`);
    }

    // 检查用户是否已在该组队中
    const existingMember = await TeamMember.findOne({
      where: {
        team_id: team.id,
        user_id: userId,
      },
      transaction,
    });

    if (existingMember) {
      throw new Error("您已在该组队中");
    }

    // 检查组队人数是否已满
    const memberCount = await TeamMember.count({
      where: { team_id: team.id },
      transaction,
    });

    if (memberCount >= 4) {
      throw new Error("组队人数已满");
    }

    // 加入组队
    const currentTime = timeService.now();
    await TeamMember.create(
      {
        team_id: team.id,
        user_id: userId,
        role: "member",
        join_time: currentTime,
      },
      { transaction }
    );

    // 检查是否达到4人，如果是则更新组队状态为completed并执行朴分瓜分
    const newMemberCount = memberCount + 1;
    let teamRewards = null;

    if (newMemberCount === 4) {
      await Team.update(
        {
          status: "completed",
          completed_time: currentTime,
        },
        {
          where: { id: team.id },
          transaction,
        }
      );

      // 获取所有组队成员信息用于瓜分
      const allMembers = await TeamMember.findAll({
        where: { team_id: team.id },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "username"],
          },
        ],
        transaction,
      });

      // 执行朴分瓜分
      teamRewards = await distributeTeamRewards(
        team.id,
        allMembers,
        transaction
      );
    }

    await transaction.commit();

    return {
      success: true,
      team: {
        id: team.id,
        team_code: teamCode,
        status: newMemberCount === 4 ? "completed" : "pending",
        member_count: newMemberCount,
        completed_time: newMemberCount === 4 ? currentTime : null,
      },
      user: {
        id: userId,
        username: user.username,
        role: "member",
        join_time: currentTime,
      },
      rewards: teamRewards, // 包含瓜分信息
      message:
        newMemberCount === 4 ? "组队成功完成！获得朴分奖励" : "加入组队成功",
    };
  } catch (error) {
    await transaction.rollback();
    console.error("加入组队失败:", error);
    throw error;
  }
}

/**
 * 获取组队详情
 * @param {string} teamCode - 组队码
 * @returns {Promise<Object>} 组队详情
 */
async function getTeamDetails(teamCode) {
  try {
    const team = await Team.findOne({
      where: { team_code: teamCode },
      include: [
        {
          model: User,
          as: "captain",
          attributes: ["id", "username"],
        },
        {
          model: TeamMember,
          as: "members",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "username"],
            },
          ],
        },
      ],
    });

    if (!team) {
      throw new Error("组队不存在");
    }

    return {
      success: true,
      team: {
        id: team.id,
        team_code: team.team_code,
        captain: team.captain,
        status: team.status,
        created_time: team.created_time,
        expire_time: team.expire_time,
        completed_time: team.completed_time,
        member_count: team.members.length,
        members: team.members.map((member) => ({
          id: member.user.id,
          username: member.user.username,
          role: member.role,
          join_time: member.join_time,
        })),
      },
    };
  } catch (error) {
    console.error("获取组队详情失败:", error);
    throw error;
  }
}

/**
 * 获取用户组队记录
 * @param {number} userId - 用户ID
 * @param {Object} options - 查询选项
 * @param {number} options.page - 页码
 * @param {number} options.limit - 每页数量
 * @param {string} options.status - 组队状态筛选 (pending, completed, expired)
 * @param {string} options.role - 角色筛选 (captain, member)
 * @param {string} options.startDate - 开始日期
 * @param {string} options.endDate - 结束日期
 * @returns {Promise<Object>} 组队记录列表
 */
async function getUserTeamRecords(userId, options = {}) {
  try {
    const { page = 1, limit = 20, status, role, startDate, endDate } = options;

    const offset = (page - 1) * limit;

    // 构建查询条件
    const whereConditions = {};
    const teamWhereConditions = {};

    // 根据角色筛选
    if (role === "captain") {
      // 只查询作为队长的记录
      teamWhereConditions.captain_id = userId;
    } else if (role === "member") {
      // 只查询作为队员的记录，需要通过TeamMember表
    } else {
      // 查询所有记录（队长+队员）
    }

    // 状态筛选
    if (status) {
      teamWhereConditions.status = status;
    }

    // 时间筛选
    if (startDate || endDate) {
      teamWhereConditions.created_time = {};
      if (startDate) {
        teamWhereConditions.created_time[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        teamWhereConditions.created_time[Op.lte] = endDateTime;
      }
    }

    let teams = [];
    let totalCount = 0;

    if (role === "member") {
      // 只查询作为队员的记录
      const teamMemberQuery = {
        where: {
          user_id: userId,
          role: "member",
        },
        include: [
          {
            model: Team,
            as: "team",
            where: teamWhereConditions,
            include: [
              {
                model: User,
                as: "captain",
                attributes: ["id", "username"],
              },
              {
                model: TeamMember,
                as: "members",
                include: [
                  {
                    model: User,
                    as: "user",
                    attributes: ["id", "username"],
                  },
                ],
              },
            ],
          },
        ],
        order: [["join_time", "DESC"]],
        limit,
        offset,
      };

      const memberRecords = await TeamMember.findAndCountAll(teamMemberQuery);
      totalCount = memberRecords.count;
      teams = memberRecords.rows.map((record) => ({
        ...record.team.toJSON(),
        user_role: "member",
        join_time: record.join_time,
      }));
    } else if (role === "captain") {
      // 只查询作为队长的记录
      const captainQuery = {
        where: {
          captain_id: userId,
          ...teamWhereConditions,
        },
        include: [
          {
            model: User,
            as: "captain",
            attributes: ["id", "username"],
          },
          {
            model: TeamMember,
            as: "members",
            include: [
              {
                model: User,
                as: "user",
                attributes: ["id", "username"],
              },
            ],
          },
        ],
        order: [["created_time", "DESC"]],
        limit,
        offset,
      };

      const captainRecords = await Team.findAndCountAll(captainQuery);
      totalCount = captainRecords.count;
      teams = captainRecords.rows.map((team) => ({
        ...team.toJSON(),
        user_role: "captain",
      }));
    } else {
      // 查询所有记录（队长+队员），需要分别查询后合并
      const captainQuery = {
        where: {
          captain_id: userId,
          ...teamWhereConditions,
        },
        include: [
          {
            model: User,
            as: "captain",
            attributes: ["id", "username"],
          },
          {
            model: TeamMember,
            as: "members",
            include: [
              {
                model: User,
                as: "user",
                attributes: ["id", "username"],
              },
            ],
          },
        ],
      };

      const memberQuery = {
        where: {
          user_id: userId,
          role: "member",
        },
        include: [
          {
            model: Team,
            as: "team",
            where: teamWhereConditions,
            include: [
              {
                model: User,
                as: "captain",
                attributes: ["id", "username"],
              },
              {
                model: TeamMember,
                as: "members",
                include: [
                  {
                    model: User,
                    as: "user",
                    attributes: ["id", "username"],
                  },
                ],
              },
            ],
          },
        ],
      };

      const [captainRecords, memberRecords] = await Promise.all([
        Team.findAll(captainQuery),
        TeamMember.findAll(memberQuery),
      ]);

      // 合并并排序所有记录
      const allRecords = [
        ...captainRecords.map((team) => ({
          ...team.toJSON(),
          user_role: "captain",
          sort_time: team.created_time,
        })),
        ...memberRecords.map((record) => ({
          ...record.team.toJSON(),
          user_role: "member",
          join_time: record.join_time,
          sort_time: record.join_time,
        })),
      ];

      // 按时间降序排序
      allRecords.sort((a, b) => new Date(b.sort_time) - new Date(a.sort_time));

      // 分页处理
      totalCount = allRecords.length;
      teams = allRecords.slice(offset, offset + limit);
    }

    // 格式化返回数据
    const formattedRecords = teams.map((team) => ({
      id: team.id,
      team_code: team.team_code,
      status: team.status,
      user_role: team.user_role,
      created_time: team.created_time,
      expire_time: team.expire_time,
      completed_time: team.completed_time,
      join_time: team.join_time || null,
      captain: team.captain,
      member_count: team.members ? team.members.length : 0,
      members: team.members || [],
    }));

    return {
      records: formattedRecords,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  } catch (error) {
    console.error("获取用户组队记录失败:", error);
    throw error;
  }
}

module.exports = {
  createTeam,
  joinTeam,
  getTeamDetails,
  hasUserCreatedTeamToday,
  hasUserJoinedTeamToday,
  updateExpiredTeamStatus,
  getUserTeamRecords,
};
