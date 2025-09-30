const { Sequelize } = require("sequelize");
const path = require("path");

// SQLite 数据库配置
const dbPath =
  process.env.NODE_ENV === "production"
    ? "/app/data/database.sqlite" // Docker 生产环境路径
    : path.join(__dirname, "../../database.sqlite"); // 开发环境路径

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: process.env.NODE_ENV === "development" ? console.log : false, // 开发环境显示SQL日志
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

module.exports = sequelize;
