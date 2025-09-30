const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// 兑换记录表模型 - 对应数据库设计中的 products_exchanges 表
const ProductExchange = sequelize.define(
  "ProductExchange",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "兑换记录唯一标识",
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "关联用户表（users.id），级联删除",
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "关联商品表（products.id），限制删除",
    },
    exchange_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "兑换时间",
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
      comment: "兑换消耗的朴分（与products.points一致）",
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "exchanged",
      comment: "兑换状态（exchanged=已兑换，used=已使用，expired=已过期）",
    },
    expire_at: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "商品券过期时间，NULL表示永久有效",
    },
  },
  {
    tableName: "products_exchanges",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "兑换记录表",
    indexes: [
      {
        name: "idx_exchanges_user",
        fields: ["user_id"],
        comment: "按用户查询兑换记录优化",
      },
      {
        name: "idx_exchanges_time",
        fields: ["exchange_time"],
        comment: "按时间范围查询优化",
      },
    ],
    validate: {
      pointsPositive() {
        if (this.points <= 0) {
          throw new Error("消耗朴分必须为正数");
        }
      },
    },
  }
);

module.exports = ProductExchange;
