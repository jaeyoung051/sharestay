import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
  Divider
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { api } from "../lib/api";
import type {
  RoomDetailApiResponse,
  RoomImage,
  RoomSummary,
} from "../types/room";
import { mapRoomFromApi, resolveRoomImageUrl } from "../types/room";
import fallbackImageSrc from "../img/no_img.jpg";
import ShareIcon from "@mui/icons-material/Share";
import SectionPaper from "../components/SectionPaper";
import FavoriteButton from "../components/FavoriteButton";
import { useAuth } from "../auth/useAuth";
import { fetchFavoriteRooms, toggleFavoriteRoom } from "../lib/favorites";
import { Avatar } from "@mui/material";
import PersonIcon from "@mui/icons-material/PersonOutline";
import VerifiedIcon from "@mui/icons-material/Verified";


import Grid from "@mui/material/Unstable_Grid2";

const fallbackImage = fallbackImageSrc;
const lifestyleOptionSet = new Set([
  "금연",
  "흡연",
  "조용한 생활",
  "사교적",
  "청소 자주",
  "요리 자주",
  "늦게 귀가",
  "일찍 기상",
  "운동 좋아함",
  "음악 감상",
  "게임",
  "독서",
]);

const facilityOptionSet = new Set([
  "에어컨",
  "냉장고",
  "세탁기",
  "인터넷",
  "와이파이",
  "엘리베이터",
  "TV",
  "침대",
  "책상",
  "보안시설",
  "주차장",
  "헬스장",
  "베란다",
  "반려동물 가능",
]);

export const ROOM_TYPES = [
  { value: "ONE_ROOM", label: "원룸" },
  { value: "TWO_ROOM", label: "투룸" },
  { value: "OFFICETEL", label: "오피스텔" },
  { value: "Apart", label: "아파트" }
] as const;

export const getRoomTypeLabel = (value: string) =>
  ROOM_TYPES.find((t) => t.value === value)?.label ?? value;


const parseDescriptionAndOptions = (
  description: string | null | undefined
): {
  main: string;
  lifestyle: string[];
  facilities: string[];
  others: string[];
} => {
  if (!description) {
    return { main: "", lifestyle: [], facilities: [], others: [] };
  }

  const lines = description.split(/\r?\n/);
  const optionIndex = lines.findIndex((line) =>
    line.trim().startsWith("선호 옵션")
  );

  if (optionIndex === -1) {
    return { main: description, lifestyle: [], facilities: [], others: [] };
  }

  const main = lines.slice(0, optionIndex).join("\n").trim();
  const optionLines = lines
    .slice(optionIndex + 1)
    .map((line) => line.replace(/^-\s*/, "").trim())
    .filter(Boolean);

  const lifestyle: string[] = [];
  const facilities: string[] = [];
  const others: string[] = [];

  optionLines.forEach((option) => {
    if (lifestyleOptionSet.has(option)) {
      lifestyle.push(option);
      return;
    }
    if (facilityOptionSet.has(option)) {
      facilities.push(option);
      return;
    }
    others.push(option);
  });

  return {
    main: main || description,
    lifestyle,
    facilities,
    others,
  };
};

// 월세/보증금 공통 "숫자 + 원"
const formatMoney = (amount?: number) => {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "-";
  return `${amount.toLocaleString()}원`;
};

// 월세용 (필요하면 /월 붙여서 쓸 수 있게)
const formatMonthly = (amount?: number) => {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "-";
  return `${amount.toLocaleString()}원`;
};

const toArray = (value?: string[] | string | null) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string" && item.trim().length > 0);
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

const genderLabel = (value?: string | null) => {
  switch (value) {
    case "male":
      return "남성 선호";
    case "female":
      return "여성 선호";
    case "any":
      return "성별 무관";
    case "":
    case null:
    case undefined:
      return "제한 없음";
    default:
      return value;
  }
};

const ageLabel = (value?: string | null) => {
  switch (value) {
    case "20대":
      return "20대";
    case "30대":
      return "30대";
    case "40대":
      return "40대";
    case "50대":
      return "50대 이상";
    case "":
    case null:
    case undefined:
      return "제한 없음";
    default:
      return value;
  }
};

