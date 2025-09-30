import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import Card from "../../components/Card/Card";
import "./ChangePassword.css";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { changePassword, logout } = useAuth();

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [changeError, setChangeError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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

    // 清除全局错误和成功状态
    if (changeError) {
      setChangeError("");
    }
    if (success) {
      setSuccess(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.oldPassword) {
      newErrors.oldPassword = "请输入当前密码";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "请输入新密码";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "新密码至少需要6个字符";
    } else if (formData.newPassword === formData.oldPassword) {
      newErrors.newPassword = "新密码不能与当前密码相同";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "请确认新密码";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "两次输入的新密码不一致";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const result = await changePassword({
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword,
    });

    setIsSubmitting(false);

    if (result.success) {
      setSuccess(true);
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });

      // 3秒后返回仪表板
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } else {
      setChangeError(result.error);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  const handleLogoutAfterChange = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="change-password-page">
      <div className="change-password-container">
        <div className="change-password-background">
          <div className="circuit-lines"></div>
          <div className="floating-particles"></div>
        </div>

        <Card className="change-password-card" variant="primary">
          <div className="change-password-header">
            <h1 className="change-password-title neon-title">修改密码</h1>
            <p className="change-password-subtitle">更新您的账户密码</p>
            <div className="title-divider"></div>
          </div>

          {success ? (
            <div className="success-container">
              <div className="success-message">
                <div className="success-icon">✅</div>
                <h3>密码修改成功！</h3>
                <p>您的密码已成功更新，3秒后将返回仪表板。</p>
              </div>

              <div className="success-actions">
                <Button
                  variant="primary"
                  onClick={() => navigate("/dashboard")}
                  className="success-btn"
                >
                  立即返回
                </Button>

                <Button
                  variant="secondary"
                  onClick={handleLogoutAfterChange}
                  className="success-btn"
                >
                  重新登录
                </Button>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="change-password-form">
                {changeError && (
                  <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {changeError}
                  </div>
                )}

                <Input
                  name="oldPassword"
                  type="password"
                  placeholder="输入当前密码"
                  label="当前密码"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  error={errors.oldPassword}
                  showPassword={true}
                  autoComplete="current-password"
                />

                <Input
                  name="newPassword"
                  type="password"
                  placeholder="输入新密码 (至少6字符)"
                  label="新密码"
                  value={formData.newPassword}
                  onChange={handleChange}
                  error={errors.newPassword}
                  showPassword={true}
                  autoComplete="new-password"
                />

                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="再次输入新密码"
                  label="确认新密码"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  showPassword={true}
                  autoComplete="new-password"
                />

                <div className="form-actions">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isSubmitting}
                    className="change-password-btn"
                  >
                    {isSubmitting ? "修改中..." : "修改密码"}
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="cancel-btn"
                  >
                    取消
                  </Button>
                </div>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ChangePassword;
