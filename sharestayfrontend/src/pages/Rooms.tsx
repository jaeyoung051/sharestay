// src/pages/Rooms.tsx  방검색
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardActionArea,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  GridView,
  ListAlt,
  LocationOn,
  Search,
} from "@mui/icons-material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Link as RouterLink,
  useSearchParams,
} from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import FavoriteButton from "../components/FavoriteButton";
import { api } from "../lib/api";
import { fetchFavoriteRooms, toggleFavoriteRoom } from "../lib/favorites";
import type { RoomApiResponse, RoomSummary } from "../types/room";
import { mapRoomFromApi } from "../types/room";
import fallbackImageSrc from "../img/no_img.jpg";
// ✅ 1) Grid는 따로 디폴트 import
import Grid from "@mui/material/Unstable_Grid2";
// 칩 심는 거 해야함

const filterFacilities = [
  
  "침대",
  "책상",
  "에어컨",
  "냉장고",
  "세탁기",
  "인터넷",
  "주차장",
  "헬스장",
  "베란다",
  "와이파이",
  "TV",
  "엘리베이터",
  "보안시설",
  "반려동물 가능",
];

// 지역(광역) > 시/군/구 계층형 데이터
const provinces = [
  // { value: "", label: "지역 선택" },
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
  인천: ["중구", "동구", "미추홀구", "연수구", "남동구", "부평구", "계양구", "서구", "강화군", "옹진군",],
  대전: ["동구", "서구", "유성구", "중구", "대덕구"],
  세종: ["세종시"],
  충남: ["천안시", "공주시", "보령시", "아산시", "서산시" ,"논산시", "계룡시", "당진시", "금산군", "부여군", "서천군", "청양군", "홍성군", "예산군", "태안군"],
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

// 일단 무조건 한글로 맞추기
const roomTypes = [
  { value: "", label: "방 전체 종류" },
  { value: "원룸", label: "원룸" },
  { value: "투룸", label: "투룸" },
  { value: "오피스텔", label: "오피스텔" },
  { value: "아파트", label: "아파트" },
];

const fallbackImage = fallbackImageSrc;

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



const ensureArray = <T,>(value: T | T[]): T[] =>
  Array.isArray(value) ? value : [value];

const availabilityLabel = (status: RoomSummary["availabilityStatus"]) => {
  if (typeof status === "number") {
    if (status === 0) return "모집중";
    if (status === 1) return "예약중";
    if (status === 2) return "마감"; 
    return "오류";
  }
  if (typeof status === "string") {
    switch (status.toUpperCase()) {
      case "AVAILABLE":
        return "모집중";
      case "PENDING":
        return "예약중";
      default:
        return "마감";
    }
  }
  return "모집중";
};

const getRoomId = (room: RoomSummary) => {
  const raw = room.roomId ?? room.id;
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
};

const isClosedStatus = (status: RoomSummary["availabilityStatus"]) => {
  if (typeof status === "number") return status >= 2;
  if (typeof status === "string") {
    const upper = status.toUpperCase();
    return upper !== "AVAILABLE" && upper !== "PENDING";
  }
  return false;
};

const sortRoomsForDisplay = (list: RoomSummary[]) =>
  [...list].sort((a, b) => {
    const aClosed = isClosedStatus(a.availabilityStatus);
    const bClosed = isClosedStatus(b.availabilityStatus);
    if (aClosed !== bClosed) return aClosed ? 1 : -1; // 마감은 뒤로

    const aId = getRoomId(a) ?? -Infinity;
    const bId = getRoomId(b) ?? -Infinity;
    if (aId !== bId) return bId - aId; // id가 큰(최근) 순서대로

    return 0;
  });

type RoomSearchOverrides = {
  keyword?: string;
  region?: string;
  district?: string;
  roomType?: string;
  priceRange?: number[];
  useSearchEndpoint?: boolean;   // ⭐ 추가: /rooms vs /rooms/search 구분용
  facility?: string[];   // 중복 검색을 위해서 string에서 string[] 로 변경
};

export default function Rooms() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightParam = searchParams.get("highlight");
  const highlightedRoomId = (() => {
    if (!highlightParam) return null;
    const parsed = Number(highlightParam);
    return Number.isNaN(parsed) ? null : parsed;
  })();
  const highlightedCardRef = useRef<HTMLDivElement | null>(null);
  const defaultPriceRange: [number, number] = [0, 5000000];
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [roomType, setRoomType] = useState("");
  const [priceRange, setPriceRange] = useState<number[]>(defaultPriceRange);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  // ⭐ 추가: 현재 선택된 편의시설 (없으면 빈 문자열)
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);

  const priceLabel = useMemo(
    () =>
      `${priceRange[0].toLocaleString()}원 ~ ${priceRange[1].toLocaleString()}원`,
    [priceRange]
  );

  const districtOptions = useMemo(() => {
    return region ? provinceDistrictMap[region] ?? [] : [];
  }, [region]);

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(rooms.length / pageSize));
  const pageWindowSize = 10;
  const pageWindowStart = useMemo(
    () => Math.floor((currentPage - 1) / pageWindowSize) * pageWindowSize + 1,
    [currentPage]
  );
  const pageWindowEnd = useMemo(
    () => Math.min(totalPages, pageWindowStart + pageWindowSize - 1),
    [pageWindowStart, totalPages]
  );
  const pageNumbers = useMemo(
    () =>
      Array.from(
        { length: pageWindowEnd - pageWindowStart + 1 },
        (_, index) => pageWindowStart + index
      ),
    [pageWindowEnd, pageWindowStart]
  );
  const paginatedRooms = useMemo(
    () =>
      rooms.slice(
        (currentPage - 1) * pageSize,
        (currentPage - 1) * pageSize + pageSize
      ),
    [rooms, currentPage]
  );

  const fetchRooms = useCallback(async (overrides?: RoomSearchOverrides) => {
    setIsLoading(true);
    setError(null);
    try {
      const keywordValue = overrides?.keyword ?? keyword;
      const regionValue = overrides?.region ?? region;
      const districtValue = overrides?.district ?? district;
      const roomTypeValue = overrides?.roomType ?? roomType;
      const priceRangeValue = overrides?.priceRange ?? priceRange;
      const [minPrice, maxPrice] = priceRangeValue;
      
      const facilityValue =
        overrides?.facility ?? selectedFacilities; // string[] 
      const hasFacility = facilityValue.length > 0;

      const hasCustomPriceRange =
        priceRangeValue[0] !== defaultPriceRange[0] ||
        priceRangeValue[1] !== defaultPriceRange[1];

      // 🔥 서버에는 "한 개만" option 으로 보내고, 나머지는 프론트에서 필터링
      const optionParam =
        hasFacility && facilityValue.length === 1
          ? facilityValue[0] // 서버 검색에 사용
          : keywordValue && keywordValue.trim().length > 0
          ? keywordValue
          : undefined;

      const hasAnyFilter =
        (regionValue && regionValue.trim().length > 0) ||
        (districtValue && districtValue.trim().length > 0) ||
        (roomTypeValue && roomTypeValue.trim().length > 0) ||
        (keywordValue && keywordValue.trim().length > 0) ||
        hasFacility ||
        hasCustomPriceRange;

      let data: RoomApiResponse[] = [];

      if (!hasAnyFilter) {
        const res = await api.get<RoomApiResponse[]>("/rooms");
        data = res.data;
      } else {
        const res = await api.get<RoomApiResponse[]>("/rooms/search", {
          params: {
            region: regionValue || undefined,
            district: districtValue || undefined,
            type: roomTypeValue || undefined,
            minPrice:
              hasCustomPriceRange && Number.isFinite(minPrice)
                ? minPrice
                : undefined,
            maxPrice:
              hasCustomPriceRange && Number.isFinite(maxPrice)
                ? maxPrice
                : undefined,
            option: optionParam,
          },
        });
        data = res.data;
      }

      const list = Array.isArray(data) ? data.map(mapRoomFromApi) : [];
      let normalized = list.map((room) => {
        const roomId = getRoomId(room);
        return {
          ...room,
          isFavorite: roomId ? favorites.has(roomId) : false,
        };
      });

      // 🔥 프론트에서 "모든 선택된 편의시설을 포함" 하는지 필터링
      if (hasFacility) {
        normalized = normalized.filter((room) => {
          // RoomSummary.options 를 배열로 변환
          const opts: string[] = Array.isArray(room.options)
            ? room.options
            : typeof room.options === "string"
            ? room.options
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [];

          // 선택된 모든 시설이 포함되어야 통과
          return facilityValue.every((f) => opts.includes(f));
        });
      }

      setRooms(sortRoomsForDisplay(normalized));

      setCurrentPage(1);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "방 정보를 불러오는 중 오류가 발생했습니다.";
      setError(message);
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  }, [keyword, region, district, roomType, priceRange, selectedFacilities, favorites]);

  useEffect(() => {
    const initialKeyword = searchParams.get("keyword") ?? "";
    const initialRegionParam = searchParams.get("region") ?? "";
    const initialDistrictParam = searchParams.get("district") ?? "";
    const initialRegion = initialRegionParam || "";
    const initialDistrict = initialDistrictParam || "";
    const initialType = searchParams.get("type") ?? "";
    const minParam = searchParams.get("minPrice");
    const maxParam = searchParams.get("maxPrice");
    const parsedMin = minParam ? Number(minParam) : NaN;
    const parsedMax = maxParam ? Number(maxParam) : NaN;
    const hasCustomRange = !Number.isNaN(parsedMin) && !Number.isNaN(parsedMax);
    const nextRange = hasCustomRange ? [parsedMin, parsedMax] : undefined;

    if (initialKeyword) setKeyword(initialKeyword);
    if (initialRegion) setRegion(initialRegion);
    if (initialDistrict) setDistrict(initialDistrict);
    if (initialType) setRoomType(initialType);
    if (nextRange) setPriceRange(nextRange);

    fetchRooms({
      keyword: initialKeyword || undefined,
      region: initialRegion || undefined,
      district: initialDistrict || undefined,
      roomType: initialType || undefined,
      priceRange: nextRange,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!highlightedRoomId) return;
    const timer = window.setTimeout(() => {
      highlightedCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [rooms, highlightedRoomId]);

  useEffect(() => {
    if (!highlightedRoomId) return;
    const index = rooms.findIndex((room) => getRoomId(room) === highlightedRoomId);
    if (index === -1) return;
    const pageOfHighlighted = Math.floor(index / pageSize) + 1;
    setCurrentPage(pageOfHighlighted);
  }, [rooms, highlightedRoomId, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleSearch = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("keyword", keyword.trim());
    if (region) params.set("region", region);
    if (district) params.set("district", district);
    if (roomType) params.set("type", roomType);
    if (
      priceRange[0] !== defaultPriceRange[0] ||
      priceRange[1] !== defaultPriceRange[1]
    ) {
      params.set("minPrice", String(priceRange[0]));
      params.set("maxPrice", String(priceRange[1]));
    }
    if (params.toString()) setSearchParams(params, { replace: true });
    else setSearchParams({}, { replace: true });
    await fetchRooms();
  };

    // 왼쪽 필터바 "방 종류" 버튼 클릭 핸들러
  const handleFilterTypeClick = async (clickedType: string) => {
    // "전체" 버튼이면 필터 해제 -> 빈 문자열
    const nextType = clickedType === "전체" ? "" : clickedType;

    // 상태 업데이트
    setRoomType(nextType);

    // URL 쿼리스트링도 같이 맞춰주기 (위 검색창이랑 동일 로직)
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("keyword", keyword.trim());
    if (region) params.set("region", region);
    if (district) params.set("district", district);
    if (nextType) params.set("type", nextType);
    if (
      priceRange[0] !== defaultPriceRange[0] ||
      priceRange[1] !== defaultPriceRange[1]
    ) {
      params.set("minPrice", String(priceRange[0]));
      params.set("maxPrice", String(priceRange[1]));
    }

    if (params.toString()) setSearchParams(params, { replace: true });
    else setSearchParams({}, { replace: true });

    // 실제 방 목록 다시 가져오기
    await fetchRooms({
      roomType: nextType,
    });
  };

// ⭐ 추가: 왼쪽 필터바 "편의시설" 칩 클릭 핸들러
  const handleFacilityClick = async (facility: string) => {
    // 같은 칩을 한 번 더 누르면 해제
    // const nextFacility = selectedFacility === facility ? "" : facility;

    const nextFacilities = selectedFacilities.includes(facility)
    ? selectedFacilities.filter((f) => f !== facility)
    : [...selectedFacilities, facility];

    setSelectedFacilities(nextFacilities);

    

    const params = new URLSearchParams();
    if (keyword.trim()) params.set("keyword", keyword.trim());
    if (region) params.set("region", region);
    if (district) params.set("district", district);
    if (roomType) params.set("type", roomType);
    if (
      priceRange[0] !== defaultPriceRange[0] ||
      priceRange[1] !== defaultPriceRange[1]
    ) {
      params.set("minPrice", String(priceRange[0]));
      params.set("maxPrice", String(priceRange[1]));
    }
    if (nextFacilities.length === 1) {
    params.set("option", nextFacilities[0]);
    } else {
      params.delete("option");
    }

    if (params.toString()) setSearchParams(params, { replace: true });
    else setSearchParams({}, { replace: true });

    // 실제 목록 다시 조회 (facility override만 넘기면 나머지는 현재 state 사용)
    await fetchRooms({
      facility: nextFacilities,
    });
  };


  const loadFavorites = useCallback(async () => {
    if (!user?.id) {
      setFavorites(new Set());
      setRooms((prev) => prev.map((room) => ({ ...room, isFavorite: false })));
      return;
    }
    try {
      const favoriteRooms = await fetchFavoriteRooms(user.id);
      const next = new Set<number>();
      favoriteRooms.forEach((item) => {
        const id = Number(item.roomId);
        if (Number.isFinite(id)) next.add(id);
      });
      setFavorites(next);
      setRooms((prev) =>
        prev.map((room) => {
          const roomId = getRoomId(room);
          return roomId ? { ...room, isFavorite: next.has(roomId) } : room;
        })
      );
    } catch (error) {
      console.error("Failed to load favorites", error);
    }
  }, [user?.id]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const toggleFavorite = async (room: RoomSummary) => {
    const roomId = getRoomId(room);
    // if (!roomId) return;
    if (!user?.id) {
      alert("로그인이 필요한 기능입니다.");
      return;
    }

    // 호스트 로그인 차단
    if (user.role === "HOST" || user.roles?.includes("HOST")) {
      alert("게스트로 로그인해 주세요.");
      return;
    }
    // const currentlyFavorite = favorites.has(roomId);
    // 여기 두 줄이 추가된 부분임. 나중에 재수정할 수도 있음.
    if (!roomId) return;
    const currentlyFavorite = favorites.has(roomId); // user.id 체크 후 roomId 체크
    setFavorites((prev) => {
      const next = new Set(prev);
      if (currentlyFavorite) {
        next.delete(roomId);
      } else {
        next.add(roomId);
      }
      return next;
    });
    setRooms((prev) =>
      prev.map((item) =>
        getRoomId(item) === roomId
          ? { ...item, isFavorite: !currentlyFavorite }
          : item
      )
    );
    try {
      await toggleFavoriteRoom(user.id, roomId);
      await loadFavorites();
    } catch (error: any) {
      const status = error?.response?.status;
      const message =
        error?.response?.data?.message ||
        (status ? `요청 실패 (status: ${status})` : "찜하기 요청에 실패했습니다.");
      console.error("Failed to toggle favorite", error);
      setFavorites((prev) => {
        const next = new Set(prev);
        if (currentlyFavorite) {
          next.add(roomId);
        } else {
          next.delete(roomId);
        }
        return next;
      });
      setRooms((prev) =>
        prev.map((item) =>
          getRoomId(item) === roomId
            ? { ...item, isFavorite: currentlyFavorite }
            : item
        )
      );
      alert(message);
    }
  };

  const handleShareLink = async (room: RoomSummary) => {
    const link = room.shareLinkUrl;

    if (!link) {
      alert("공유 링크가 준비되지 않았습니다. 관리자에게 문의해 주세요.");
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
        alert(`공유 링크가 클립보드에 복사되었습니다.`);  // \n${link}
      } else {
        // 구형 브라우저 대비
        window.prompt("이 링크를 복사해 주세요.", link);
      }
    } catch {
      window.prompt("이 링크를 복사해 주세요.", link);
    }
  };

  return (
    <Box sx={{ bgcolor: "#f4f6fb", minHeight: "100vh" }}>
      <SiteHeader activePath="/rooms" />
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Stack spacing={3}>
          <Paper
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              boxShadow: "0 24px 40px rgba(15, 40, 105, 0.12)",
            }}
          >
            <Box component="form" onSubmit={handleSearch}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", md: "center" }}
              >
                <TextField
                  fullWidth
                  label="지역명 또는 역명을 입력하세요"
                  placeholder="예: 강남역, 홍대입구"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  // 옆에 드롭다운이랑 둥글기 Radius 맞춘다고 추가
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                />
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={1}
                  sx={{ minWidth: { md: 320 }, maxWidth: { xs: "100%", md: 360 } }}
                >
                  <Select
                    value={region}
                    displayEmpty
                    onChange={(event) => {
                      const value = event.target.value as string;
                      setRegion(value);
                      setDistrict("");
                    }}
                    sx={{ minWidth: 140, borderRadius: 3, flex: 1 }}
                  >
                    <MenuItem value="">
                      지역 전체
                    </MenuItem>
                    {provinces.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <Select
                    value={district}
                    displayEmpty
                    disabled={!region}
                    onChange={(event) => setDistrict(event.target.value as string)}
                    sx={{ minWidth: 140, borderRadius: 3, flex: 1 }}
                  >
                    <MenuItem value="">
                      구/읍/면 전체
                    </MenuItem>
                    {districtOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </Stack>
                <Select
                  value={roomType}
                  onChange={(event) =>
                    setRoomType(event.target.value as string)
                  }
                  sx={{ minWidth: 160, borderRadius: 3 }}
                  displayEmpty
                >
                  {roomTypes.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </Select>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Search />}
                  sx={{
                    borderRadius: 3,
                    px: { xs: 3, md: 4 },
                    height: 56,
                    minWidth: 100,
                    gap: 1,
                    alignItems: "center",
                    whiteSpace: "nowrap",
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? "검색 중..." : "검색"}
                </Button>
              </Stack>
            </Box>
          </Paper>

          <Grid container spacing={4}>
            <Grid xs={12} md={3}>
              <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                boxShadow: "0 18px 32px rgba(15, 40, 105, 0.08)",
              }}
              >
              <Stack spacing={3}>
                <Typography variant="h6" fontWeight={700}>
                필터
                </Typography>
                <Divider />

                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    방 종류
                  </Typography>
                  {["전체", "원룸", "투룸", "오피스텔", "아파트"].map((typeLabel) => {
                    // "전체"는 roomType === "" 일 때 선택된 상태
                    const isSelected =
                      (typeLabel === "전체" && !roomType) || roomType === typeLabel;

                    return (
                      <Button
                        key={typeLabel}
                        variant={isSelected ? "contained" : "text"}
                        sx={{ justifyContent: "flex-start", borderRadius: 2 }}
                        onClick={() => handleFilterTypeClick(typeLabel)}
                      >
                        {typeLabel}
                      </Button>
                    );
                  })}
                </Stack>


                <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  가격 범위
                </Typography>
                <Slider
                  value={priceRange}
                  min={200000}
                  max={2000000}
                  step={50000}
                  valueLabelDisplay="auto"
                  onChange={(_, value) =>
                  setPriceRange(ensureArray(value as number[]))
                  }
                  onChangeCommitted={() => fetchRooms()}
                />
                <Typography variant="caption" color="text.secondary">
                  {priceLabel}
                </Typography>
                </Stack>
                                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    부가옵션
                  </Typography>
                  <Stack
                    spacing={1}
                    flexWrap="wrap"
                    direction="row"
                    useFlexGap
                  >
                    {filterFacilities.map((facility) => {
                      const isSelected = selectedFacilities.includes(facility); // 🔥 변경
                      return (
                        <Chip
                          key={facility}
                          label={facility}
                          clickable
                          onClick={() => handleFacilityClick(facility)}
                          variant={isSelected ? "filled" : "outlined"}
                          color={isSelected ? "primary" : "default"}
                          sx={{ borderRadius: 2 }}
                        />
                      );
                    })}
                  </Stack>
                </Stack>
              </Stack>
              </Paper>
            </Grid>
            <Grid xs={12} md={9}>
              <Stack spacing={3}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={2}
                >
                  <Stack spacing={0.5}>
                    <Typography variant="h6" fontWeight={700}>
                      검색 결과
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {rooms.length}개의 매물을 찾았습니다
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Select
                      defaultValue="추천순"
                      size="small"
                      sx={{ borderRadius: 999 }}
                    >
                      <MenuItem value="추천순">추천순</MenuItem>
                      <MenuItem value="가격낮은순">가격 낮은 순</MenuItem>
                      <MenuItem value="가격높은순">가격 높은 순</MenuItem>
                    </Select>
                    <IconButton>
                      <GridView />
                    </IconButton>
                    <IconButton>
                      <ListAlt />
                    </IconButton>
                  </Stack>
                </Stack>

                {error && (
                  <Paper sx={{ p: 3, borderRadius: 3, bgcolor: "#fff5f5" }}>
                    <Typography color="error">{error}</Typography>
                  </Paper>
                )}

                {isLoading ? (
                  <Box
                    sx={{
                      display: "grid",
                      placeItems: "center",
                      minHeight: 240,
                    }}
                  >
                    <CircularProgress />
                  </Box>
                ) : rooms.length === 0 ? (
                  <Paper sx={{ p: 4, borderRadius: 3 }}>
                    <Typography color="text.secondary" textAlign="center">
                      표시할 매물이 없습니다. 검색 조건을 변경해보세요.
                    </Typography>
                  </Paper>
                ) : (
                  <Grid container spacing={3}>
                    {paginatedRooms.map((room) => {
                      const roomId = getRoomId(room);
                      const isFavorite = roomId ? favorites.has(roomId) : false;
                      const isHighlighted =
                        roomId !== null && highlightedRoomId === roomId;
                      const tags = extractTags(room);
                      const imageUrl =
                        room.images?.[0]?.imageUrl ?? fallbackImage;
                      return (
                        <Grid
                          xs={12}
                          sm={6}
                          key={roomId ?? `${room.title}-${room.address}`}
                          ref={isHighlighted ? highlightedCardRef : undefined}
                        >
                          <Card
                            sx={{
                              borderRadius: 4,
                              overflow: "hidden",
                              boxShadow: isHighlighted
                                ? "0 0 0 2px #0c51ff, 0 24px 48px rgba(12, 81, 255, 0.2)"
                                : "0 20px 40px rgba(15, 40, 105, 0.12)",
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              transition: "box-shadow 0.2s ease, transform 0.2s ease",
                              "&:hover": {
                                boxShadow:
                                  "0 0 0 2px #0c51ff, 0 30px 60px rgba(12, 81, 255, 0.25)",
                                transform: "translateY(-4px)",       // ⭐ 살짝 떠오르는 효과
                              },
                            }}
                          >
                            {/* 🔹 카드 전체를 클릭하면 상세로 가게 하는 부분 */}
                            <CardActionArea
                              component={RouterLink}
                              to={roomId ? `/rooms/${roomId}` : "/rooms"}
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "stretch",
                                height: "100%",
                              }}
                            >   
                            {/* ⭐️ 추가된 부분 */}
                              <Box
                                component="img"
                                src={imageUrl}
                                alt={room.title}
                                sx={{
                                  height: 200,
                                  width: "100%",
                                  objectFit: "cover",
                                }}
                              />

                              {/* 🔹 원래 CardActionArea 밖에 있던 내용 전부 여기로 옮김 */}
                            <CardContent sx={{ display: "grid", gap: 1.5, flexGrow: 1 }}>
                              <Stack direction="row" spacing={1}>
                              {typeof room.safetyScore === "number" && (
                                <Chip
                                  label={`안전도 ${Math.round(room.safetyScore)}`}
                                  color="primary"
                                  size="small"
                                  sx={{ borderRadius: 999 }}
                                />
                              )}
                              {typeof room.trustScore === "number" && (
                                <Chip
                                  label={`신뢰도 ${Math.round(room.trustScore)}`}
                                  color="success"
                                  size="small"
                                  sx={{ borderRadius: 999 }}
                                />
                              )}
                              <Chip
                                label={availabilityLabel(room.availabilityStatus)}
                                size="small"
                                sx={{ borderRadius: 999 }}
                              />
                            </Stack>

                            <Typography variant="h6" fontWeight={700}>
                              {room.title}
                            </Typography>

                            <Stack direction="row" spacing={1} alignItems="center">
                            <LocationOn fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {room.address}
                            </Typography>
                          </Stack>

                          <Typography variant="body1" fontWeight={700} color="primary">
                            {formatCurrency(room.rentPrice)}
                          </Typography>
                          
                          {/* 설명 길어지니깐 지저분해보여서 주석해놨어요. */}
                          {/* {room.description && (
                            <Typography variant="body2" color="text.secondary">
                              {room.description}
                            </Typography>
                          )} */}

                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {tags.slice(0, 4).map((tag) => (
                              <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                sx={{ borderRadius: 999 }}
                              />
                            ))}
                          </Stack>
                            </CardContent>
                            </CardActionArea>
                            {/* 🔹 액션 영역은 그대로 Card 밖에 둠 (즐겨찾기 클릭 시 이동 막기 유지) */}
                            <CardActions
                              sx={{
                                px: 3,
                                pb: 3,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Button
                                variant="text"
                                component={RouterLink}
                                to={roomId ? `/rooms/${roomId}` : "/rooms"}
                              >
                                자세히 보기
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                sx={{ borderRadius: 999 }}
                                onClick={() => handleShareLink(room)}
                              >
                                공유 링크
                              </Button>
                              <FavoriteButton
                                  roomId={roomId!}
                                  isLiked={isFavorite}
                                  onToggle={() => toggleFavorite(room)}
                                />
                            </CardActions>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}

                <Stack direction="row" justifyContent="center" spacing={1}>
                  <Button
                    variant="outlined"
                    onClick={() => setCurrentPage(Math.max(1, pageWindowStart - 1))}
                    sx={{ borderRadius: 999, minWidth: 44 }}
                    disabled={pageWindowStart === 1}
                  >
                    ‹
                  </Button>
                  {pageNumbers.map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "contained" : "outlined"}
                      onClick={() => setCurrentPage(page)}
                      sx={{ borderRadius: 999, minWidth: 44 }}
                      disabled={page === currentPage}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outlined"
                    onClick={() => setCurrentPage(Math.min(totalPages, pageWindowEnd + 1))}
                    sx={{ borderRadius: 999, minWidth: 44 }}
                    disabled={pageWindowEnd === totalPages}
                  >
                    ›
                  </Button>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Container>
      <SiteFooter />
    </Box>
  );
}
