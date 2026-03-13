﻿// src/components/SiteHeader.tsx
import { AppBar, Box, Button, Stack, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import type { Roles } from "../auth/types";

const navLinks: { label: string; href: string; requireRoles?: Roles[] }[] = [
  { label: "방찾기", href: "/rooms" },
  { label: "지도로 찾기", href: "/RoomMap" },
  { label: "이용 가이드", href: "/guide" },
  { label: "룸 등록", href: "/list-room", requireRoles: ["HOST", "ADMIN"] },
];

type Props = { activePath?: string };

export default function SiteHeader(_: Props) {
  const { user, isLoading, logout } = useAuth();
  const roles = user?.roles ?? (user?.role ? [user.role] : []);

  const allowedLinks = navLinks.filter((link) => {
    if (!link.requireRoles) return true;
    return roles.some((role) => link.requireRoles?.includes(role));
  });

  return (
    <>
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: "white",
          boxShadow: "0px 2px 4px rgba(0,0,0,0.08)",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ flex: "0 0 auto", minWidth: 160 }}>
            <Typography
              component={RouterLink}
              to="/"
              variant="h5"
              fontWeight={700}
              color="inherit"
              sx={{
                textDecoration: "none",
                px: { xs: 0, sm: 1 },
              }}
            >
              ShareStay+
            </Typography>
          </Box>

          <Box
            sx={{
              flex: "1 1 auto",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Stack
              direction="row"
              spacing={{ xs: 0.75, sm: 1.25, md: 1.75 }}
              alignItems="center"
              flexWrap="wrap"
            >
              {allowedLinks.map((link) => (
                <Button
                  key={link.href}
                  component={RouterLink}
                  to={link.href}
                  color="inherit"
                  sx={{
                    fontWeight: 500,
                    px: { xs: 1.25, sm: 1.75, md: 2 },
                    minWidth: 72,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              flex: "0 0 auto",
              display: "flex",
              justifyContent: "flex-end",
              pr: 2,
            }}
          >
            {isLoading ? (
              <Typography variant="body2" color="text.secondary">
                Loading...
              </Typography>
            ) : user ? (
              <Stack
                direction="row"
                spacing={{ xs: 0.75, sm: 1.25, md: 1.5 }}
                alignItems="center"
                flexWrap="wrap"
                justifyContent="flex-end"
              >
                <Typography variant="body2" fontWeight={600}>
                  {user.nickname ?? user.email ?? user.username}
                </Typography>
                <Button
                  component={RouterLink}
                  to="/profile"
                  color="inherit"
                  sx={{ px: { xs: 1, sm: 1.25, md: 1.5 }, minWidth: "auto" }}
                >
                  프로필
                </Button>
                <Button
                  onClick={logout}
                  color="inherit"
                  sx={{ px: { xs: 1, sm: 1.25, md: 1.5 }, minWidth: "auto" }}
                >
                  로그아웃
                </Button>
                {roles.includes("ADMIN") && (
                  <Button
                    component={RouterLink}
                    to="/admin"
                    color="primary"
                    variant="outlined"
                    sx={{ px: { xs: 1, sm: 1.25, md: 1.5 }, minWidth: "auto" }}
                  >
                    관리자
                  </Button>
                )}
              </Stack>
            ) : (
              <Stack direction="row" spacing={1}>
                <Button component={RouterLink} to="/login" color="inherit">
                  로그인
                </Button>
                <Button component={RouterLink} to="/signup" variant="contained">
                  회원가입
                </Button>
              </Stack>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </>
  );
}
