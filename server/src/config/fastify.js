const fastify = require('fastify');

// Fastify 配置
const createApp = () => {
  const app = fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info'
    }
  });

  // 注册CORS插件
  app.register(require('@fastify/cors'), {
    origin: true // 开发环境允许所有来源
  });

  // 注册JWT插件
  app.register(require('@fastify/jwt'), {
    secret: process.env.JWT_SECRET || 'pu-score-secret-key'
  });

  // 全局错误处理器
  app.setErrorHandler(async (error, request, reply) => {
    app.log.error(error);
    
    // 返回统一错误格式
    reply.status(error.statusCode || 500).send({
      code: error.statusCode || 500,
      message: error.message || '服务器内部错误',
      data: null
    });
  });

  return app;
};module.exports = createApp;
