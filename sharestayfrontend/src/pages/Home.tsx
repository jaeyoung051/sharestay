// src/pages/Home.tsx
import Grid from "@mui/material/Unstable_Grid2";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  // ChatBubbleOutline,
  LocationOn,
  Search as SearchIcon,
  SecurityOutlined,
  StarOutline,
} from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { api } from "../lib/api";
import type { ApiEnvelope, Roles } from "../auth/types";
import type { RoomApiResponse, RoomSummary } from "../types/room";
import { mapRoomFromApi } from "../types/room";
import type { DistrictSafety } from "../types/statistic";

const heroBackground =
  "https://firebasestorage.googleapis.com/v0/b/sharestay-4d2c6.firebasestorage.app/o/rooms%2Fnew-york-7577186_1280.jpg?alt=media&token=e16af7f6-5c8c-4045-bad7-681e46617c8c";

const navLinks = [
  { label: "방 찾기", href: "/rooms" },
  { label: "지도로 찾기", href: "/RoomMap" },
  { label: "이용방법", href: "/guide" },
  {
    label: "방 등록",
    href: "/list-room",
    requireRoles: ["HOST", "ADMIN"] as Roles[],
  },
];
const featureHighlights = [
  {
    icon: <SecurityOutlined fontSize="large" color="primary" />,
    title: "지역 안전도 분석",
    description:
      "범죄율, CCTV 밀도, 치안 상태 등 공공데이터를 기반으로 정확한 지역 안전 정보를 제공합니다.",
  },
  {
    icon: <LocationOn fontSize="large" color="primary" />,
    title: "룸메이트 매칭",
    description:
      "생활패턴, 성향, 선호도 분석 하에 나와 딱 맞는 룸메이트를 추천해드립니다.",
  },
  {
    icon: <StarOutline fontSize="large" color="primary" />,
    title: "신뢰도 기반 추천",
    description:
      "실제 리뷰 데이터와 평가 데이터를 종합한 개인화된 매물 추천으로 최적의 선택을 도와드립니다.",
  },
];

const formatCurrency = (amount?: number) => {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "-";
  return `${amount.toLocaleString()}원/월`;
};

