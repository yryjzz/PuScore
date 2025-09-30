const { DataTypes } = require("sequelize");

/**
 * 组队表模型定义
 */
function defineTeamModel(sequelize) {
  const Team = sequelize.define(
    "Team",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: "组队唯一标识",
      },
      team_code: {
        type: DataTypes.STRING(8),
        allowNull: false,
        unique: true,
        comment: "8位数字组队码（用于队员加入，唯一）",
      },
      captain_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        comment: "队长用户ID",
      },
      status: {
        type: DataTypes.ENUM("pending", "completed", "expired"),
        allowNull: false,
        defaultValue: "pending",
        comment: "组队状态（pending=进行中，completed=成功，expired=过期）",
      },
      created_time: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: "组队创建时间",
      },
      expire_time: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "组队过期时间（最长4小时，不超过当日24:00）",
      },
      completed_time: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "组队成功完成时间（满4人时更新）",
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
      tableName: "teams",
      timestamps: true,
      indexes: [
        {
          name: "idx_teams_code",
          fields: ["team_code"],
          comment: "按组队码查询优化",
        },
        {
          name: "idx_teams_status_time",
          fields: ["status", "expire_time"],
          comment: "按状态+时间查询优化，如清理过期组队",
        },
        {
          name: "idx_teams_captain_time",
          fields: ["captain_id", "created_time"],
          comment: "按队长+创建时间查询优化",
        },
      ],
      validate: {
        expireTimeAfterCreatedTime() {
          if (this.expire_time <= this.created_time) {
            throw new Error("过期时间必须晚于创建时间");
          }
        },
      },
    }
  );

  return Team;
}

module.exports = defineTeamModel;
