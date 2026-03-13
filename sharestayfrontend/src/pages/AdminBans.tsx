import {
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

interface BanRecord {
  banId: number;
  userId: number;
  reason: string;
  bannedAt: string;
  endDate?: string | null;
  memo?: string | null;
  isActive: boolean;
  active?: boolean;
}

interface BanHistoryRecord {
  historyId: number;
  banId: number;
  userId: number;
  action: string;
  reason: string;
  endDate?: string | null;
  memo?: string | null;
  createdAt: string;
}

interface User {
  id: number;
  username: string;
  nickname?: string;
}

type DurationPreset = "1d" | "7d" | "30d" | "permanent";

const normalizeBan = (ban: BanRecord): BanRecord => ({
  ...ban,
  // API에서 active/isActive 혼용 대응
  isActive:
    typeof ban.isActive === "boolean"
      ? ban.isActive
      : typeof ban.active === "boolean"
      ? ban.active
      : false,
  endDate: ban.endDate ?? null,
  memo: ban.memo ?? null,
});

export default function AdminBans() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [currentBan, setCurrentBan] = useState<BanRecord | null>(null);
  const [historyLog, setHistoryLog] = useState<BanHistoryRecord[]>([]);
  const [allBans, setAllBans] = useState<BanRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const [reason, setReason] = useState("");
  const [endDate, setEndDate] = useState<string>("");
  const [memo, setMemo] = useState("");
  const [unbanReason, setUnbanReason] = useState("");

  const userLabelMap = useMemo(
    () =>
      users.reduce<Record<number, string>>((map, user) => {
        map[user.id] = `${user.nickname ?? user.username} (${user.username})`;
        return map;
      }, {}),
    [users]
  );


  const formatDateTime = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
  };

  const fetchUsers = async () => {
    const { data } = await api.get<User[]>("/users");
    setUsers(data);
  };

  const fetchAllBans = async () => {
    const { data } = await api.get<BanRecord[]>("/bans");
    setAllBans(data.map(normalizeBan));
  };

  const fetchUserBan = async (userId: number) => {
    setLoading(true);
    try {
      const { data } = await api.get<BanRecord[]>(`/bans/users/${userId}`);
      const latest = data.map(normalizeBan).sort((a, b) => b.banId - a.banId)[0] ?? null;
      setCurrentBan(latest);
      if (latest) {
        setReason(latest.reason ?? "");
        setEndDate(
          latest.endDate
            ? new Date(new Date(latest.endDate).getTime() - new Date().getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16)
            : ""
        );
        setMemo(latest.memo ?? "");
      } else {
        setReason("");
        setEndDate("");
        setMemo("");
      }
    } catch {
      alert("정지 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserHistory = async (userId: number) => {
    try {
      const { data } = await api.get<BanHistoryRecord[]>(`/bans/users/${userId}/history`);
      setHistoryLog(data);
    } catch {
      setHistoryLog([]);
    }
  };

  useEffect(() => {
    void fetchUsers();
    void fetchAllBans();
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      setCurrentBan(null);
      setHistoryLog([]);
      return;
    }
    void fetchUserBan(selectedUserId);
    void fetchUserHistory(selectedUserId);
  }, [selectedUserId]);

  const handleDurationPreset = (preset: DurationPreset, setter: (value: string) => void) => {
    const now = new Date();
    let date: Date | null = null;
    switch (preset) {
      case "1d":
        date = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case "7d":
        date = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        date = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
      case "permanent":
        date = null;
        break;
    }
    setter(
      date
        ? new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16)
        : ""
    );
  };

  const handleBanSubmit = async () => {
    if (!selectedUserId) {
      alert("사용자를 선택해주세요.");
      return;
    }
    if (!reason.trim()) {
      alert("정지 사유는 필수입니다.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        reason,
        expireAt: endDate || null,
        memo,
        active: true,
      };
      if (currentBan) {
        await api.patch(`/bans/${currentBan.banId}`, payload);
      } else {
        await api.post(`/bans/users/${selectedUserId}`, payload);
      }
      await fetchUserBan(selectedUserId);
      await fetchUserHistory(selectedUserId);
      await fetchAllBans();
      alert("정지/재정지가 완료되었습니다.");
    } catch (err: any) {
      const message = err?.response?.data?.message ?? "정지 등록 중 오류가 발생했습니다.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async () => {
    if (!selectedUserId || !currentBan) {
      alert("현재 정지된 사용자가 없습니다.");
      return;
    }
    const reasonToUse = unbanReason.trim() || reason.trim();
    if (!reasonToUse) {
      alert("해제 사유를 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      await api.patch(`/bans/${currentBan.banId}`, {
        reason: reasonToUse,
        expireAt: endDate || null,
        memo,
        active: false,
      });
      await fetchUserBan(selectedUserId);
      await fetchUserHistory(selectedUserId);
      await fetchAllBans();
      alert("정지 해제되었습니다.");
    } catch (err: any) {
      const message = err?.response?.data?.message ?? "정지 해제 중 오류가 발생했습니다.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              사용자 정지 관리
            </Typography>
            <Typography variant="body2" color="text.secondary">
              한 유저당 하나의 정지 건을 유지하며, 해제/재정지/수정은 같은 ban_id로 처리합니다.
            </Typography>
          </Box>
        </Stack>

        <TextField
          select
          label="사용자 선택"
          value={selectedUserId ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedUserId(value === "" ? null : Number(value));
          }}
          sx={{ mb: 2, minWidth: 260 }}
          size="small"
        >
          <MenuItem value="">
            <em>선택하세요</em>
          </MenuItem>
          {users.map((user) => (
            <MenuItem key={user.id} value={user.id}>
              {user.nickname ?? user.username} ({user.username})
            </MenuItem>
          ))}
        </TextField>

        {!selectedUserId && (
          <Alert severity="info" sx={{ mb: 2 }}>
            사용자를 선택하면 현재 정지 상태와 이력을 확인할 수 있습니다.
          </Alert>
        )}

        {selectedUserId && (
          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="h6">현재 상태</Typography>
                {currentBan?.isActive ? (
                  currentBan.endDate ? (
                    <Chip label="정지" color="warning" size="small" />
                  ) : (
                    <Chip label="영구정지" color="error" size="small" />
                  )
                ) : (
                  <Chip label="해제" size="small" />
                )}
                {currentBan && (
                  <Typography variant="body2" color="text.secondary">
                    ban_id: {currentBan.banId}
                  </Typography>
                )}
              </Stack>
              <Stack spacing={2} mt={2}>
                <TextField
                  label="정지 사유"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label="종료일(선택)"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button variant="outlined" size="small" onClick={() => handleDurationPreset("1d", setEndDate)}>
                    +1일
                  </Button>
                  <Button variant="outlined" size="small" onClick={() => handleDurationPreset("7d", setEndDate)}>
                    +7일
                  </Button>
                  <Button variant="outlined" size="small" onClick={() => handleDurationPreset("30d", setEndDate)}>
                    +30일
                  </Button>
                  <Button variant="text" size="small" onClick={() => handleDurationPreset("permanent", setEndDate)}>
                    영구
                  </Button>
                </Stack>
                <TextField
                  label="메모 (선택)"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  multiline
                  minRows={3}
                  fullWidth
                />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} mt={1}>
                  <Button
                    variant="contained"
                    onClick={handleBanSubmit}
                    disabled={loading}
                    sx={{ minWidth: 160 }}
                  >
                    {currentBan ? "재정지 / 수정" : "정지 등록"}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleUnban}
                    disabled={loading || !currentBan?.isActive}
                    sx={{ minWidth: 160 }}
                  >
                    정지 해제
                  </Button>
                  <TextField
                    label="해제 사유"
                    placeholder="해제 시 사유 필수"
                    value={unbanReason}
                    onChange={(e) => setUnbanReason(e.target.value)}
                    size="small"
                    fullWidth
                  />
                </Stack>
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                정지 이력
              </Typography>
              {historyLog.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  이력이 없습니다.
                </Typography>
              ) : (
                <Box sx={{ overflowX: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>액션</TableCell>
                        <TableCell>사유</TableCell>
                        <TableCell>종료일</TableCell>
                        <TableCell>메모</TableCell>
                        <TableCell>기록 시각</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historyLog.map((h) => (
                        <TableRow key={h.historyId}>
                          <TableCell>{h.action}</TableCell>
                          <TableCell>{h.reason}</TableCell>
                          <TableCell>{formatDateTime(h.endDate)}</TableCell>
                          <TableCell>{h.memo ?? "-"}</TableCell>
                          <TableCell>{formatDateTime(h.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Paper>
          </Stack>
        )}
      </Paper>

      {/* 전체 목록 (간단 조회용) */}
      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: 2 }}>
        <Typography variant="h6" gutterBottom>
          전체 정지 목록 (현재 정지 중인 사용자만)
        </Typography>
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>사용자</TableCell>
                <TableCell>사유</TableCell>
                <TableCell>시작일</TableCell>
                <TableCell>종료일</TableCell>
                <TableCell>상태</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allBans
                .filter((ban) => ban.isActive)
                .map((ban) => (
                  <TableRow key={ban.banId}>
                    <TableCell>{userLabelMap[ban.userId] ?? `#${ban.userId}`}</TableCell>
                    <TableCell>{ban.reason}</TableCell>
                    <TableCell>{formatDateTime(ban.bannedAt)}</TableCell>
                    <TableCell>{formatDateTime(ban.endDate)}</TableCell>
                    <TableCell>
                      {ban.endDate
                        ? <Chip label="정지" color="warning" size="small" />
                        : <Chip label="영구정지" color="error" size="small" />}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Stack>
  );
}