const extractTags = (room: RoomSummary): string[] => {
  if (Array.isArray(room.tags) && room.tags.length > 0) return room.tags;
  if (Array.isArray(room.options)) return room.options;
  if (typeof room.options === "string") {
    return room.options
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const provinces = [
  { value: "서울", label: "서울" },
  { value: "경기", label: "경기" },
  { value: "인천", label: "인천" },
  { value: "대전", label: "대전" },
  { value: "세종", label: "세종" },
  { value: "충남", label: "충남" },
  { value: "충북", label: "충북" },
  { value: "광주", label: "광주" },
  { value: "전남", label: "전남" },
  { value: "전북", label: "전북" },
  { value: "대구", label: "대구" },
  { value: "경북", label: "경북" },
  { value: "부산", label: "부산" },
  { value: "울산", label: "울산" },
  { value: "경남", label: "경남" },
  { value: "강원", label: "강원" },
  { value: "제주", label: "제주" },
];

const provinceDistrictMap: Record<string, string[]> = {
  서울: ["종로구", "중구", "용산구", "성동구", "광진구", "동대문구", "중랑구", "성북구", "강북구", "도봉구", "노원구", "은평구", "서대문구", "마포구", "양천구", "강서구", "구로구", "금천구", "영등포구", "동작구", "관악구", "서초구", "강남구", "송파구", "강동구"],
  경기: ["수원시", "고양시", "용인시", "성남시", "부천시", "안산시", "안양시", "남양주시", "화성시", "평택시", "의정부시", "시흥시", "파주시", "김포시", "광주시", "광명시", "군포시", "하남시", "오산시", "양주시", "이천시", "구리시", "안성시", "포천시", "의왕시", "여주시", "동두천시"],
  인천: ["중구", "동구", "미추홀구", "연수구", "남동구", "부평구", "계양구", "서구", "강화군", "옹진군"],
  대전: ["동구", "서구", "유성구", "중구", "대덕구"],
  세종: ["세종시"],
  충남: ["천안시", "공주시", "보령시", "아산시", "서산시", "논산시", "계룡시", "당진시", "금산군", "부여군", "서천군", "청양군", "홍성군", "예산군", "태안군"],
  충북: ["청주시", "충주시", "제천시", "보은군", "옥천군", "영동군", "증평군", "진천군", "괴산군", "음성군", "단양군"],
  광주: ["동구", "서구", "남구", "북구", "광산구"],
  전남: ["목포시", "여수시", "순천시", "나주시", "광양시", "담양군", "곡성군", "구례군", "고흥군", "보성군", "화순군", "장흥군", "강진군", "해남군", "영암군", "무안군", "함평군", "영광군", "장성군", "완도군", "진도군", "신안군"],
  전북: ["전주시", "군산시", "익산시", "정읍시", "남원시", "김제시", "완주군", "진안군", "무주군", "장수군", "임실군", "순창군", "고창군", "부안군"],
  대구: ["중구", "동구", "서구", "남구", "북구", "수성구", "달서구", "달성군"],
  경북: ["포항시", "경주시", "김천시", "안동시", "구미시", "영주시", "영천시", "상주시", "문경시", "경산시", "의성군", "청송군", "영양군", "영덕군", "청도군", "고령군", "성주군", "칠곡군", "예천군", "봉화군", "울진군", "울릉군"],
  부산: ["중구", "서구", "동구", "영도구", "부산진구", "동래구", "남구", "북구", "해운대구", "사하구", "금정구", "연제구", "수영구", "사상구", "기장군"],
  울산: ["중구", "남구", "동구", "북구", "울주군"],
  경남: ["창원시", "진주시", "통영시", "사천시", "김해시", "밀양시", "거제시", "양산시", "의령군", "함안군", "창녕군", "고성군", "남해군", "하동군", "산청군", "함양군", "거창군", "합천군"],
  강원: ["춘천시", "원주시", "강릉시", "동해시", "태백시", "속초시", "삼척시", "홍천군", "횡성군", "영월군", "평창군", "정선군", "철원군", "화천군", "양구군", "인제군", "고성군", "양양군"],
  제주: ["제주시", "서귀포시"],
};

export default function Home() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [heroKeyword, setHeroKeyword] = useState("");
  const [heroRegion, setHeroRegion] = useState("");
  const [heroDistrict, setHeroDistrict] = useState("");
  const [popularRooms, setPopularRooms] = useState<RoomSummary[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState<string | null>(null);
  const [safetyStats, setSafetyStats] = useState<DistrictSafety[]>([]);
  const [safetyLoading, setSafetyLoading] = useState(false);
  const [safetyError, setSafetyError] = useState<string | null>(null);

  const districtOptions = useMemo(
    () => (heroRegion ? provinceDistrictMap[heroRegion] ?? [] : []),
    [heroRegion]
  );

  const userActions = useMemo(() => {
    if (isLoading) {
      return <Typography color="inherit">세션 확인 중...</Typography>;
    }

    if (!user) {
      return (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            variant="text"
            color="inherit"
            component={RouterLink}
            to="/login"
          >
            로그인
          </Button>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/signup"
            sx={{ backgroundColor: "#0c51ff", borderRadius: 999 }}
          >
            회원가입
          </Button>
        </Stack>
      );
    }

    return (
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: "primary.light",
            color: "primary.contrastText",
          }}
        >
          {user.nickname?.slice(0, 1)?.toUpperCase() ??
            user.email?.slice(0, 1)?.toUpperCase() ??
            "U"}
        </Avatar>
        <Typography variant="body2" color="inherit" fontWeight={600}>
          안녕하세요, {user.nickname ?? user.email ?? "회원"}님
        </Typography>
        <Button
          variant="text"
          color="inherit"
          component={RouterLink}
          to="/profile"
        >
          프로필
        </Button>
        {(user.roles?.includes("ADMIN") || user.role === "ADMIN") && (
          <Button
            variant="outlined"
            color="inherit"
            component={RouterLink}
            to="/admin"
          >
            Admin
          </Button>
        )}
        <Button variant="text" color="inherit" onClick={logout}>
          로그아웃
        </Button>
      </Stack>
    );
  }, [isLoading, logout, user]);

  const userRoles = user?.roles ?? (user?.role ? [user.role] : []);
  const allowedNavLinks = navLinks.filter(
    (link) =>
      !link.requireRoles ||
      link.requireRoles.some((role) => userRoles.includes(role))
  );
  const canManageRooms =
    userRoles.includes("HOST") || userRoles.includes("ADMIN");

  const fetchRecommendedRooms = async () => {
    setRoomsLoading(true);
    setRoomsError(null);
    try {
      const regionParam =
        [heroRegion, heroDistrict].filter(Boolean).join(" ") ||
        heroKeyword ||
        "서울";
      const { data } = await api.get<RoomApiResponse[]>(
        "/rooms/search",   // 여기 뒤에 simple을 지움
        { params: { region: regionParam } }
      );
      const list = Array.isArray(data)
        ? data.map(mapRoomFromApi).slice(0, 3)
        : [];
      setPopularRooms(list);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "추천 매물을 불러오지 못했습니다.";
      setRoomsError(message);
      setPopularRooms([]);
    } finally {
      setRoomsLoading(false);
    }
  };



  const fetchSafetyStats = async () => {
    setSafetyLoading(true);
    setSafetyError(null);
    try {
      const { data } = await api.get<ApiEnvelope<DistrictSafety[] | unknown[]>>(
        "/statistics/safety",
        { params: { limit: 3 } }
      );
      const rawList = Array.isArray(data.result) ? data.result : [];
      const normalized = rawList.map((item) => {
        const source = item as DistrictSafety & Record<string, unknown>;
        const district =
          (source.district as string) ??
          (source.statisticType as string) ??
          "알 수 없음";
        const safetyScoreRaw = Number(source.safetyScore ?? source.value ?? 0);
        const trustScoreRaw = Number(
          source.trustScore ?? source.trust_score ?? NaN
        );
        const activityScoreRaw = Number(
          source.activityScore ?? source.activity_score ?? NaN
        );
        const crimeRateValue =
          source.crimeRate ?? source.crime_rate ?? undefined;
        const cctvDensityValue =
          source.cctvDensity ?? source.cctv_density ?? undefined;

        return {
          district,
          safetyScore: Number.isNaN(safetyScoreRaw) ? 0 : safetyScoreRaw,
          trustScore: Number.isNaN(trustScoreRaw) ? undefined : trustScoreRaw,
          activityScore: Number.isNaN(activityScoreRaw)
            ? undefined
            : activityScoreRaw,
          crimeRate:
            typeof crimeRateValue === "number" ||
            typeof crimeRateValue === "string"
              ? crimeRateValue
              : undefined,
          cctvDensity:
            typeof cctvDensityValue === "number" ||
            typeof cctvDensityValue === "string"
              ? cctvDensityValue
              : undefined,
          trend: typeof source.trend === "string" ? source.trend : undefined,
          recordedAt:
            typeof source.recordedAt === "string"
              ? source.recordedAt
              : typeof source.recorded_at === "string"
              ? source.recorded_at
              : undefined,
        } satisfies DistrictSafety;
      });
      setSafetyStats(normalized);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "안전도 정보를 불러오지 못했습니다.";
      setSafetyError(message);
      setSafetyStats([]);
    } finally {
      setSafetyLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendedRooms();
    fetchSafetyStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleHeroSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (heroKeyword.trim()) params.set("keyword", heroKeyword.trim());
    const regionParam = [heroRegion, heroDistrict].filter(Boolean).join(" ");
    if (regionParam) params.set("region", regionParam);
    if (heroDistrict) params.set("district", heroDistrict);
    const query = params.toString();
    navigate(query ? `/rooms?${query}` : "/rooms");
  };

  return (
    <Box sx={{ bgcolor: "#f4f6fb" }}>
      <Box
        sx={{
          position: "relative",
          color: "common.white",
          backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${heroBackground})`,
          backgroundSize: "cover, cover",
          backgroundPosition: "center top, center",
          backgroundRepeat: "no-repeat, no-repeat",
          pt: { xs: 6, md: 8 },
          pb: { xs: 12, md: 18 },
        }}
      >
        {/* <SiteHeader /> */}
        <Container maxWidth="lg">
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ py: 3 }}
          >
            <Typography
              variant="h4"
              fontWeight={800}
              component={RouterLink}
              to="/"
              sx={{ color: "inherit", textDecoration: "none" }}
            >
              ShareStay+
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              spacing={{ xs: 2, md: 3 }}
              sx={{ display: { xs: "none", md: "flex" } }}
            >
              {allowedNavLinks.map((link) => (
                <Button
                  key={link.label}
                  component={RouterLink}
                  to={link.href}
                  color="inherit"
                  sx={{ fontWeight: 500 }}
                >
                  {link.label}
                </Button>
              ))}
            </Stack>
            {userActions}
          </Stack>

          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              gap: 1,
              flexWrap: "wrap",
              mb: 3,
            }}
          >
            {allowedNavLinks.map((link) => (
              <Chip
                key={link.label}
                label={link.label}
                component={RouterLink}
                to={link.href}
                clickable
                sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "inherit" }}
              />
            ))}
          </Box>

          <Grid container spacing={4} alignItems="center">
            <Grid xs={12} md={7}>
              <Stack spacing={3}>
                <Typography
                  variant="h3"
                  fontWeight={800}
                  sx={{ lineHeight: 1.2 }}
                >
                  안전하고 신뢰할 수 있는
                  <br />
                  룸메이트 매칭의 새로운 기준
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.85 }}>
                  지역 안전도와 활동성 데이터를 기반으로 한 스마트한 룸메이트
                  찾기 서비스
                </Typography>
                <Stack direction="row" spacing={1}>
                  {[
                    "#친절한 룸메이트",
                    "#안심방",
                    "#서울대입구",
                    "#강남역",
                  ].map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      sx={{
                        bgcolor: "rgba(255,255,255,0.15)",
                        color: "inherit",
                      }}
                    />
                  ))}
                </Stack>
              </Stack>
            </Grid>
            <Grid xs={12} md={5}>
              <Box
                component="form"
                onSubmit={handleHeroSearch}
                sx={{
                  bgcolor: "rgba(255,255,255,0.95)",
                  borderRadius: 3,
                  p: 3,
                  boxShadow: "0 20px 40px rgba(12, 31, 89, 0.35)",
                  color: "text.primary",
                }}
              >
                <Stack spacing={2.5}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    원하는 조건으로 룸메이트를 검색해보세요
                  </Typography>
                  <TextField
                    fullWidth
                    label="지역명 또는 역명을 입력해주세요"
                    placeholder="예: 홍대입구"
                    variant="outlined"
                    value={heroKeyword}
                    onChange={(event) => setHeroKeyword(event.target.value)}
                  />
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <TextField
                      select
                      fullWidth
                      label="지역 선택"
                      value={heroRegion}
                      onChange={(event) => {
                        setHeroRegion(event.target.value);
                        setHeroDistrict("");
                      }}
                    >
                      <MenuItem value="">
                        <em>지역 전체</em>
                      </MenuItem>
                      {provinces.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select
                      fullWidth
                      label="구/읍/면 선택"
                      value={heroDistrict}
                      onChange={(event) => setHeroDistrict(event.target.value)}
                      disabled={!heroRegion}
                    >
                      <MenuItem value="">
                        <em>전체</em>
                      </MenuItem>
                      {districtOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<SearchIcon />}
                    sx={{
                      backgroundColor: "#7893d8",
                      borderRadius: 2,
                      py: 1.5,
                      fontSize: "1rem",
                    }}
                  >
                    룸메이트 찾기
                  </Button>
                  {/* <Stack direction="row" spacing={1} alignItems="center">
                    <ChatBubbleOutline fontSize="small" color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      실시간 상담이 필요하신가요? 지금 문의하기
                    </Typography>
                  </Stack> */}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Stack spacing={8}>
          <Stack spacing={2} alignItems="center">
            <Typography variant="h4" fontWeight={800}>
              왜 ShareStay+를 선택해야 할까요?
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
              maxWidth={640}
            >
              단순한 룸메이트 찾기를 넘어, 데이터 기반의 신뢰할 수 있는 매칭을
              제공합니다.
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {featureHighlights.map((feature) => (
              <Grid xs={12} md={4} key={feature.title}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    boxShadow: "0 12px 32px rgba(15, 40, 105, 0.1)",
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Stack spacing={2}>
                      {feature.icon}
                      <Typography variant="h6" fontWeight={700}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Stack spacing={3}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              spacing={2}
              alignItems={{ xs: "flex-start", md: "center" }}
            >
              <Typography variant="h4" fontWeight={800}>
                이번 주 추천 룸메이트
              </Typography>
              <Button
                variant="outlined"
                endIcon={<SearchIcon />}
                sx={{ borderRadius: 999, px: 3 }}
                component={RouterLink}
                to="/rooms"
              >
                전체보기
              </Button>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              높은 신뢰도와 안전도를 자랑하는 인기 룸쉐어 매물들을 만나보세요.
            </Typography>
            {roomsError && (
              <Typography color="error" variant="body2">
                {roomsError}
              </Typography>
            )}
            {roomsLoading ? (
              <Box
                sx={{
                  display: "grid",
                  placeItems: "center",
                  minHeight: 200,
                }}
              >
                <CircularProgress />
              </Box>
            ) : popularRooms.length === 0 ? (
              <Card
                sx={{
                  p: 3,
                  borderRadius: 3,
                  textAlign: "center",
                  boxShadow: "0 12px 24px rgba(12,31,89,0.08)",
                }}
              >
                <Typography color="text.secondary">
                  추천 매물을 준비 중입니다. 곧 더 많은 정보를 제공해드릴게요!
                </Typography>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {popularRooms.map((room) => {
                  const imageUrl = room.images?.[0]?.imageUrl ?? null;
                  const tags = extractTags(room);
                  return (
                    <Grid xs={12} md={4} key={room.roomId}>
                      <Card
                        sx={{
                          height: "100%",
                          borderRadius: 3,
                          overflow: "hidden",
                          boxShadow: "0 20px 40px rgba(12, 31, 89, 0.1)",
                        }}
                      >
                        {imageUrl ? (
                          <Box
                            component="img"
                            src={imageUrl}
                            alt={room.title}
                            sx={{
                              width: "100%",
                              height: 200,
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: "100%",
                              height: 200,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: "rgba(12,31,89,0.08)",
                              color: "text.secondary",
                              fontSize: "0.875rem",
                              fontWeight: 600,
                            }}
                          >
                            No Data
                          </Box>
                        )}
                        <CardContent sx={{ p: 3, display: "grid", gap: 1.5 }}>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            {typeof room.safetyScore === "number" && (
                              <Chip
                                label={`안전도 ${Math.round(room.safetyScore)}`}
                                color="primary"
                                size="small"
                                sx={{ fontWeight: 600, borderRadius: 999 }}
                              />
                            )}
                            {typeof room.trustScore === "number" && (
                              <Chip
                                label={`신뢰도 ${Math.round(room.trustScore)}`}
                                color="success"
                                size="small"
                                sx={{ fontWeight: 600, borderRadius: 999 }}
                              />
                            )}
                          </Stack>
                          <Typography variant="h6" fontWeight={700}>
                            {room.title}
                          </Typography>
                          {room.address && (
                            <Typography variant="body2" color="text.secondary">
                              {room.address}
                            </Typography>
                          )}
                          <Typography variant="h6" color="primary">
                            {formatCurrency(room.rentPrice)}
                          </Typography>
                          {room.description && (
                            <Typography variant="body2" color="text.secondary">
                              {room.description}
                            </Typography>
                          )}
                          {tags.length > 0 && (
                            <Stack
                              direction="row"
                              spacing={1}
                              flexWrap="wrap"
                              gap={1}
                            >
                              {tags.slice(0, 4).map((tag) => (
                                <Chip key={tag} label={tag} size="small" />
                              ))}
                            </Stack>
                          )}
                          <Button
                            variant="outlined"
                            size="small"
                            component={RouterLink}
                            to={`/rooms?highlight=${room.roomId}`}
                            sx={{ mt: 1, borderRadius: 999 }}
                          >
                            자세히 보기
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Stack>

          <Stack spacing={3}>
            <Stack spacing={1.5} alignItems="center">
              <Typography variant="h4" fontWeight={800}>
                서울 주요 지역 안전도
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                maxWidth={520}
              >
                실시간 데이터를 기반으로 한 지역별 안전도와 활동성 정보를
                확인하세요.
              </Typography>
            </Stack>
            {safetyError && (
              <Typography color="error" textAlign="center" variant="body2">
                {safetyError}
              </Typography>
            )}
            {safetyLoading ? (
              <Box
                sx={{
                  display: "grid",
                  placeItems: "center",
                  minHeight: 200,
                }}
              >
                <CircularProgress />
              </Box>
            ) : safetyStats.length === 0 ? (
              <Card
                sx={{
                  p: 3,
                  borderRadius: 3,
                  textAlign: "center",
                  boxShadow: "0 12px 24px rgba(12,31,89,0.08)",
                }}
              >
                <Typography color="text.secondary">
                  안전도 데이터를 준비 중입니다. 곧 업데이트될 예정입니다.
                </Typography>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {safetyStats.map((district) => {
                  const safetyScore =
                    typeof district.safetyScore === "number"
                      ? Math.round(district.safetyScore)
                      : district.safetyScore;
                  const trustScore =
                    typeof district.trustScore === "number"
                      ? Math.round(district.trustScore)
                      : district.trustScore;
                  const activityScore =
                    typeof district.activityScore === "number"
                      ? Math.round(district.activityScore)
                      : district.activityScore;
                  return (
                    <Grid xs={12} md={4} key={district.district}>
                      <Card
                        sx={{
                          borderRadius: 3,
                          height: "100%",
                          boxShadow: "0 18px 36px rgba(12, 31, 89, 0.08)",
                        }}
                      >
                        <CardContent sx={{ p: 3, display: "grid", gap: 1.75 }}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Typography variant="h6" fontWeight={700}>
                              {district.district}
                            </Typography>
                            <Chip
                              label={`안전도 ${safetyScore ?? "-"}`}
                              color="primary"
                              size="small"
                            />
                          </Stack>
                          <Divider />
                          <Stack spacing={1}>
                            <Typography variant="body2" color="text.secondary">
                              신뢰도 지수:{" "}
                              <Typography
                                component="span"
                                color="text.primary"
                                fontWeight={600}
                              >
                                {trustScore ?? "-"}
                              </Typography>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              활동성 지수:{" "}
                              <Typography
                                component="span"
                                color="text.primary"
                                fontWeight={600}
                              >
                                {activityScore ?? "-"}
                              </Typography>
                            </Typography>
                            {district.crimeRate && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                범죄 발생률:{" "}
                                <Typography
                                  component="span"
                                  color="text.primary"
                                  fontWeight={600}
                                >
                                  {district.crimeRate}
                                </Typography>
                              </Typography>
                            )}
                            {district.cctvDensity && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                CCTV 밀도:{" "}
                                <Typography
                                  component="span"
                                  color="text.primary"
                                  fontWeight={600}
                                >
                                  {district.cctvDensity}
                                </Typography>
                              </Typography>
                            )}
                            {district.trend && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                최근 추세:{" "}
                                <Typography
                                  component="span"
                                  color="text.primary"
                                  fontWeight={600}
                                >
                                  {district.trend}
                                </Typography>
                              </Typography>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}

            <Box textAlign="center">
              <Button
                variant="outlined"
                sx={{ color: "#0c51ff", px: 4, borderRadius: 999 }}
                startIcon={<LocationOn />}
                component={RouterLink}
                to="/safety-map"
              >
                전체 지역 안전도 지도 보기
              </Button>
            </Box>
          </Stack>
        </Stack>
      </Container>

      <Box sx={{ bgcolor: "#7893d8", color: "common.white", py: 8 }}>
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
            spacing={3}
          >
            <Stack spacing={1}>
              <Typography variant="h4" fontWeight={800}>
                지금 바로 시작하세요!
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                안전하고 신뢰할 수 있는 룸메이트 매칭을 위해 ShareStay+와
                함께하세요.
              </Typography>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                variant="contained"
                color="inherit"
                sx={{ color: "#7893d8", borderRadius: 999, px: 3 }}
                component={RouterLink}
                to="/signup"
              >
                바로 회원가입
              </Button>
              {canManageRooms && (
                <Button
                  variant="outlined"
                  color="inherit"
                  sx={{
                    borderRadius: 999,
                    borderColor: "rgba(255,255,255,0.6)",
                    px: 3,
                  }}
                  component={RouterLink}
                  to="/list-room"
                >
                  룸메이트 모집하기
                </Button>
              )}
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Box sx={{ bgcolor: "#030b24", color: "rgba(255,255,255,0.75)", py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid xs={12} md={4}>
              <Stack spacing={2}>
                <Typography variant="h6" color="common.white" fontWeight={700}>
                  ShareStay+
                </Typography>
                <Typography variant="body2">
                  지역 안전도와 활동성 데이터를 기반한 신뢰할 수 있는 룸메이트
                  매칭 플랫폼입니다. 안심하고 함께할 룸메이트를 도와드립니다.
                </Typography>
                <Stack direction="row" spacing={1}>
                  {["facebook", "instagram", "twitter"].map((social) => (
                    <Chip
                      key={social}
                      label={social}
                      variant="outlined"
                      sx={{
                        borderColor: "rgba(255,255,255,0.2)",
                        color: "inherit",
                      }}
                    />
                  ))}
                </Stack>
              </Stack>
            </Grid>
            <Grid xs={12} md={8}>
              <Grid container spacing={3}>
                <Grid xs={12} sm={4}>
                  <Typography
                    variant="subtitle2"
                    color="common.white"
                    fontWeight={700}
                    gutterBottom
                  >
                    서비스
                  </Typography>
                  <Stack spacing={1} fontSize="0.875rem">
                    <Box component="a" href="/rooms" color="inherit">
                      룸메이트 찾기
                    </Box>
                    <Box component="a" href="/RoomMap" color="inherit">
                      지도로 찾기
                    </Box>
                    <Box component="a" href="/matching" color="inherit">
                      룸메이트 매칭
                    </Box>
                    <Box component="a" href="/profile" color="inherit">
                      마이페이지
                    </Box>
                  </Stack>
                </Grid>
                <Grid xs={12} sm={4}>
                  <Typography
                    variant="subtitle2"
                    color="common.white"
                    fontWeight={700}
                    gutterBottom
                  >
                    고객지원
                  </Typography>
                  <Stack spacing={1} fontSize="0.875rem">
                    <Box component="a" href="/faq" color="inherit">
                      자주 묻는 질문
                    </Box>
                    <Box component="a" href="/contact" color="inherit">
                      문의하기
                    </Box>
                    <Box component="a" href="/terms" color="inherit">
                      이용약관
                    </Box>
                    <Box component="a" href="/privacy" color="inherit">
                      개인정보처리방침
                    </Box>
                  </Stack>
                </Grid>
                <Grid xs={12} sm={4}>
                  <Typography
                    variant="subtitle2"
                    color="common.white"
                    fontWeight={700}
                    gutterBottom
                  >
                    회사소개
                  </Typography>
                  <Stack spacing={1} fontSize="0.875rem">
                    <Box component="a" href="/about" color="inherit">
                      회사 정보
                    </Box>
                    <Box component="a" href="/careers" color="inherit">
                      채용 정보
                    </Box>
                    <Box component="a" href="/press" color="inherit">
                      언론 보도
                    </Box>
                    <Box component="a" href="/partners" color="inherit">
                      제휴 문의
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.1)" }} />
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Typography variant="body2">
              © 2026 ShareStay+. All rights reserved.
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              Powered by Readdy
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
