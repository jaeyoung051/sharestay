// src/routes/ProtectedRoute.tsx
import { Box, CircularProgress } from "@mui/material";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import type { Roles } from "../auth/types";

type ProtectedRouteProps = {
  children: JSX.Element;
  requireRoles?: Roles[];
};

export default function ProtectedRoute({
  children,
  requireRoles,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // 인증 상태를 아직 확인 중이면 로딩 스피너를 보여준다.
  if (isLoading)
    return (
      <Box display="grid" sx={{ placeItems: "center" }} minHeight="50vh">
        <CircularProgress />
      </Box>
    );

  // 인증되지 않았다면 로그인 페이지로 리다이렉트한다.
  if (!user) return <Navigate to="/login" replace />;

  // 필수 역할이 지정된 경우 현재 사용자 역할을 검사한다.
  if (
    requireRoles &&
    !requireRoles.some((role) => user.roles?.includes(role))
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
}
