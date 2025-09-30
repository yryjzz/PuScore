const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// 用户表模型 - 对应数据库设计中的 users 表
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "用户唯一标识",
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: "用户名（登录用，需唯一）",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "密码",
    },
    total_points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "用户当前总朴分",
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: "账号状态（1=正常，0=注销）",
    },
    last_login_time: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "最后登录时间",
    },
  },
  {
    tableName: "users",
    timestamps: true, // 自动创建 createdAt 和 updatedAt
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "用户表",
    indexes: [
      {
        name: "idx_users_username",
        fields: ["username"],
      },
    ],
  }
);

module.exports = User;
