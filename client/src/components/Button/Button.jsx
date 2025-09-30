import React from "react";
import "./Button.css";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  onClick,
  className = "",
  ...props
}) => {
  const baseClass = "cyber-btn";
  const variantClass = `cyber-btn--${variant}`;
  const sizeClass = `cyber-btn--${size}`;
  const loadingClass = loading ? "cyber-btn--loading" : "";
  const disabledClass = disabled ? "cyber-btn--disabled" : "";

  const buttonClass = [
    baseClass,
    variantClass,
    sizeClass,
    loadingClass,
    disabledClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      <span className="cyber-btn__content">
        {loading && <div className="cyber-btn__loading"></div>}
        <span
          className={loading ? "cyber-btn__text--loading" : "cyber-btn__text"}
        >
          {children}
        </span>
      </span>
      <div className="cyber-btn__glitch"></div>
    </button>
  );
};

export default Button;
