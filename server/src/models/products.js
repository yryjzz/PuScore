const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// 商品券表模型 - 对应数据库设计中的 products 表
const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "商品唯一标识",
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '商品名称（如"10元优惠券"）',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "商品描述（使用规则、有效期等）",
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
      comment: "兑换所需朴分",
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "商品券图片URL（前端展示用）",
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: "商品券状态（2=用于生成签到，1=可兑换，0=已下架）",
    },
  },
  {
    tableName: "products",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "商品券表",
    indexes: [
      {
        name: "idx_products_status",
        fields: ["status"],
      },
    ],
  }
);

module.exports = Product;
