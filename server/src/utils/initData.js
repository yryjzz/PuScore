const { Product } = require("../models");

// 初始化商品券数据
const initializeProducts = async () => {
  try {
    console.log("开始初始化商品券数据...");

    const products = [
      // status=1: 可兑换商品券
      {
        name: "1元优惠券",
        description: "适用于全场商品，满49元可用，有效期2天",
        points: 1,
        image_url: null,
        status: 1,
      },
      {
        name: "5元优惠券",
        description: "适用于全场商品，满59元可用，有效期2天",
        points: 20,
        image_url: null,
        status: 1,
      },
      {
        name: "10元优惠券",
        description: "适用于全场商品，满159元可用，有效期2天",
        points: 10,
        image_url: null,
        status: 1,
      },
      {
        name: "免邮券",
        description: "免除订单运费，全场通用，有效期2天",
        points: 50,
        image_url: null,
        status: 1,
      },

      // status=2: 用于签到惊喜奖励的商品券
      {
        name: "签到专享5元券",
        description: "签到惊喜专享，满69元可用，有效期7天",
        points: 99999,
        image_url: null,
        status: 2,
      },
      {
        name: "签到专享8元券",
        description: "签到惊喜专享，满99元可用，有效期7天",
        points: 99999,
        image_url: null,
        status: 2,
      },
      {
        name: "签到专享15元券",
        description: "签到惊喜专享，满139元可用，有效期7天",
        points: 99999,
        image_url: null,
        status: 2,
      },
      {
        name: "签到专享免邮券",
        description: "签到惊喜专享，免除订单运费，有效期7天",
        points: 99999,
        image_url: null,
        status: 2,
      },

      // status=0: 已下架的商品券（示例）
      {
        name: "过期优惠券",
        description: "已下架的优惠券",
        points: 99999,
        image_url: null,
        status: 0,
      },
    ];

    // 检查是否已有数据
    const existingCount = await Product.count();
    if (existingCount > 0) {
      console.log(`商品券表已有 ${existingCount} 条数据，跳过初始化`);
      return;
    }

    // 批量创建
    await Product.bulkCreate(products);

    console.log(`成功初始化 ${products.length} 条商品券数据`);

    // 显示创建的数据
    const createdProducts = await Product.findAll({
      attributes: ["id", "name", "points", "status"],
      raw: true,
    });

    console.log("创建的商品券数据:");
    console.table(createdProducts);
  } catch (error) {
    console.error("初始化商品券数据失败:", error);
    throw error;
  }
};

module.exports = { initializeProducts };
