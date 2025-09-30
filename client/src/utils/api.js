import axios from "axios";

// 智能获取API基础URL
const getApiBaseURL = () => {
  // 如果是开发环境
  if (import.meta.env.DEV) {
    const hostname = window.location.hostname;

    // 如果是localhost，说明在电脑上访问
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:3000/api";
    }

    // 如果是IP地址，说明从手机访问，使用相同的IP但端口3000
    return `http://${hostname}:3000/api`;
  }

  // 生产环境使用相对路径
  return "/api";
};

// 创建axios实例
const api = axios.create({
  baseURL: getApiBaseURL(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 调试信息
console.log("API Base URL:", getApiBaseURL());

// 请求拦截器 - 自动添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一处理响应和错误
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // 服务器返回的错误
      const { status, data } = error.response;

      // token失效，自动登出
      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(new Error("登录已过期，请重新登录"));
      }

      // 返回后端的错误信息
      return Promise.reject(new Error(data?.message || "请求失败"));
    } else if (error.request) {
      // 网络错误
      return Promise.reject(new Error("网络连接失败，请检查网络"));
    } else {
      // 其他错误
      return Promise.reject(new Error("请求出错，请稍后重试"));
    }
  }
);

// 认证相关API
export const authAPI = {
  // 用户注册
  register: (userData) => api.post("/auth/register", userData),

  // 用户登录
  login: (credentials) => api.post("/auth/login", credentials),

  // 用户登出
  logout: () => api.post("/auth/logout"),

  // 修改密码
  changePassword: (passwordData) => api.post("/auth/changepwd", passwordData),

  // 注销账号
  deleteAccount: () => api.delete("/auth/delete"),

  // 获取个人信息
  getProfile: () => api.get("/auth/user/profile"),

  // 获取签到信息
  getCheckinInfo: () => api.get("/auth/user/checkin"),
};

// 朴分相关API
export const pointAPI = {
  // 用户签到
  checkin: () => api.post("/point/checkin"),

  // 获取朴分记录
  getRecords: (params = {}) => api.get("/point/records", { params }),
};

// 商品相关API
export const productAPI = {
  // 获取可兑换商品券
  getExchangeable: () => api.get("/product/exchangeable"),

  // 兑换商品券
  exchange: (productId) =>
    api.post("/product/exchange", { product_id: productId }),

  // 获取兑换记录
  getExchanges: (params = {}) => api.get("/product/exchanges", { params }),
};

// 组队相关API
export const teamAPI = {
  // 创建组队
  create: () => api.post("/team/create"),

  // 加入组队
  join: (teamCode) => api.post("/team/join", { team_code: teamCode }),

  // 获取组队详情
  getDetail: (teamCode) => api.get(`/team/${teamCode}`),

  // 检查今日是否已创建组队
  checkCreatedToday: () => api.get("/team/check-created-today"),

  // 检查今日是否已参与组队
  checkJoinedToday: () => api.get("/team/check-joined-today"),

  // 检查组队过期状态
  checkExpired: (teamCode) => api.get(`/team/${teamCode}/check-expired`),

  // 获取用户组队记录
  getRecords: (params = {}) => api.get("/team/records", { params }),
};

// 系统相关API
export const systemAPI = {
  // 健康检查
  health: () => api.get("/health"),
};

// 管理员相关API
export const adminAPI = {
  // 时间控制
  setTime: (payload) => api.post("/admin/time", payload),
  getTimeStatus: () => api.get("/admin/time"),
  resetTime: () => api.delete("/admin/time"),

  // 系统统计
  getSystemStats: () => api.get("/admin/stats"),
  getSystemInfo: () => api.get("/admin/info"),

  // 签到管理
  generateCheckinCycles: (params = {}) =>
    api.post("/admin/checkin/generate", {}, { params }),
  getCheckinCycles: (params = {}) =>
    api.get("/admin/checkin/cycles", { params }),
  getCurrentWeekCycles: () => api.get("/admin/checkin/current"),
  getCheckinCycleDetail: (id) => api.get(`/admin/checkin/cycles/${id}`),
  getCheckinProducts: (params = {}) =>
    api.get("/admin/checkin/products", { params }),

  // 朴分管理
  expirePoints: () => api.post("/admin/point/expire"),
  checkExpireDate: () => api.get("/admin/point/expire-check"),

  // 商品券管理
  expireProducts: () => api.post("/admin/product/expire"),
};

export default api;
