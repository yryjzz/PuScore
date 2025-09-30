const productController = require("../controllers/productController");
const { authenticateToken } = require("../utils/authMiddleware");

/**
 * 商品相关路由 - /api/product/*
 */
async function productRoutes(fastify, options) {
  // 获取可兑换商品券列表
  fastify.get(
    "/exchangeable",
    {
      preHandler: [authenticateToken],
      schema: {
        description: "获取可兑换商品券列表",
        tags: ["商品系统"],
        security: [{ bearerAuth: [] }],
      },
    },
    productController.getExchangeableProducts
  );

  // 兑换商品券
  fastify.post(
    "/exchange",
    {
      preHandler: [authenticateToken],
      schema: {
        description: "兑换商品券",
        tags: ["商品系统"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["product_id"],
          properties: {
            product_id: {
              type: "integer",
              description: "商品ID",
            },
          },
        },
      },
    },
    productController.exchangeProduct
  );

  // 获取用户兑换记录
  fastify.get(
    "/exchanges",
    {
      preHandler: [authenticateToken],
      schema: {
        description: "获取用户兑换记录",
        tags: ["商品系统"],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            page: {
              type: "integer",
              minimum: 1,
              default: 1,
              description: "页码",
            },
            limit: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 20,
              description: "每页条数",
            },
            status: {
              type: "string",
              enum: ["exchanged", "used", "expired"],
              description: "兑换状态筛选",
            },
          },
        },
      },
    },
    productController.getUserExchangeRecords
  );
}

module.exports = productRoutes;
