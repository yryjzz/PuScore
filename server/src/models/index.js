const sequelize = require("../config/database");

// 导入所有模型
const User = require("./user");
const Product = require("./products");
const CheckinCycle = require("./checkinCycle");
const UserCheckinConfig = require("./userCheckinConfig");
const PointRecord = require("./pointRecord");
const ProductExchange = require("./productExchange");
const Team = require("./team")(sequelize);
const TeamMember = require("./teamMember")(sequelize);

// 定义模型关联关系
const models = {
  User,
  Product,
  CheckinCycle,
  UserCheckinConfig,
  PointRecord,
  ProductExchange,
  Team,
  TeamMember,
};

// 设置模型关联关系
User.hasMany(UserCheckinConfig, {
  // 1对多
  foreignKey: "user_id",
  as: "checkinConfigs",
  onDelete: "CASCADE",
});
UserCheckinConfig.belongsTo(User, { foreignKey: "user_id", as: "user" });

CheckinCycle.hasMany(UserCheckinConfig, {
  foreignKey: "cycle_id",
  as: "userConfigs",
  onDelete: "CASCADE",
});
UserCheckinConfig.belongsTo(CheckinCycle, {
  foreignKey: "cycle_id",
  as: "cycle",
  onDelete: "CASCADE",
});

// 用户与朴分记录关联
User.hasMany(PointRecord, { foreignKey: "user_id", as: "pointRecords" });
PointRecord.belongsTo(User, { foreignKey: "user_id", as: "user" });

// 用户与兑换记录关联
User.hasMany(ProductExchange, {
  foreignKey: "user_id",
  as: "productExchanges",
  onDelete: "CASCADE",
});
ProductExchange.belongsTo(User, { foreignKey: "user_id", as: "user" });

// 商品与兑换记录关联
Product.hasMany(ProductExchange, {
  foreignKey: "product_id",
  as: "exchanges",
  onDelete: "RESTRICT",
});
ProductExchange.belongsTo(Product, { foreignKey: "product_id", as: "product" });

// 组队相关关联关系
// 用户与组队关联（作为队长）
User.hasMany(Team, {
  foreignKey: "captain_id",
  as: "captainTeams",
  onDelete: "CASCADE",
});
Team.belongsTo(User, { foreignKey: "captain_id", as: "captain" });

// 组队与组队成员关联
Team.hasMany(TeamMember, {
  foreignKey: "team_id",
  as: "members",
  onDelete: "CASCADE",
});
TeamMember.belongsTo(Team, { foreignKey: "team_id", as: "team" });

// 用户与组队成员关联
User.hasMany(TeamMember, {
  foreignKey: "user_id",
  as: "teamMemberships",
  onDelete: "CASCADE",
});
TeamMember.belongsTo(User, { foreignKey: "user_id", as: "user" });

// 同步数据库表结构
const syncDatabase = async () => {
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log("数据库连接成功");

    // 同步所有模型到数据库（开发环境、Docker 首次启动或 Railway 部署）
    if (
      process.env.NODE_ENV === "development" ||
      process.env.DOCKER_INIT === "true" ||
      process.env.RAILWAY_DEPLOYMENT === "true"
    ) {
      // 只有 SQLite 才需要禁用外键约束
      if (sequelize.getDialect() === "sqlite") {
        await sequelize.query("PRAGMA foreign_keys = OFF;");
        console.log("已禁用外键约束");
      }

      // 使用 force: false 避免删除表，只创建不存在的表
      await User.sync({ force: false });
      console.log("User 表同步完成");
      await Product.sync({ force: false });
      console.log("Product 表同步完成");
      await CheckinCycle.sync({ force: false });
      console.log("CheckinCycle 表同步完成");
      await UserCheckinConfig.sync({ force: false });
      console.log("UserCheckinConfig 表同步完成");
      await PointRecord.sync({ force: false });
      console.log("PointRecord 表同步完成");
      await ProductExchange.sync({ force: false });
      console.log("ProductExchange 表同步完成");
      await Team.sync({ force: false });
      console.log("Team 表同步完成");
      await TeamMember.sync({ force: false });
      console.log("TeamMember 表同步完成");

      // 只有 SQLite 才需要重新启用外键约束
      if (sequelize.getDialect() === "sqlite") {
        await sequelize.query("PRAGMA foreign_keys = ON;");
        console.log("已启用外键约束");
      }

      console.log("数据库表结构同步完成");
    } else {
      console.log("生产环境，请使用迁移工具同步表结构");
    }
  } catch (error) {
    console.error("数据库连接失败:", error);
    throw error;
  }
};

module.exports = {
  sequelize,
  models,
  syncDatabase,
  ...models,
};
