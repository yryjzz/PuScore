import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import Card from "../../components/Card/Card";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 清除对应字段的错误
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // 清除登录错误
    if (loginError) {
      setLoginError("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "请输入用户名";
    }

    if (!formData.password) {
      newErrors.password = "请输入密码";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await login(formData);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setLoginError(result.error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-background">
          <div className="circuit-lines"></div>
          <div className="floating-particles"></div>
        </div>

        <Card className="login-card" variant="primary">
          <div className="login-header">
            <h1 className="login-title neon-title">PuScore</h1>
            <p className="login-subtitle">朴分系统 - 登录</p>
            <div className="title-divider"></div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {loginError && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {loginError}
              </div>
            )}

            <Input
              name="username"
              type="text"
              placeholder="输入用户名"
              label="用户名"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              autoComplete="username"
            />

            <Input
              name="password"
              type="password"
              placeholder="输入密码"
              label="密码"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              showPassword={true}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="large"
              loading={loading}
              className="login-btn"
            >
              {loading ? "登录中..." : "登录"}
            </Button>
          </form>

          <div className="login-footer">
            <div className="login-links">
              <Link to="/register" className="auth-link">
                还没有账号？<span className="link-highlight">立即注册</span>
              </Link>
            </div>

            <div className="version-info">
              <span className="version-text">v1.6.0 - Cyberpunk Edition</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
