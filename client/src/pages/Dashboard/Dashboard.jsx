import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/Button/Button";
import Card from "../../components/Card/Card";
import Checkin from "../../components/Checkin/Checkin";
import Team from "../../components/Team/Team";
import ProductExchange from "../../components/ProductExchange/ProductExchange";
import History from "../../components/History/History";
import AdminPanel from "../AdminPanel/AdminPanel";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // 判断是否为开发环境
  const isDevelopment = import.meta.env.DEV;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshUser();
    setIsRefreshing(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    navigate("/login");
  };

  const handleCheckinSuccess = async () => {
    // 签到成功后刷新用户信息
    await refreshUser();
  };

  const handleTeamSuccess = async () => {
    // 组队成功后刷新用户信息
    await refreshUser();
  };

  const handleExchangeSuccess = async () => {
    // 兑换成功后刷新用户信息
    await refreshUser();
  };

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  const toggleAdminPanel = () => {
    setShowAdminPanel(!showAdminPanel);
  };

  // 如果显示管理员面板，直接返回管理员面板
  if (showAdminPanel) {
    return (
      <div className="dashboard-page">
        <div className="admin-panel-container">
          <div className="admin-panel-header">
            <Button
              variant="secondary"
              onClick={toggleAdminPanel}
              className="back-to-dashboard-btn"
            >
              ← 返回控制台
            </Button>
          </div>
          <AdminPanel />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-background">
        <div className="circuit-lines"></div>
        <div className="floating-particles"></div>
      </div>

      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title neon-title">PuScore</h1>
          <p className="dashboard-subtitle">朴分系统 - 控制台</p>
        </div>

        <div className="dashboard-content">
          <Card className="user-info-card" variant="primary" title="用户信息">
            <div className="user-info">
              <div className="user-detail">
                <span className="detail-label">用户名</span>
                <span className="detail-value">{user?.username}</span>
              </div>
              <div className="user-detail">
                <span className="detail-label">用户ID</span>
                <span className="detail-value">#{user?.userId}</span>
              </div>
              <div className="user-detail">
                <span className="detail-label">朴分余额</span>
                <span className="detail-value points">
                  {user?.totalPoints || 0}
                </span>
              </div>
            </div>
          </Card>

          <Card className="actions-card" variant="default" title="账户管理">
            <div className="action-buttons">
              <Button
                variant="secondary"
                size="medium"
                loading={isRefreshing}
                onClick={handleRefresh}
                className="action-btn"
              >
                {isRefreshing ? "刷新中..." : "刷新数据"}
              </Button>

              <Button
                variant="primary"
                size="medium"
                onClick={handleChangePassword}
                className="action-btn"
              >
                修改密码
              </Button>

              {isDevelopment && (
                <Button
                  variant="primary"
                  size="medium"
                  onClick={toggleAdminPanel}
                  className="action-btn admin-btn"
                >
                  🔧 管理员面板
                </Button>
              )}

              <Button
                variant="danger"
                size="medium"
                loading={isLoggingOut}
                onClick={handleLogout}
                className="action-btn"
              >
                {isLoggingOut ? "登出中..." : "退出登录"}
              </Button>
            </div>
          </Card>

          <Card className="checkin-card" variant="default" title="签到中心">
            <Checkin onCheckinSuccess={handleCheckinSuccess} />
          </Card>

          <Card className="team-card" variant="default" title="组队中心">
            <Team onTeamSuccess={handleTeamSuccess} />
          </Card>

          <Card className="exchange-card" variant="default" title="商品券兑换">
            <ProductExchange onExchangeSuccess={handleExchangeSuccess} />
          </Card>

          <Card className="history-card" variant="default" title="历史记录">
            <History />
          </Card>
        </div>

        <div className="dashboard-footer">
          <div className="version-info">
            <span className="version-text">v1.6.0 - Cyberpunk Edition</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