export default function RoomDetail() {
  const { user } = useAuth(); // ⭐ 추가: 로그인 사용자 정보
  const [favorites, setFavorites] = useState<Set<number>>(new Set()); // ⭐ 추가

  const { roomId } = useParams<{ roomId: string }>();

  const [room, setRoom] = useState<RoomSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string>(fallbackImage);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isShareGenerating, setIsShareGenerating] = useState(false);

  const hostName = room?.hostNickname ?? "현재 룸메이트";


  const shareButtonLabel = useMemo(
    () => (shareLink ? "공유" : "공유 복사"),
    [shareLink]
  );

  const {
    main: mainDescription,
    lifestyle: parsedLifestyle,
    facilities: parsedFacilities,
    others: parsedOthers,
  } = useMemo(
    () => parseDescriptionAndOptions(room?.description),
    [room?.description]
  );

  const explicitLifestyle = useMemo(() => toArray(room?.lifestyle), [room?.lifestyle]);
  const explicitOptions = useMemo(() => toArray(room?.options), [room?.options]);

  const displayLifestyle = explicitLifestyle.length ? explicitLifestyle : parsedLifestyle;

  const displayFacilities = useMemo(() => {
  // options에 아무것도 없으면 description에서 파싱한 facilities를 사용
  if (explicitOptions.length === 0) return parsedFacilities;
  // options에 값이 있으면, 그 중에서 facilityOptionSet에 해당하는 것만 필터링
  return explicitOptions.filter((opt) => facilityOptionSet.has(opt));
}, [explicitOptions, parsedFacilities]);


  const displayOtherOptions = useMemo(() => {
    if (explicitOptions.length === 0) return parsedOthers;
    return explicitOptions.filter(
      (opt) => !facilityOptionSet.has(opt) && !lifestyleOptionSet.has(opt)
    );
  }, [explicitOptions, parsedOthers]);

  useEffect(() => {
    if (!roomId) {
      setError("잘못된 접근입니다.");
      setIsLoading(false);
      return;
    }

    const fetchRoom = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await api.get<RoomDetailApiResponse>(
          `/rooms/${roomId}`
        );

        const images: RoomImage[] =
          data.images?.map((img, index) => ({
            id: img.id ?? index,
            imageId: img.id ?? index,
            roomId: data.id,
            imageUrl: resolveRoomImageUrl(img.imageUrl) ?? fallbackImage,
          })) ??
          data.imageUrls?.map((url, index) => ({
            id: index,
            imageId: index,
            roomId: data.id,
            imageUrl: resolveRoomImageUrl(url) ?? fallbackImage,
          })) ??
          [];

        const mapped: RoomSummary = {
          ...mapRoomFromApi(data),  // <- 여기서 shareLinkUrl 포함
          images,
        };
        setRoom(mapped);
        setActiveImage(images[0]?.imageUrl ?? fallbackImage);
        console.log(images);

        // API에서 좋아요 여부 내려주면 즉시 반영
        if (mapped.isFavorite) {
          setFavorites((prev) => {
            const next = new Set(prev);
            next.add(mapped.roomId);
            return next;
          });
        }

        setShareLink(`${window.location.origin}/rooms/${data.id}`);

    } catch (err) {
    const message =
        err instanceof Error
          ? err.message
          : "방 정보를 불러오는 중 오류가 발생했습니다.";
      setError(message);
      setRoom(null);
    } finally {
      setIsLoading(false);
    }
  };

    fetchRoom();
  }, [roomId]);

    // ⭐ 추가: 로그인 되어 있으면 즐겨찾기 목록 불러오기
  useEffect(() => {
    if (!user?.id) return;

    const loadFavorites = async () => {
      const favList = await fetchFavoriteRooms(user.id);

      const next = new Set<number>();
      favList.forEach((f) => next.add(Number(f.roomId)));

      setFavorites(next);
    };

    loadFavorites();
  }, [user?.id]);


  // 수정: 공유 링크 생성 및 복사
