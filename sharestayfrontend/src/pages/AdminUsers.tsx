﻿// src/pages/AdminUsers.tsx
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import { api } from "../lib/api";
import type { Roles, UserInfo } from "../auth/types";

interface BackendUser {
  id: number;
  username: string;
  nickname?: string;
  role?: string;
  roles?: string[];
  address?: string;
  phoneNumber?: string;
  lifeStyle?: string;
  signupDate?: string;
  hostIntroduction?: string;
  hostTermsAgreed?: boolean;
}

interface AdminUser extends UserInfo {}

const normalizeRole = (value: string): Roles =>
  value.toUpperCase() as Roles;

const extractRoles = (user: BackendUser): Roles[] => {
  if (user.roles?.length) {
    return Array.from(new Set(user.roles.map(normalizeRole)));
  }
  if (user.role) {
    return [normalizeRole(user.role)];
  }
  return [];
};

const mapBackendUser = (user: BackendUser): AdminUser => {
  const roles = extractRoles(user);
  return {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    email: user.username,
    role: roles[0],
    roles,
    address: user.address,
    phoneNumber: user.phoneNumber,
    lifeStyle: user.lifeStyle,
    signupDate: user.signupDate,
    hostIntroduction: user.hostIntroduction,
    hostTermsAgreed: user.hostTermsAgreed,
  };
};

interface EditForm {
  nickname: string;
  address: string;
  phoneNumber: string;
  lifeStyle: string;
  hostIntroduction: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<EditForm>({
    nickname: "",
    address: "",
    phoneNumber: "",
    lifeStyle: "",
    hostIntroduction: "",
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<BackendUser[]>("/users");
      setUsers(data.map(mapBackendUser));
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "사용자 목록을 불러오지 못했습니다.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenDialog = (user: AdminUser) => {
    setSelectedUser(user);
    setForm({
      nickname: user.nickname ?? "",
      address: user.address ?? "",
      phoneNumber: user.phoneNumber ?? "",
      lifeStyle: user.lifeStyle ?? "",
      hostIntroduction: user.hostIntroduction ?? "",
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setForm({
      nickname: "",
      address: "",
      phoneNumber: "",
      lifeStyle: "",
      hostIntroduction: "",
    });
  };

  type EditableTextField =
    | "nickname"
    | "address"
    | "phoneNumber"
    | "lifeStyle"
    | "hostIntroduction";

  const handleChange =
    (field: EditableTextField) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSave = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    try {
      await api.put(`/users/${selectedUser.username}`, form);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === selectedUser.id
            ? {
                ...user,
                nickname: form.nickname,
                address: form.address,
                phoneNumber: form.phoneNumber,
                lifeStyle: form.lifeStyle,
              }
            : user
        )
      );
      handleCloseDialog();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "사용자 정보를 저장하는 중 오류가 발생했습니다.";
      alert(message);
    } finally {
      setIsSaving(false);
    }
  };

  const rows = useMemo(() => users, [users]);

  return (
    <>
      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: 4 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              회원 관리
            </Typography>
            <Typography variant="body2" color="text.secondary">
              전체 회원 정보를 조회하고 프로필 데이터를 수정할 수 있습니다.
            </Typography>
          </Box>
          <Button variant="outlined" onClick={fetchUsers} disabled={loading}>
            새로고침
          </Button>
        </Stack>

        {loading ? (
          <Box display="grid" sx={{ placeItems: "center" }} minHeight={200}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : rows.length === 0 ? (
          <Typography>등록된 회원이 없습니다.</Typography>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>회원</TableCell>
                  <TableCell>닉네임</TableCell>
                  <TableCell>역할</TableCell>
                  <TableCell>연락처</TableCell>
                  <TableCell>주소 (선택)</TableCell>
                  <TableCell>라이프스타일 (선택)</TableCell>
                  <TableCell>호스트 소개</TableCell>
                  <TableCell>가입일</TableCell>
                  <TableCell align="right">관리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ bgcolor: "primary.main" }}>
                          {user.nickname?.slice(0, 1)?.toUpperCase() ??
                            user.username.slice(0, 1).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={600}>
                            {user.username}
                          </Typography>
                          {user.email && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {user.email}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{user.nickname ?? "-"}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {user.roles.map((role) => (
                          <Chip
                            key={role}
                            label={role}
                            size="small"
                            color="secondary"
                          />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>{user.phoneNumber ?? "-"}</TableCell>
                    <TableCell>{user.address ?? "-"}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: "pre-wrap" }}
                      >
                        {user.lifeStyle ?? "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: "pre-wrap" }}
                      >
                        {user.hostIntroduction ?? "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {user.signupDate
                        ? new Date(user.signupDate).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenDialog(user)}>
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>회원 정보 수정</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="닉네임"
              value={form.nickname}
              onChange={handleChange("nickname")}
              fullWidth
            />
            <TextField
              label="연락처"
              value={form.phoneNumber}
              onChange={handleChange("phoneNumber")}
              fullWidth
            />
            <TextField
              label="주소 (선택)"
              value={form.address}
              onChange={handleChange("address")}
              fullWidth
            />
            <TextField
              label="라이프스타일 (선택)"
              value={form.lifeStyle}
              onChange={handleChange("lifeStyle")}
              multiline
              minRows={3}
              fullWidth
            />
            {(selectedUser?.roles.includes("HOST") || selectedUser?.roles.includes("ADMIN")) && (
              <TextField
                label="호스트 소개"
                value={form.hostIntroduction}
                onChange={handleChange("hostIntroduction")}
                multiline
                minRows={3}
                fullWidth
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isSaving}>
            취소
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={isSaving}>
            {isSaving ? "저장 중..." : "저장"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
