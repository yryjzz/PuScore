const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// 签到周期表模型 - 对应数据库设计中的 checkin_cycles 表
const CheckinCycle = sequelize.define(
  "CheckinCycle",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "周期唯一标识",
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "周期开始日期（固定为周一）",
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "周期结束日期（固定为周日）",
    },
    config: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: "一周签到配置的JSON数据",
    },
  },
  {
    tableName: "checkin_cycles",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "签到周期表",
    indexes: [
      {
        name: "idx_checkin_cycles_date",
        fields: ["start_date", "end_date"],
      },
    ],
    validate: {
      dateRange() {
        if (this.start_date >= this.end_date) {
          throw new Error("周期开始日期必须早于结束日期");
        }
      },
    },
  }
);

module.exports = CheckinCycle;