const handleShareLink = async () => {
  // roomId 없어도 사실 복사엔 상관 없지만, 안전하게 체크
  if (!roomId) return;

  // 디버깅용 (브라우저 콘솔에서 확인)
  console.log(">>> shareLink state:", shareLink);
  console.log(">>> room.shareLinkUrl:", room?.shareLinkUrl);

  const link = shareLink;

  if (!link) {
    alert("공유 링크를 불러올 수 없습니다. 관리자에게 문의해 주세요.");
    return;
  }

  setIsShareGenerating(true);
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(link);
      alert("공유 링크가 클립보드에 복사되었습니다.");
    } else {
      window.prompt("이 링크를 복사해 주세요.", link);
    }
  } catch {
    window.prompt("이 링크를 복사해 주세요.", link);
  } finally {
    setIsShareGenerating(false);
  }
};


// ⭐ 챙ㄷ채추가: 좋아요 토글
const handleToggleFavorite = async () => {
  if (!user?.id) {
    alert("로그인이 필요합니다.");
    return;
  }

  const roomNum = Number(room?.roomId);
  if (!roomNum) return;

  if (isFavoriteLoading) return;

  const currentlyLiked =
    favorites.has(roomNum) || (room?.isFavorite ?? false);

  // UI 즉시 반영
  setFavorites((prev) => {
    const next = new Set(prev);
    currentlyLiked ? next.delete(roomNum) : next.add(roomNum);
    return next;
  });

  setRoom((prev) =>
    prev ? { ...prev, isFavorite: !currentlyLiked } : prev
  );

  // 서버 반영
  setIsFavoriteLoading(true);
  try {
    await toggleFavoriteRoom(user.id, roomNum);
  } catch (err) {
    console.error(err);
    alert("찜하기 처리 중 오류가 발생했습니다.");
    // 롤백
    setFavorites((prev) => {
      const next = new Set(prev);
      currentlyLiked ? next.add(roomNum) : next.delete(roomNum);
      return next;
    });
    setRoom((prev) =>
      prev ? { ...prev, isFavorite: currentlyLiked } : prev
    );
  } finally {
    setIsFavoriteLoading(false);
  }
};


