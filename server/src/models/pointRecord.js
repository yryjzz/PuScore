const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * 朴分记录表模型
 * 记录用户朴分的所有变动
 */
const PointRecord = sequelize.define(
  "PointRecord",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    change_type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "变动类型：checkin=签到，team=组队，exchange=兑换，expire=过期",
    },
    related_info: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "关联业务信息JSON：签到、朴分瓜分、商城兑换、过期等详细信息",
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "变动朴分数量（正数=增加，负数=减少）",
    },
    total_points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "变动后总朴分（确保非负）",
      validate: {
        min: 0,
      },
    },
    created_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "变动时间",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "point_records",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        fields: ["user_id"],
        name: "idx_point_records_user",
      },
      {
        fields: ["change_type"],
        name: "idx_point_records_type",
      },
      {
        fields: ["created_time"],
        name: "idx_point_records_time",
      },
    ],
  }
);

module.exports = PointRecord;
