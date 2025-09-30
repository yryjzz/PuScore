const { Sequelize } = require("sequelize");
const path = require("path");

// 数据库配置 - 支持多种环境
let sequelize;

if (process.env.DATABASE_URL) {
  // Railway PostgreSQL 数据库
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      ssl:
        process.env.NODE_ENV === "production"
          ? {
              require: true,
              rejectUnauthorized: false,
            }
          : false,
    },
  });
} else {
  // SQLite 配置（本地开发和 Docker）
  const dbPath =
    process.env.RAILWAY_DEPLOYMENT === "true"
      ? "/tmp/database.sqlite" // Railway 临时目录
      : process.env.NODE_ENV === "production"
      ? "/app/data/database.sqlite" // Docker 生产环境路径
      : path.join(__dirname, "../../database.sqlite"); // 开发环境路径

  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: dbPath,
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
}

module.exports = sequelize;