const isLiked = room
  ? favorites.has(room.roomId) || room.isFavorite === true
  : false;

  return (
    <Box sx={{ bgcolor: "#f4f6fb", minHeight: "100vh" }}>
      <SiteHeader activePath="/rooms" />
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        {isLoading ? (
          <Stack alignItems="center" spacing={2} py={12}>
            <CircularProgress />
            <Typography color="text.secondary">
              방 정보를 불러오는 중입니다...
            </Typography>
          </Stack>
                ) : error ? (
          
          <Paper sx={{ p: { xs: 4, md: 6 }, borderRadius: 4 }}>
            ...
          </Paper>
        ) : room ? (
          <Grid
            container
            spacing={4}
            alignItems="flex-start"
          >
            {/* ========== LEFT : 메인 상세 영역 ========== */}
            <Grid xs={12} md={8}>
              <Stack spacing={3}>
                {/* 이미지 섹션 */}
                <Box
                  component="img"
                  src={activeImage}
                  alt={room.title}
                  sx={{
                    width: "100%",
                    height: 480,
                    objectFit: "cover",
                    borderRadius: 3,
                    bgcolor: "#e8ecf4",
                  }}
                />

                {room.images && room.images.length > 1 && (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {room.images.map((img) => {
                      const thumbnail = img.imageUrl ?? fallbackImage;
                      const key = img.id ?? img.imageId ?? thumbnail;
                      const isActive = activeImage === thumbnail;
                      return (
                        <Box
                          key={key}
                          component="img"
                          src={thumbnail}
                          alt={room.title}
                          onClick={() => setActiveImage(thumbnail)}
                          sx={{
                            width: 72,
                            height: 72,
                            objectFit: "cover",
                            borderRadius: 2,
                            border: isActive
                              ? "2px solid #0c51ff"
                              : "1px solid rgba(0,0,0,0.08)",
                            cursor: "pointer",
                          }}
                        />
                      );
                    })}
                  </Stack>
                )}

                {/* 제목 + 타입 + 상단 공유 버튼 */}
                <Stack spacing={1} mb={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="h4" fontWeight={800}>
                      {room.title}
                    </Typography>
                    <Chip
                      label={getRoomTypeLabel(room.type)}
                      color="primary"
                      sx={{ borderRadius: 999 }}
                    />
                    <FavoriteButton
                      roomId={room.roomId}
                      isLiked={isLiked}
                      loading={isFavoriteLoading}
                      onToggle={handleToggleFavorite}
                    />
                    
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleShareLink}
                      disabled={isShareGenerating}
                      sx={{ borderRadius: 999 }}
                      startIcon={<ShareIcon />}
                    >
                      {shareButtonLabel}
                    </Button>
                  </Stack>
                </Stack>

                {/* 방 정보 */}
                <SectionPaper title="방 정보">
                  <Stack
                    direction="row"
                    spacing={10}
                    flexWrap="wrap"
                    useFlexGap
                  >
                  {room.type !== undefined && room.type !== null && (
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        방 종류
                      </Typography>
                      <Typography fontWeight={700}>
                        {getRoomTypeLabel(room.type)}  {/* ⬅️ genderLabel 말고 이거! */}
                      </Typography>
                    </Box>
                  )}
                  {/* 면적, 층수 넣기 */}
                  </Stack>



                    {displayFacilities.length > 0 && (
                    <>
                      <Divider sx={{ my: 3 }} />

                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 700, mb: 1 }}
                      >
                        부가 옵션
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        {displayFacilities.map((item) => (
                          <Chip
                            key={item}
                            label={item}
                            sx={{
                              borderRadius: 999,
                              bgcolor: "rgba(0,0,0,0.03)",
                              // color: "primary.main",
                              fontWeight: 600,
                            }}
                          />
                        ))}
                      </Stack>
                    </>
                  )}

                </SectionPaper>

                {/* 룸메이트 조건 */}
                <SectionPaper title="룸메이트 조건">
                  <Stack
                    direction="row"
                    spacing={10}
                    flexWrap="wrap"
                    useFlexGap
                  >
                    {room.preferredGender !== undefined &&
                      room.preferredGender !== null && (
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}
                          >
                            선호 성별
                          </Typography>
                          <Typography fontWeight={700}>
                            {genderLabel(room.preferredGender)}
                          </Typography>
                        </Box>
                      )}

                    {room.preferredAge !== undefined &&
                      room.preferredAge !== null && (
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}
                          >
                            선호 연령
                          </Typography>
                          <Typography fontWeight={700}>
                            {ageLabel(room.preferredAge)}
                          </Typography>
                        </Box>
                      )}
                  </Stack>

                  {displayLifestyle.length > 0 && (
                    <>
                      <Divider sx={{ my: 3 }} />

                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 700, mb: 1 }}
                      >
                        선호 생활패턴
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        {displayLifestyle.map((item) => (
                          <Chip
                            key={item}
                            label={item}
                            sx={{
                              borderRadius: 999,
                              bgcolor: "rgba(12, 81, 255, 0.12)",
                              color: "primary.main",
                              fontWeight: 600,
                            }}
                          />
                        ))}
                      </Stack>
                    </>
                  )}
                </SectionPaper>

                <SectionPaper title="주소">
                  <Typography>{room.address}</Typography>
                </SectionPaper>

                {mainDescription && (
                  <SectionPaper title="상세 설명">
                    <Typography whiteSpace="pre-line">
                      {mainDescription}
                    </Typography>
                  </SectionPaper>
                )}

                <SectionPaper title="현재 룸메이트 정보">
  <Stack spacing={1.5}>
    <Stack direction="row" spacing={2} alignItems="center">
      <Avatar
        sx={{
          width: 64,
          height: 64,
          bgcolor: "rgba(25,118,210,0.08)",
          color: "primary.main",
        }}
      >
        <PersonIcon fontSize="large" />
      </Avatar>

      <Stack spacing={0.5}>
        <Typography variant="h6" fontWeight={800}>
          {hostName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          이 방의 호스트
        </Typography>
      </Stack>
    </Stack>

    {room.hostIntroduction ? (
      <Typography whiteSpace="pre-line" sx={{ mt: 1.5 }}>
        {room.hostIntroduction}
      </Typography>
    ) : (
      <Typography color="text.secondary" sx={{ mt: 1.5 }}>
        호스트 소개가 아직 등록되지 않았습니다.
      </Typography>
    )}
  </Stack>
</SectionPaper>



                <SectionPaper title="생활 규칙">
                  들어갈 예정입니다.
                </SectionPaper>

                



                <SectionPaper title="기타 옵션">
                  <PreferenceBox
                    title="기타 옵션"
                    items={displayOtherOptions}
                    chipColor="default"
                    gradient="linear-gradient(135deg, rgba(0,0,0,0.04), rgba(0,0,0,0.01))"
                  />
                </SectionPaper>
              </Stack>
            </Grid>

            {/* ========== RIGHT : sticky 요약 카드 ========== */}
            <Grid xs={12} md={4}
              sx={{
                position: { md: "sticky" }, // md 이상에서만 sticky 적용
                top: { md: 96 },            // 화면 상단에서 96px 아래에 붙도록
                alignSelf: "flex-start",    // 위쪽에 붙게 (세로 가운데 방지)
              }}>
              
            
              <Paper
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 4,
                  boxShadow: "0 24px 48px rgba(15, 40, 105, 0.12)",
                }}
              >
                <Stack spacing={3}>
                  {/* 가격 */}
                  <Box>
                    {/* 월세 + /월 : 같은 줄, /월은 작게 */}
                    <Stack direction="row" spacing={0.5} alignItems="baseline">
                      <Typography
                        variant="h4"        // 더 크게
                        color="primary"
                        fontWeight={800}
                      >
                        {formatMonthly(room.rentPrice)}
                      </Typography>
                      <Typography
                        variant="body2"     // 더 작게
                        color="text.secondary"
                      >
                        /월
                      </Typography>
                    </Stack>


                    {/* 여기에 보증금/관리비 등 있으면 추가 */}
                    <Stack spacing={0.5} sx={{ mt: 2 }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          보증금
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatMoney(room.deposit ?? 0)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>

                  <Divider />

                  {/* 룸메이트 조건 요약 */}
                  <Stack spacing={1}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 700 }}
                    >
                      룸메이트 조건
                    </Typography>
                    <Stack spacing={0.5}>
                      {room.preferredGender && (
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            성별
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {genderLabel(room.preferredGender)}
                          </Typography>
                        </Stack>
                      )}

                      {room.preferredAge && (
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            연령
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {ageLabel(room.preferredAge)}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </Stack>

                  {/* 버튼들 */}
                  <Stack spacing={1.5}>
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{ borderRadius: 999, py: 1.2 }}
                    >
                      룸메이트에게 연락하기
                    </Button>

                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{ borderRadius: 999, py: 1.2 }}
                    >
                      문의하기
                    </Button>

                    {/* <Button
                      fullWidth
                      variant="outlined"
                      onClick={handleShareLink}
                      disabled={isShareGenerating}
                      sx={{ borderRadius: 999, py: 1.2 }}
                      startIcon={<ShareIcon />}
                    >
                      {shareButtonLabel}
                    </Button> */}

                    <Button
                      fullWidth
                      variant="text"
                      component={RouterLink}
                      to="/rooms"
                    >
                      방 목록으로 돌아가기
                    </Button>
                  </Stack>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    안전한 거래를 위해 직접 만나서 확인하세요.
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        ) : null}

      </Container>
      <SiteFooter />
    </Box>
  );
}

function PreferenceBox({
  title,
  items,
  chipColor = "default",
  gradient,
}: {
  title: string;
  items: string[];
  chipColor?: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
  gradient?: string;
}) {
  if (!items || items.length === 0) return null;

  return (
    <Box
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 3,
        background: gradient ?? "rgba(0,0,0,0.02)",
        border: "1px solid rgba(0,0,0,0.05)",
      }}
    >
      <Stack spacing={1.5}>
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {items.map((item) => (
            <Chip
              key={item}
              label={item}
              color={chipColor}
              variant={chipColor === "default" ? "outlined" : "filled"}
              sx={{ borderRadius: 1.5, fontWeight: 600 }}
            />
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
