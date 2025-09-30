const { User, Product, ProductExchange, sequelize } = require("../models");
const { createPointRecord } = require("../utils/pointUtil");
const timeService = require("./timeService");
const DateUtils = require("../utils/dateUtil");

/**
 * 计算过期日期
 * @param {Date} currentTime - 当前时间
 * @param {number} validDays - 有效天数
 * @returns {string} 过期日期 (YYYY-MM-DD)
 */
function calculateExpireDate(currentTime, validDays) {
  const expireDate = new Date(currentTime);
  expireDate.setDate(expireDate.getDate() + validDays);
  return DateUtils.toCurrentDateString(expireDate);
}

/**
 * 获取可兑换的商品券列表
 * @param {number} userId - 用户ID
 * @returns {Promise<Object>} 商品券列表和用户可兑换状态
 */
async function getExchangeableProducts(userId) {
  try {
    // 获取用户信息
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("用户不存在");
    }

    // 获取所有可兑换的商品券 (status = 1)
    const products = await Product.findAll({
      where: { status: 1 },
      order: [["points", "ASC"]], // 按所需朴分升序排列
    });

    // 为每个商品券添加可兑换状态
    const productsWithExchangeable = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      points: product.points,
      image_url: product.image_url,
      status: product.status,
      created_at: product.created_at,
      updated_at: product.updated_at,
      exchangeable: user.total_points >= product.points, // 用户朴分是否足够
      user_points: user.total_points, // 用户当前朴分
    }));

    return {
      products: productsWithExchangeable,
      user_total_points: user.total_points,
      count: productsWithExchangeable.length,
    };
  } catch (error) {
    console.error("获取可兑换商品券失败:", error);
    throw error;
  }
}

/**
 * 兑换商品券
 * @param {number} userId - 用户ID
 * @param {number} productId - 商品ID
 * @param {number} validDays - 有效天数（默认2天）
 * @returns {Promise<Object>} 兑换结果
 */
async function exchangeProduct(userId, productId, validDays = 2) {
  const transaction = await sequelize.transaction();

  try {
    // 1. 验证用户存在
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      throw new Error("用户不存在");
    }

    // 2. 验证商品存在且可兑换
    const product = await Product.findByPk(productId, { transaction });
    if (!product) {
      throw new Error("商品不存在");
    }
    if (product.status !== 1) {
      throw new Error("商品不可兑换");
    }

    // 3. 验证用户朴分是否足够
    if (user.total_points < product.points) {
      throw new Error("朴分余额不足");
    }

    // 4. 计算过期时间
    const currentTime = timeService.now();
    const expireDate = calculateExpireDate(currentTime, validDays);

    // 5. 创建朴分记录（扣除朴分）
    const pointChangeInfo = {
      type: "商品券兑换",
      description: `兑换商品券：${product.name}`,
      product_id: product.id,
      product_name: product.name,
      points_cost: product.points,
    };

    const pointResult = await createPointRecord(
      userId,
      "exchange",
      -product.points, // 负数表示扣除
      pointChangeInfo,
      transaction
    );

    // 6. 创建兑换记录
    const exchange = await ProductExchange.create(
      {
        user_id: userId,
        product_id: productId,
        exchange_time: currentTime,
        points: product.points,
        status: "exchanged",
        expire_at: expireDate,
      },
      { transaction }
    );

    // 7. 提交事务
    await transaction.commit();

    return {
      success: true,
      exchange: {
        id: exchange.id,
        expire_at: expireDate,
        exchange_time: currentTime,
      },
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        points: product.points,
      },
      point_change: {
        old_points: pointResult.oldPoints,
        new_points: pointResult.newPoints,
        cost_points: product.points,
      },
    };
  } catch (error) {
    // 回滚事务
    await transaction.rollback();
    console.error("兑换商品券失败:", error);
    throw error;
  }
}

/**
 * 获取用户兑换记录
 * @param {number} userId - 用户ID
 * @param {Object} options - 查询选项
 * @returns {Promise<Object>} 兑换记录列表
 */
async function getUserExchangeRecords(userId, options = {}) {
  try {
    const { page = 1, limit = 20, status } = options;
    const offset = (page - 1) * limit;

    const whereCondition = { user_id: userId };
    if (status) {
      whereCondition.status = status;
    }

    const { count, rows } = await ProductExchange.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "description", "image_url"],
        },
      ],
      order: [["exchange_time", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return {
      records: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    };
  } catch (error) {
    console.error("获取兑换记录失败:", error);
    throw error;
  }
}

/**
 * 检查并处理过期的商品券兑换记录
 * @returns {Promise<Object>} 过期处理结果
 */
async function checkAndExpireProducts() {
  const transaction = await sequelize.transaction();

  try {
    // 获取当前日期 YYYY-MM-DD
    const currentDate = DateUtils.toCurrentDateString(timeService.now()); 

    // 查找所有过期的兑换记录（状态为exchanged且过期日期小于等于当前日期）
    const expiredExchanges = await ProductExchange.findAll({
      where: {
        status: "exchanged",
        expire_at: {
          [require("sequelize").Op.lte]: currentDate,
        },
      },
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["name"],
        },
      ],
      transaction,
    });

    let expiredCount = 0;
    const expiredDetails = [];

    // 批量更新过期的兑换记录
    for (const exchange of expiredExchanges) {
      await exchange.update(
        {
          status: "expired",
        },
        { transaction }
      );

      expiredCount++;
      expiredDetails.push({
        exchangeId: exchange.id,
        userId: exchange.user_id,
        productName: exchange.product.name,
        expireDate: exchange.expire_at,
      });
    }

    await transaction.commit();

    console.log(`商品券过期检查完成：${expiredCount}个兑换记录已过期`);

    return {
      success: true,
      expiredCount,
      currentDate,
      details: expiredDetails,
    };
  } catch (error) {
    await transaction.rollback();
    console.error("检查商品券过期失败:", error);
    throw error;
  }
}

module.exports = {
  getExchangeableProducts,
  exchangeProduct,
  getUserExchangeRecords,
  calculateExpireDate,
  checkAndExpireProducts,
};
