import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

// 使用认证上下文的Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
