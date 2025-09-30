/**
 * 自定义错误类
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 业务错误类型
 */
class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class AuthenticationError extends AppError {
  constructor(message = "认证失败") {
    super(message, 401);
  }
}

class AuthorizationError extends AppError {
  constructor(message = "权限不足") {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message = "资源未找到") {
    super(message, 404);
  }
}

/**
 * 统一错误响应格式
 */
const formatErrorResponse = (error) => {
  return {
    code: error.statusCode || 500,
    message: error.message || "服务器内部错误",
    data: null,
  };
};

/**
 * 异步函数错误捕获包装器
 */
const asyncHandler = (fn) => {
  return async (request, reply) => {
    try {
      await fn(request, reply);
    } catch (error) {
      reply.status(error.statusCode || 500).send(formatErrorResponse(error));
    }
  };
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  formatErrorResponse,
  asyncHandler,
};
