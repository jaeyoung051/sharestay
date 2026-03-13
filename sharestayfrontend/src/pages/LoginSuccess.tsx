// src/pages/LoginSuccess.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setAccessToken, setStoredUsername } from "../lib/api";

export default function LoginSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const username = params.get("username");

    if (accessToken) {
      setAccessToken(accessToken);
    }
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    if (username) {
      setStoredUsername(username);
    }

    // 로그인 처리 후 홈으로 이동
    navigate("/", { replace: true });
  }, [navigate]);

  return <div>로그인 처리 중...</div>;
}