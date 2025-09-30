import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // 如果还在加载中，显示加载状态
  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">正在验证身份...</p>
        </div>
      </div>
    );
  }

  // 如果未认证，重定向到登录页，并记录当前路径
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
