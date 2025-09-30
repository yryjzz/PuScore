const { DataTypes } = require("sequelize");

/**
 * 组队成员表模型定义
 */
function defineTeamMemberModel(sequelize) {
  const TeamMember = sequelize.define(
    "TeamMember",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: "成员记录唯一标识",
      },
      team_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "teams",
          key: "id",
        },
        onDelete: "CASCADE",
        comment: "关联组队表",
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        comment: "关联用户表",
      },
      role: {
        type: DataTypes.ENUM("captain", "member"),
        allowNull: false,
        comment: "成员角色（captain=队长，member=队员）",
      },
      join_time: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: "加入组队时间",
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
      tableName: "team_members",
      timestamps: true,
      indexes: [
        {
          name: "idx_team_members_team",
          fields: ["team_id"],
          comment: "按组队查询成员优化",
        },
        {
          name: "idx_team_members_user",
          fields: ["user_id"],
          comment: "按用户查询参与的组队优化",
        },
        {
          name: "idx_team_members_user_time",
          fields: ["user_id", "join_time"],
          comment: "按用户+时间查询优化",
        },
        {
          name: "idx_unique_team_user",
          fields: ["team_id", "user_id"],
          unique: true,
          comment: "确保用户在同一组队中只能加入一次",
        },
      ],
    }
  );

  return TeamMember;
}

module.exports = defineTeamMemberModel;
