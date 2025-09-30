const productService = require("../services/productService");

/**
 * 获取可兑换商品券列表
 */
async function getExchangeableProducts(req, reply) {
  try {
    const userId = req.user.userId;

    const result = await productService.getExchangeableProducts(userId);

    return reply.code(200).send({
      code: 200,
      message: "获取可兑换商品券成功",
      data: result,
    });
  } catch (error) {
    console.error("获取可兑换商品券失败:", error);
    return reply.code(500).send({
      code: 500,
      message: error.message || "获取可兑换商品券失败",
      data: null,
    });
  }
}

/**
 * 兑换商品券
 */
async function exchangeProduct(req, reply) {
  try {
    const userId = req.user.userId;
    const { product_id } = req.body;

    // 参数验证
    if (!product_id) {
      return reply.code(400).send({
        code: 400,
        message: "商品ID不能为空",
        data: null,
      });
    }

    const result = await productService.exchangeProduct(userId, product_id);

    return reply.code(200).send({
      code: 200,
      message: "兑换成功！",
      data: result,
    });
  } catch (error) {
    console.error("兑换商品券失败:", error);

    // 根据错误类型返回不同状态码
    let statusCode = 500;
    if (
      error.message.includes("不存在") ||
      error.message.includes("不可兑换")
    ) {
      statusCode = 404;
    } else if (error.message.includes("不足")) {
      statusCode = 400;
    }

    return reply.code(statusCode).send({
      code: statusCode,
      message: error.message || "兑换商品券失败",
      data: null,
    });
  }
}

/**
 * 获取用户兑换记录
 */
async function getUserExchangeRecords(req, reply) {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, status } = req.query;

    const result = await productService.getUserExchangeRecords(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    });

    return reply.code(200).send({
      code: 200,
      message: "获取兑换记录成功",
      data: result,
    });
  } catch (error) {
    console.error("获取兑换记录失败:", error);
    return reply.code(500).send({
      code: 500,
      message: error.message || "获取兑换记录失败",
      data: null,
    });
  }
}

/**
 * 手动执行商品券过期检查（管理员专用）
 */
async function expireProducts(req, reply) {
  try {
    const result = await productService.checkAndExpireProducts();

    return reply.code(200).send({
      code: 200,
      message: "商品券过期检查完成",
      data: result,
    });
  } catch (error) {
    console.error("商品券过期检查失败:", error);
    return reply.code(500).send({
      code: 500,
      message: error.message || "商品券过期检查失败",
      data: null,
    });
  }
}

module.exports = {
  getExchangeableProducts,
  exchangeProduct,
  getUserExchangeRecords,
  expireProducts,
};
