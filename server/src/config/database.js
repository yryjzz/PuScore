const { Sequelize } = require("sequelize");
const path = require("path");

// SQLite 数据库配置
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "../../database.sqlite"), // 数据库文件路径
  logging: process.env.NODE_ENV === "development" ? console.log : false, // 开发环境显示SQL日志
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

module.exports = sequelize;
