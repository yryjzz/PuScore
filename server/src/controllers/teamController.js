const teamService = require("../services/teamService");

/**
 * 检查用户今日是否已作为队长创建组队
 */
async function checkUserCreatedTeamToday(req, reply) {
  try {
    const userId = req.user.userId;

    const createdResult = await teamService.hasUserCreatedTeamToday(userId);

    return reply.code(200).send({
      code: 200,
      message: "查询成功",
      data: {
        userId,
        hasCreatedTeamToday: createdResult.hasCreated,
        teamCode: createdResult.teamCode || null,
        team: createdResult.team || null,
        message: createdResult.hasCreated ? "今日已创建组队" : "今日未创建组队",
      },
    });
  } catch (error) {
    console.error("检查用户创建组队状态失败:", error);
    return reply.code(500).send({
      code: 500,
      message: error.message || "检查用户创建组队状态失败",
      data: null,
    });
  }
}

/**
 * 检查用户今日是否已作为队员参与组队
 */
async function checkUserJoinedTeamToday(req, reply) {
  try {
    const userId = req.user.userId;

    const joinedResult = await teamService.hasUserJoinedTeamToday(userId);

    return reply.code(200).send({
      code: 200,
      message: "查询成功",
      data: {
        userId,
        hasJoinedTeamToday: joinedResult.hasJoined,
        teamCode: joinedResult.teamCode || null,
        team: joinedResult.team || null,
        message: joinedResult.hasJoined ? "今日已参与组队" : "今日未参与组队",
      },
    });
  } catch (error) {
    console.error("检查用户参与组队状态失败:", error);
    return reply.code(500).send({
      code: 500,
      message: error.message || "检查用户参与组队状态失败",
      data: null,
    });
  }
}

/**
 * 检查组队码对应的组队是否过期（并更新状态）
 */
async function checkTeamExpiredStatus(req, reply) {
  try {
    const { team_code } = req.params;

    if (!team_code) {
      return reply.code(400).send({
        code: 400,
        message: "组队码不能为空",
        data: null,
      });
    }

    const result = await teamService.updateExpiredTeamStatus(team_code);

    return reply.code(200).send({
      code: 200,
      message: "查询成功",
      data: result,
    });
  } catch (error) {
    console.error("检查组队过期状态失败:", error);
    return reply.code(500).send({
      code: 500,
      message: error.message || "检查组队过期状态失败",
      data: null,
    });
  }
}

/**
 * 队长创建组队
 */
async function createTeam(req, reply) {
  try {
    const userId = req.user.userId;

    const result = await teamService.createTeam(userId);

    return reply.code(201).send({
      code: 201,
      message: result.message,
      data: result.team,
    });
  } catch (error) {
    console.error("创建组队失败:", error);

    // 根据错误类型返回不同状态码
    let statusCode = 500;
    if (
      error.message.includes("今日已创建组队") ||
      error.message.includes("无法重复创建")
    ) {
      statusCode = 400;
    } else if (error.message.includes("用户不存在")) {
      statusCode = 404;
    }

    return reply.code(statusCode).send({
      code: statusCode,
      message: error.message || "创建组队失败",
      data: null,
    });
  }
}

/**
 * 队员加入组队
 */
async function joinTeam(req, reply) {
  try {
    const userId = req.user.userId;
    const { team_code } = req.body;

    // 参数验证
    if (!team_code) {
      return reply.code(400).send({
        code: 400,
        message: "组队码不能为空",
        data: null,
      });
    }

    const result = await teamService.joinTeam(userId, team_code);

    return reply.code(200).send({
      code: 200,
      message: result.message,
      data: {
        team: result.team,
        user: result.user,
        rewards: result.rewards, // 添加奖励信息
      },
    });
  } catch (error) {
    console.error("加入组队失败:", error);

    // 根据错误类型返回不同状态码
    let statusCode = 500;
    if (
      error.message.includes("今日已参与组队") ||
      error.message.includes("组队码无效") ||
      error.message.includes("组队已过期") ||
      error.message.includes("已在该组队中") ||
      error.message.includes("人数已满") ||
      error.message.includes("状态异常")
    ) {
      statusCode = 400;
    } else if (error.message.includes("用户不存在")) {
      statusCode = 404;
    }

    return reply.code(statusCode).send({
      code: statusCode,
      message: error.message || "加入组队失败",
      data: null,
    });
  }
}

/**
 * 获取组队详情
 */
async function getTeamDetails(req, reply) {
  try {
    const { team_code } = req.params;

    if (!team_code) {
      return reply.code(400).send({
        code: 400,
        message: "组队码不能为空",
        data: null,
      });
    }

    const result = await teamService.getTeamDetails(team_code);

    return reply.code(200).send({
      code: 200,
      message: "获取组队详情成功",
      data: result.team,
    });
  } catch (error) {
    console.error("获取组队详情失败:", error);

    let statusCode = 500;
    if (error.message.includes("组队不存在")) {
      statusCode = 404;
    }

    return reply.code(statusCode).send({
      code: statusCode,
      message: error.message || "获取组队详情失败",
      data: null,
    });
  }
}

/**
 * 获取用户组队记录
 */
async function getUserTeamRecords(req, reply) {
  try {
    const userId = req.user.userId;
    const {
      page = 1,
      limit = 20,
      status,
      role,
      start_date,
      end_date,
    } = req.query;

    const result = await teamService.getUserTeamRecords(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      role,
      startDate: start_date,
      endDate: end_date,
    });

    return reply.code(200).send({
      code: 200,
      message: "获取组队记录成功",
      data: result,
    });
  } catch (error) {
    console.error("获取组队记录失败:", error);
    return reply.code(500).send({
      code: 500,
      message: error.message || "获取组队记录失败",
      data: null,
    });
  }
}

module.exports = {
  checkUserCreatedTeamToday,
  checkUserJoinedTeamToday,
  checkTeamExpiredStatus,
  createTeam,
  joinTeam,
  getTeamDetails,
  getUserTeamRecords,
};
