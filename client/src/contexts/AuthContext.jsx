import React, {
  createContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import { authAPI } from "../utils/api";

// 认证状态
const initialState = {
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
};

// 认证动作类型
const AuthActionTypes = {
  LOGIN_START: "LOGIN_START",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_ERROR: "LOGIN_ERROR",
  LOGOUT: "LOGOUT",
  SET_LOADING: "SET_LOADING",
  UPDATE_USER: "UPDATE_USER",
};

// 认证reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActionTypes.LOGIN_START:
      return {
        ...state,
        loading: true,
      };
    case AuthActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        isAuthenticated: true,
      };
    case AuthActionTypes.LOGIN_ERROR:
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        isAuthenticated: false,
      };
    case AuthActionTypes.LOGOUT:
      return {
        ...initialState,
        loading: false,
      };
    case AuthActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case AuthActionTypes.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

// 创建认证上下文
const AuthContext = createContext();

// 认证提供者组件
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 初始化时检查本地存储
  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          dispatch({
            type: AuthActionTypes.LOGIN_SUCCESS,
            payload: { user, token },
          });
        } catch (error) {
          console.error("解析用户信息失败:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
        }
      } else {
        dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
      }
    };

    initAuth();
  }, []);

  // 登录
  const login = async (credentials) => {
    try {
      dispatch({ type: AuthActionTypes.LOGIN_START });

      const response = await authAPI.login(credentials);

      if (response.code === 200) {
        const { token, userId, username, totalPoints } = response.data;
        const user = { userId, username, totalPoints };

        // 保存到本地存储
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        dispatch({
          type: AuthActionTypes.LOGIN_SUCCESS,
          payload: { user, token },
        });

        return { success: true };
      } else {
        throw new Error(response.message || "登录失败");
      }
    } catch (error) {
      dispatch({ type: AuthActionTypes.LOGIN_ERROR });
      return { success: false, error: error.message };
    }
  };

  // 注册
  const register = async (userData) => {
    try {
      dispatch({ type: AuthActionTypes.LOGIN_START });

      const response = await authAPI.register(userData);

      if (response.code === 200) {
        const { token, userId, username } = response.data;
        const user = { userId, username, totalPoints: 0 };

        // 保存到本地存储
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        dispatch({
          type: AuthActionTypes.LOGIN_SUCCESS,
          payload: { user, token },
        });

        return { success: true };
      } else {
        throw new Error(response.message || "注册失败");
      }
    } catch (error) {
      dispatch({ type: AuthActionTypes.LOGIN_ERROR });
      return { success: false, error: error.message };
    }
  };

  // 登出
  const logout = async () => {
    try {
      // 调用后端登出接口
      await authAPI.logout();
    } catch (error) {
      console.error("登出请求失败:", error.message);
    } finally {
      // 无论后端请求是否成功，都清除本地状态
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch({ type: AuthActionTypes.LOGOUT });
    }
  };

  // 修改密码
  const changePassword = async (passwordData) => {
    try {
      const response = await authAPI.changePassword(passwordData);

      if (response.code === 200) {
        return { success: true };
      } else {
        throw new Error(response.message || "修改密码失败");
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // 注销账号
  const deleteAccount = async () => {
    try {
      const response = await authAPI.deleteAccount();

      if (response.code === 200) {
        // 注销成功后自动登出
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        dispatch({ type: AuthActionTypes.LOGOUT });
        return { success: true };
      } else {
        throw new Error(response.message || "注销账号失败");
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // 更新用户信息
  const updateUser = useCallback(
    (userData) => {
      const updatedUser = { ...state.user, ...userData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      dispatch({ type: AuthActionTypes.UPDATE_USER, payload: userData });
    },
    [state.user, dispatch]
  );

  // 获取最新用户信息
  const refreshUser = useCallback(async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.code === 200) {
        const { userId, username, totalPoints } = response.data;
        const userData = { userId, username, totalPoints };

        // 直接更新本地存储和状态
        localStorage.setItem("user", JSON.stringify(userData));
        dispatch({ type: AuthActionTypes.UPDATE_USER, payload: userData });

        return { success: true, user: response.data };
      }
    } catch (error) {
      console.error("刷新用户信息失败:", error.message);
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  const value = {
    ...state,
    login,
    register,
    logout,
    changePassword,
    deleteAccount,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 导出认证上下文
export { AuthContext };
