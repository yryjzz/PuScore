import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import Card from "../../components/Card/Card";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [registerError, setRegisterError] = useState("");

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

    // 清除注册错误
    if (registerError) {
      setRegisterError("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "请输入用户名";
    } else if (formData.username.trim().length < 3) {
      newErrors.username = "用户名至少需要3个字符";
    } else if (formData.username.trim().length > 20) {
      newErrors.username = "用户名不能超过20个字符";
    }

    if (!formData.password) {
      newErrors.password = "请输入密码";
    } else if (formData.password.length < 6) {
      newErrors.password = "密码至少需要6个字符";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "请确认密码";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "两次输入的密码不一致";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await register(formData);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setRegisterError(result.error);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-background">
          <div className="circuit-lines"></div>
          <div className="floating-particles"></div>
        </div>

        <Card className="register-card" variant="success">
          <div className="register-header">
            <h1 className="register-title neon-title">PuScore</h1>
            <p className="register-subtitle">朴分系统 - 注册</p>
            <div className="title-divider"></div>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            {registerError && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {registerError}
              </div>
            )}

            <Input
              name="username"
              type="text"
              placeholder="输入用户名 (3-20字符)"
              label="用户名"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              autoComplete="username"
            />

            <Input
              name="password"
              type="password"
              placeholder="输入密码 (至少6字符)"
              label="密码"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              showPassword={true}
              autoComplete="new-password"
            />

            <Input
              name="confirmPassword"
              type="password"
              placeholder="再次输入密码"
              label="确认密码"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              showPassword={true}
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="success"
              size="large"
              loading={loading}
              className="register-btn"
            >
              {loading ? "注册中..." : "注册"}
            </Button>
          </form>

          <div className="register-footer">
            <div className="register-links">
              <Link to="/login" className="auth-link">
                已有账号？<span className="link-highlight">立即登录</span>
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

export default Register;
