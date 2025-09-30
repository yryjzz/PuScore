const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * 用户-签到关联记录表模型
 * 存储用户选择的签到配置
 */
const UserCheckinConfig = sequelize.define(
  "UserCheckinConfig",
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
    cycle_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "checkin_cycles",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    end_time: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "签到周期结束时间（对应签到周期表的end_date）",
    },
    day1: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: "周一是否已签到（0=未签到，1=已签到）",
    },
    day2: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: "周二是否已签到（0=未签到，1=已签到）",
    },
    day3: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: "周三是否已签到（0=未签到，1=已签到）",
    },
    day4: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: "周四是否已签到（0=未签到，1=已签到）",
    },
    day5: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: "周五是否已签到（0=未签到，1=已签到）",
    },
    day6: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: "周六是否已签到（0=未签到，1=已签到）",
    },
    day7: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: "周日是否已签到（0=未签到，1=已签到）",
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
    tableName: "user_checkin_configs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["user_id", "end_time"],
        name: "idx_user_endtime_unique",
      },
    ],
  }
);

module.exports = UserCheckinConfig;
