// src/pages/Profile.tsx
import Grid from "@mui/material/Unstable_Grid2";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CircularProgress,
  Container,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Chip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  CalendarToday,
  FavoriteBorder,
  Group,
  HomeWork,
  PersonOutline,
  SecurityOutlined,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "../auth/useAuth";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { api } from "../lib/api";
import { fetchFavoriteRooms } from "../lib/favorites";
import type { FavoriteRoom } from "../types/favorite";
import { extractFavoriteImageUrl } from "../types/favorite";
import { mapRoomFromApi } from "../types/room";
import type { RoomSummary } from "../types/room";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80";

interface ProfileForm {
  nickname: string;
  address: string;
  phoneNumber: string;
  lifeStyle: string;
  hostIntroduction: string;
}

const lifestyleOptions = [
  "조용한 생활",
  "깔끔한 성격",
  "운동 좋아함",
  "요리 좋아함",
  "음악 감상",
  "독서 좋아함",
  "반려동물 좋아함",
  "규칙적인 생활",
];

export default function Profile() {
  const theme = useTheme();
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [favoriteRooms, setFavoriteRooms] = useState<FavoriteRoom[]>([]);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<
    "profile" | "favorites" | "reservations" | "security" | "rooms" | "roommate"
  >("profile");
  const [hostRooms, setHostRooms] = useState<RoomSummary[]>([]);
  const [hostRoomsLoading, setHostRoomsLoading] = useState(false);
  const [hostRoomsError, setHostRoomsError] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileForm>({
    nickname: "",
    address: "",
    phoneNumber: "",
    lifeStyle: "",
    hostIntroduction: "",
  });
  const [lifeStyleSelections, setLifeStyleSelections] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setForm({
        nickname: user.nickname ?? "",
        address: user.address ?? "",
        phoneNumber: user.phoneNumber ?? "",
        lifeStyle: user.lifeStyle ?? "",
        hostIntroduction: user.hostIntroduction ?? "",
      });
    }
  }, [user?.id]);

  useEffect(() => {
    const parsed =
      form.lifeStyle
        ?.split(",")
        .map((item) => item.trim())
        .filter(Boolean) ?? [];
    setLifeStyleSelections(parsed);
  }, [form.lifeStyle]);

  useEffect(() => {
    let ignore = false;
    if (!user?.id) {
      setFavoriteRooms([]);
      return;
    }
    setFavoriteLoading(true);
    setFavoriteError(null);
    fetchFavoriteRooms(user.id)
      .then((data) => {
        if (!ignore) {
          setFavoriteRooms(data);
        }
      })
      .catch((error) => {
        if (ignore) return;
        const message =
          error instanceof Error
            ? error.message
            : "찜한 방을 불러오지 못했어요.";
        setFavoriteError(message);
        setFavoriteRooms([]);
      })
      .finally(() => {
        if (!ignore) {
          setFavoriteLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [user?.id]);

  const roles = useMemo(
    () => user?.roles ?? (user?.role ? [user.role] : []),
    [user]
  );
  const isHost = roles.includes("HOST");
  const isAdmin = roles.includes("ADMIN");
  const hostId = user?.hostId ?? null;
  const canManageRooms = isHost || isAdmin;
  const [adminView, setAdminView] = useState<"guest" | "host">(
    isHost ? "host" : "guest"
  );
  const isHostView = isAdmin ? adminView === "host" : isHost;
  useEffect(() => {
    setAdminView(isHost ? "host" : "guest");
  }, [isHost]);
  const roleLabel = isHostView ? "호스트" : "게스트";

  useEffect(() => {
    if (!canManageRooms) {
      setHostRooms([]);
      setHostRoomsError(null);
      return;
    }
    if (activeSection !== "rooms") return;
    if (!hostId) {
      setHostRooms([]);
      setHostRoomsError("호스트 정보가 없습니다.");
      return;
    }
    let ignore = false;
    setHostRoomsLoading(true);
    setHostRoomsError(null);
    api
      .get(`/rooms/host/${hostId}`)
      .then(({ data }) => {
        if (ignore) return;
        const list = Array.isArray(data) ? data.map(mapRoomFromApi) : [];
        setHostRooms(list);
      })
      .catch((error) => {
        if (ignore) return;
        const message =
          error instanceof Error
            ? error.message
            : "내 방 목록을 불러오지 못했습니다.";
        setHostRoomsError(message);
        setHostRooms([]);
      })
      .finally(() => {
        if (!ignore) {
          setHostRoomsLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [activeSection, canManageRooms, hostId, user?.id]);

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

  const handleCancel = () => {
    if (!user) return;
    setForm({
      nickname: user.nickname ?? "",
      address: user.address ?? "",
      phoneNumber: user.phoneNumber ?? "",
      lifeStyle: user.lifeStyle ?? "",
      hostIntroduction: user.hostIntroduction ?? "",
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateProfile(form);
      setIsEditing(false);
      alert("프로필이 업데이트되었어요.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "프로필을 저장하는 중 문제가 발생했어요.";
      alert(message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleLifestyle = (option: string) => {
    setLifeStyleSelections((prev) => {
      const has = prev.includes(option);
      const next = has ? prev.filter((item) => item !== option) : [...prev, option];
      setForm((prevForm) => ({
        ...prevForm,
        lifeStyle: next.join(", "),
      }));
      return next;
    });
  };

  type SidebarItemKey =
    | "profile"
    | "rooms"
    | "roommate"
    | "security"
    | "favorites"
    | "reservations";

  type SidebarItem = {
    key: SidebarItemKey;
    label: string;
    icon: ReactNode;
    badge?: ReactNode;
  };

  const sidebarMenu: SidebarItem[] = isHostView
    ? [
        { key: "profile" as const, label: "프로필 관리", icon: <PersonOutline /> },
        { key: "rooms" as const, label: "내 방 관리", icon: <HomeWork /> },
        { key: "roommate" as const, label: "룸메이트 신청", icon: <Group /> },
        { key: "security" as const, label: "보안 설정", icon: <SecurityOutlined /> },
      ]
    : [
        { key: "profile" as const, label: "프로필 관리", icon: <PersonOutline /> },
        { key: "favorites" as const, label: "찜한 방", icon: <FavoriteBorder /> },
        { key: "reservations" as const, label: "예약 내역", icon: <CalendarToday /> },
        { key: "security" as const, label: "보안 설정", icon: <SecurityOutlined /> },
      ];

  if (!user) {
    return (
      <Box minHeight="100vh" display="flex" flexDirection="column">
        <SiteHeader />
        <Box flex={1} display="grid" sx={{ placeItems: "center" }}>
          <Typography>로그인한 사용자만 접근할 수 있습니다.</Typography>
        </Box>
        <SiteFooter />
      </Box>
    );
  }

  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      sx={{ bgcolor: "#f4f6fb" }}
    >
      <SiteHeader />
      <Container maxWidth="lg" sx={{ flex: 1, py: { xs: 4, md: 8 } }}>
        <Grid container spacing={3} alignItems="stretch">
          <Grid xs={12} md={3}>
            <Paper
              elevation={3}
              sx={{
                borderRadius: 3,
                p: 3,
                display: "flex",
                flexDirection: "column",
                gap: 2.5,
                height: { xs: "auto", md: "100%" },
                position: "relative",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `linear-gradient(180deg, rgba(120,147,216,0.08), rgba(255,255,255,0.9)), url(${HERO_IMAGE})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  opacity: 0.18,
                  borderRadius: 3,
                }}
              />
              <Stack
                spacing={1.5}
                alignItems="center"
                sx={{ position: "relative" }}
              >
                <Avatar
                  sx={{
                    width: 84,
                    height: 84,
                    bgcolor: theme.palette.primary.light,
                    color: theme.palette.primary.main,
                    fontSize: 32,
                  }}
                >
                  {user.nickname?.slice(0, 1)?.toUpperCase() ??
                    user.username.slice(0, 1).toUpperCase()}
                </Avatar>
                <Stack spacing={0.5} alignItems="center">
                  <Typography variant="h6" fontWeight={700}>
                    {user.nickname || user.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {roleLabel}
                  </Typography>
                  {user.email && (
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  )}
                </Stack>
              </Stack>

              <Divider sx={{ position: "relative" }} />

              <List sx={{ p: 0, position: "relative" }}>
                {sidebarMenu.map((item) => {
                  const isActive = activeSection === item.key;
                  return (
                    <ListItemButton
                      key={item.label}
                      onClick={() => setActiveSection(item.key)}
                      selected={isActive}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        "&.Mui-selected": {
                          bgcolor: "rgba(55,126,255,0.12)",
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.label} />
                      {item.badge ? (
                        <Box
                          sx={{
                            bgcolor: "#ef4444",
                            color: "white",
                            borderRadius: "999px",
                            px: 1,
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {item.badge}
                        </Box>
                      ) : null}
                    </ListItemButton>
                  );
                })}
              </List>
            </Paper>
          </Grid>

          <Grid xs={12} md={9}>
            {activeSection === "profile" && (
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 12px 28px rgba(12,31,89,0.12)",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    bgcolor: "#f7f9ff",
                    px: { xs: 2.5, md: 3.5 },
                    py: 2.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h5" fontWeight={800}>
                      {isHostView ? "호스트 프로필 관리" : "게스트 프로필 관리"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      정보를 최신으로 업데이트하면 더 좋은 매칭을 도와줍니다.
                    </Typography>
                    {isAdmin && (
                      <Stack direction="row" spacing={1} mt={1}>
                        <Button
                          size="small"
                          variant={
                            adminView === "guest" ? "contained" : "outlined"
                          }
                          onClick={() => setAdminView("guest")}
                        >
                          게스트 보기
                        </Button>
                        <Button
                          size="small"
                          variant={
                            adminView === "host" ? "contained" : "outlined"
                          }
                          onClick={() => setAdminView("host")}
                        >
                          호스트 보기
                        </Button>
                      </Stack>
                    )}
                  </Box>
                  <Stack direction="row" spacing={1}>
                    {isEditing ? (
                      <>
                        <Button
                          variant="outlined"
                          onClick={handleCancel}
                          disabled={isSaving}
                        >
                          취소
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleSave}
                          disabled={isSaving}
                        >
                          {isSaving ? "저장 중..." : "저장"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outlined"
                          onClick={() => setIsEditing(true)}
                        >
                          수정하기
                        </Button>
                        <Button variant="text" color="inherit" onClick={logout}>
                          로그아웃
                        </Button>
                      </>
                    )}
                  </Stack>
                </Box>

                <CardContent
                  sx={{ p: { xs: 3, md: 4 }, display: "grid", gap: 3 }}
                >
                  <Grid container spacing={2.5}>
                    <Grid xs={12} sm={6}>
                      <TextField
                        label="아이디"
                        fullWidth
                        value={user.username}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <TextField
                        label="닉네임"
                        fullWidth
                        value={form.nickname}
                        onChange={handleChange("nickname")}
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <TextField
                        label="이메일"
                        fullWidth
                        value={user.email ?? ""}
                        placeholder="이메일 정보가 없습니다"
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <TextField
                        label="전화번호"
                        fullWidth
                        value={form.phoneNumber}
                        onChange={handleChange("phoneNumber")}
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid xs={12}>
                      <TextField
                        label="주소"
                        fullWidth
                        value={form.address}
                        onChange={handleChange("address")}
                        disabled={!isEditing}
                      />
                    </Grid>
                    {!isHostView && (
                      <Grid xs={12}>
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          gutterBottom
                        >
                          선호 생활 스타일
                        </Typography>
                        <Stack direction="row" gap={1} flexWrap="wrap">
                          {lifestyleOptions.map((option) => {
                            const selected =
                              lifeStyleSelections.includes(option);
                            return (
                              <Button
                                key={option}
                                size="small"
                                variant={selected ? "contained" : "outlined"}
                                color={selected ? "primary" : "inherit"}
                                disabled={!isEditing}
                                onClick={() => toggleLifestyle(option)}
                                sx={{
                                  borderRadius: 999,
                                  textTransform: "none",
                                }}
                              >
                                {option}
                              </Button>
                            );
                          })}
                        </Stack>
                      </Grid>
                    )}
                    <Grid xs={12}>
                      <TextField
                        label={isHostView ? "호스트 소개" : "자기소개"}
                        fullWidth
                        multiline
                        minRows={isHostView ? 3 : 4}
                        value={
                          isHostView ? form.hostIntroduction : form.lifeStyle
                        }
                        onChange={
                          isHostView
                            ? handleChange("hostIntroduction")
                            : handleChange("lifeStyle")
                        }
                        disabled={!isEditing}
                      />
                    </Grid>
                  </Grid>

                  {isHostView && (
                    <Box
                      sx={{
                        bgcolor: "#f5f8ff",
                        borderRadius: 2,
                        p: 2,
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "repeat(3, 1fr)",
                        },
                        gap: 2,
                      }}
                    >
                      {[
                        { label: "평점", value: "—", helper: "리뷰 집계 예정" },
                        {
                          label: "응답률",
                          value: "—",
                          helper: "문의 기록 수집 중",
                        },
                        {
                          label: "응답시간",
                          value: "—",
                          helper: "데이터 준비 중",
                        },
                      ].map((stat) => (
                        <Stack key={stat.label} spacing={0.5}>
                          <Typography variant="overline" color="text.secondary">
                            {stat.label}
                          </Typography>
                          <Typography
                            variant="h5"
                            fontWeight={800}
                            color="primary"
                          >
                            {stat.value}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {stat.helper}
                          </Typography>
                        </Stack>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}

            {activeSection === "favorites" && (
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 12px 28px rgba(12,31,89,0.12)",
                }}
              >
                <Box sx={{ px: 3, py: 2.5, bgcolor: "#f7f9ff" }}>
                  <Typography variant="h5" fontWeight={800}>
                    찜한 방
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    찜한 방을 확인하고 바로 이동해보세요.
                  </Typography>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  {favoriteLoading ? (
                    <Stack alignItems="center" py={4}>
                      <CircularProgress />
                    </Stack>
                  ) : favoriteError ? (
                    <Typography color="error">{favoriteError}</Typography>
                  ) : favoriteRooms.length === 0 ? (
                    <Typography color="text.secondary">
                      아직 찜한 방이 없습니다.
                    </Typography>
                  ) : (
                    <Stack spacing={2.5}>
                      {favoriteRooms.map((item) => (
                        <FavoriteRoomCard key={item.roomId} room={item} />
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            )}

            {activeSection === "security" && (
              <SectionPlaceholder
                title="보안 설정"
                description="비밀번호 변경, 로그인 알림 등 보안을 강화하는 영역입니다. 디자인 가이드를 반영해 곧 제공될 예정이에요."
              />
            )}
            {activeSection === "reservations" && !isHostView && (
              <SectionPlaceholder
                title="예약 내역"
                description="예약 내역이 이곳에 표시됩니다. 현재는 준비 중입니다."
              />
            )}
            {activeSection === "rooms" && isHostView && (
              <HostRoomsSection
                rooms={hostRooms}
                loading={hostRoomsLoading}
                error={hostRoomsError}
                canRegister={Boolean(canManageRooms && hostId)}
              />
            )}
            {activeSection === "roommate" && isHostView && (
              <SectionPlaceholder
                title="룸메이트 신청"
                description="호스트가 받은 룸메이트 신청을 관리하는 공간입니다. 곧 만나보실 수 있어요."
              />
            )}
          </Grid>
        </Grid>
      </Container>
      <SiteFooter />
    </Box>
  );
}


type HostRoomsSectionProps = {
  rooms: RoomSummary[];
  loading: boolean;
  error: string | null;
  canRegister: boolean;
};

function HostRoomsSection({ rooms, loading, error, canRegister }: HostRoomsSectionProps) {
  const statusLabel = (value: number | string) => {
    const numeric = typeof value === 'number' ? value : Number(value);
    if (numeric === 0) return { label: '모집중', color: 'success' as const };
    if (numeric === 1) return { label: '대기중', color: 'warning' as const };
    return { label: '마감', color: 'default' as const };
  };

  const formatCurrency = (amount?: number) => {
    if (typeof amount !== 'number' || Number.isNaN(amount)) return '-';
    return `${amount.toLocaleString()}원/월`;
  };

  return (
    <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0 12px 28px rgba(12,31,89,0.12)',
          overflow: 'hidden',
        }}
    >
      <Box
        sx={{
          bgcolor: '#f7f9ff',
          px: { xs: 2.5, md: 3.5 },
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
        >
          <Typography variant="h5" fontWeight={800}>
          내 방 관리
          </Typography>
          {canRegister && (
            <Button
              variant="contained"
              size="small"
              component={RouterLink}
              to="/list-room"
              sx={{ borderRadius: 2 }}
            >
            방 등록하기
            </Button>
          )}
        </Box>
        <CardContent sx={{ p: { xs: 3, md: 4 }, display: 'grid', gap: 2.5 }}>
          {loading ? (
            <Stack alignItems="center" py={3} spacing={1}>
              <CircularProgress />
              <Typography color="text.secondary">내 방 목록을 불러오는 중입니다.</Typography>
            </Stack>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : rooms.length === 0 ? (
            <Typography color="text.secondary">등록한 방이 없습니다.</Typography>
          ) : (
          <Stack spacing={2}>
            {rooms.map((room) => {
              const imageUrl = room.images?.[0]?.imageUrl;
              const status = statusLabel(room.availabilityStatus as number);
              return (
                <Card
                  key={room.id ?? room.roomId}
                  variant="outlined"
                  sx={{ borderRadius: 2, p: 2, boxShadow: '0 8px 16px rgba(12,31,89,0.08)' }}
                >
                  <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
                    <Box
                      sx={{
                        width: { xs: '100%', sm: 140 },
                        height: 100,
                        borderRadius: 2,
                        overflow: 'hidden',
                        bgcolor: '#f3f4f6',
                        flexShrink: 0,
                      }}
                    >
                      {imageUrl ? (
                        <Box
                          component="img"
                          src={imageUrl}
                          alt={room.title}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: '100%',
                            height: '100%',
                            display: 'grid',
                            placeItems: 'center',
                            color: 'text.secondary',
                            fontSize: 12,
                          }}
                        >
                          NO IMAGE
                        </Box>
                      )}
                    </Box>
                    <Stack spacing={1} flex={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={800}>
                          {room.title}
                        </Typography>
                        <Chip label={status.label} color={status.color} size="small" />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {room.address}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={700} color="primary">
                        {formatCurrency(room.rentPrice)}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          component={RouterLink}
                          to={`/rooms/${room.id ?? room.roomId}`}
                          sx={{ borderRadius: 999 }}
                        >
                          상세보기
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          component={RouterLink}
                          to={`/edit-room/${room.id ?? room.roomId}`}
                          sx={{ borderRadius: 999 }}
                        >
                          수정하기
                        </Button>
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

type FavoriteRoomCardProps = {
  room: FavoriteRoom;
};

function FavoriteRoomCard({ room }: FavoriteRoomCardProps) {
  const imageUrl = extractFavoriteImageUrl(room.roomImg);
  const likedAtLabel = room.likedAt ? new Date(room.likedAt).toLocaleDateString() : null;

  return (
    <Card
      sx={{
        display: "flex",
        alignItems: "stretch",
        gap: 2,
        borderRadius: 3,
        boxShadow: 2,
        overflow: "hidden",
      }}
    >
      {imageUrl ? (
        <CardMedia
          component="img"
          image={imageUrl}
          alt={room.roomName}
          sx={{ width: 140, height: "100%", objectFit: "cover" }}
        />
      ) : (
        <Box
          sx={{
            width: 140,
            bgcolor: "#f3f4f6",
            display: "grid",
            placeItems: "center",
            color: "text.secondary",
          }}
        >
          이미지 없음
        </Box>
      )}
      <Stack flex={1} justifyContent="space-between" sx={{ py: 2, pr: 2 }}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle1" fontWeight={700}>
            {room.roomName}
          </Typography>
          {likedAtLabel && (
            <Typography variant="caption" color="text.secondary">
              {likedAtLabel}에 찜한 방
            </Typography>
          )}
        </Stack>
        <CardActions sx={{ px: 0 }}>
          <Button
            size="small"
            variant="contained"
            component={RouterLink}
            to={room.roomId ? `/rooms/${room.roomId}` : "/rooms"}
            sx={{ borderRadius: 999, px: 2 }}
          >
            상세보기
          </Button>
        </CardActions>
      </Stack>
    </Card>
  );
}

type SectionPlaceholderProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

function SectionPlaceholder({ title, description, actionLabel, actionHref }: SectionPlaceholderProps) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0 12px 28px rgba(12,31,89,0.12)",
      }}
    >
      <Box sx={{ px: 3, py: 2.5, bgcolor: "#f7f9ff" }}>
        <Typography variant="h5" fontWeight={800}>
          {title}
        </Typography>
      </Box>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
        {actionLabel && actionHref && (
          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              component={RouterLink}
              to={actionHref}
              sx={{ borderRadius: 2 }}
            >
              {actionLabel}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

