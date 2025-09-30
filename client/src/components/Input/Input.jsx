import React, { useState } from "react";
import "./Input.css";

const Input = ({
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  label,
  showPassword = false,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const inputType =
    type === "password" && showPassword && isPasswordVisible ? "text" : type;

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="input-wrapper">
      {label && <label className="input-label">{label}</label>}
      <div className="input-container">
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`form-input ${error ? "error" : ""}`}
          {...props}
        />
        {type === "password" && showPassword && (
          <button
            type="button"
            className="password-toggle"
            onClick={togglePasswordVisibility}
          >
            {isPasswordVisible ? "👁️" : "👁️‍🗨️"}
          </button>
        )}
      </div>
      {error && <span className="input-error">{error}</span>}
    </div>
  );
};

export default Input;
