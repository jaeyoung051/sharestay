// src/pages/ListRoom.tsx  방등록
import Grid from "@mui/material/Unstable_Grid2";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { HomeWork, LocationOn, PeopleAlt } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import FormTextField from "../components/FormTextField";
import { api } from "../lib/api";
import { useAuth } from "../auth/useAuth";
import type {
  RoomAvailabilityStatus,
  RoomApiResponse,
} from "../types/room";
import SectionPaper from "../components/SectionPaper";


// ------------------------------
// Zod Schema
// ------------------------------
const roomSchema = z.object({
  title: z.string().min(1, "모집 제목을 입력해주세요."),
  rentPrice: z
    .string()
    .min(1, "월세를 입력해주세요.")
    .refine(
      (value) => !Number.isNaN(Number(value)),
      "월세는 숫자로 입력해주세요."
    ),
    deposit: z
    .string()
    .min(1, "Please enter a deposit.")
    .refine((value) => !Number.isNaN(Number(value)), "Deposit must be a number."),
  type: z.string().min(1, "방 유형을 선택해주세요."),
  availabilityStatus: z.string().min(1, "모집 상태를 선택해주세요."),
  address: z.string().min(1, "주소를 입력해주세요."),
  latitude: z
    .string()
    .optional()
    .refine(
      (value) => !value || !Number.isNaN(Number(value)),
      "위도는 숫자로 입력해주세요."
    ),
  longitude: z
    .string()
    .optional()
    .refine(
      (value) => !value || !Number.isNaN(Number(value)),
      "경도는 숫자로 입력해주세요."
    ),
  preferredGender: z.string().optional(),
  preferredAge: z.string().optional(),
  totalMembers: z
    .string()
    .optional()
    .refine(
      (value) => !value || !Number.isNaN(Number(value)),
      "총 인원수는 숫자로 선택해주세요."
    ),
  description: z
    .string()
    .min(10, "상세 설명을 10자 이상 작성해주세요.")
    .max(1000, "상세 설명은 1000자 이하로 작성해주세요."),
});

type FormValues = z.infer<typeof roomSchema>;

// ------------------------------
// Options
// ------------------------------
const roomTypes = [
  { value: "", label: "전체 유형" },
  { value: "원룸", label: "원룸" },
  { value: "투룸", label: "투룸" },
  { value: "오피스텔", label: "오피스텔" },
  { value: "아파트", label: "아파트" },
];

const preferredGenderOptions = [
  { value: "", label: "무관" },
  { value: "MALE", label: "남성" },
  { value: "FEMALE", label: "여성" },
  { value: "NON_BINARY", label: "논바이너리" },
];

const preferredAgeOptions = [
  { value: "", label: "선택 안 함" },
  { value: "20대", label: "20대" },
  { value: "30대", label: "30대" },
  { value: "40대", label: "40대" },
  { value: "50대", label: "50대 이상" },
];

const totalMemberOptions = [
  { value: "", label: "선택" },
  { value: "1", label: "1명" },
  { value: "2", label: "2명" },
  { value: "3", label: "3명" },
  { value: "4", label: "4명" },
  { value: "5", label: "5명" },
  { value: "6", label: "6명 이상" },
];


const availabilityOptions = [
  { value: "AVAILABLE", label: "모집중" },
  { value: "PENDING", label: "예약중" },
  { value: "UNAVAILABLE", label: "마감" },
];

const availabilityStatusMap: Record<RoomAvailabilityStatus, number> = {
  AVAILABLE: 0,
  PENDING: 1,
  UNAVAILABLE: 2,
};

const lifestyleOptions = [
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
];

const facilityOptions = [
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
];

export default function ListRoom() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      title: "",
      rentPrice: "",
      deposit: "",
      type: "",
      availabilityStatus: "AVAILABLE",
      address: "",
      latitude: "",
      longitude: "",
      preferredGender: "",
      preferredAge: "",
      totalMembers: "",
      description: "",
    },
  });

  const navigate = useNavigate();
  const { user } = useAuth();
  // 호스트 식별자는 hostId를 우선 사용하고, 없을 때만 userId로 폴백
  const hostId = user?.hostId ?? user?.id ?? null;
  const roleList = user?.roles ?? (user?.role ? [user.role] : []);
  const isHostUser =
    roleList.includes("HOST") || roleList.includes("ADMIN");
  const canSubmit = Boolean(hostId && isHostUser);

  const [selectedLifestyle, setSelectedLifestyle] = useState<string[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const toggleSelection = (
    value: string,
    setter: Dispatch<SetStateAction<string[]>>
  ) =>
    setter((prev: string[]) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );

  const handleImagePick = () => {
    fileInputRef.current?.click();
  };

  const handleImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).slice(0, 6);
    setImages(files);
  };

  const handleReset = () => {
    reset();
    setSelectedLifestyle([]);
    setSelectedFacilities([]);
    setImages([]);
  };

  const onSubmit = async (values: FormValues) => {
    if (!canSubmit) {
      alert("이 기능은 호스트 전용입니다. 호스트 전환을 완료해 주세요.");
      return;
    }

    // 주소를 좌표로 변환하는 함수
    const getCoordsFromAddress = (address: string): Promise<{ lat: number; lng: number } | null> => {
      return new Promise((resolve) => {
        if (!window.kakao || !window.kakao.maps) {
          resolve(null);
          return;
        }
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(address, (result: any, status: any) => {
          if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
            resolve({
              lat: parseFloat(result[0].y),
              lng: parseFloat(result[0].x),
            });
          } else {
            resolve(null);
          }
        });
      });
    };

    try {
      const rentPrice = Number(values.rentPrice);
      let latitudeValue =
        values.latitude && values.latitude.trim().length > 0
          ? Number(values.latitude)
          : undefined;
      let longitudeValue =
        values.longitude && values.longitude.trim().length > 0
          ? Number(values.longitude)
          : undefined;

      if ((latitudeValue === undefined || longitudeValue === undefined) && values.address) {
        const coords = await getCoordsFromAddress(values.address);
        if (coords) {
          latitudeValue = coords.lat;
          longitudeValue = coords.lng;
        }
      }

      if (Number.isNaN(rentPrice)) {
        throw new Error("월세 값이 올바르지 않습니다.");
      }
      if (latitudeValue !== undefined && Number.isNaN(latitudeValue)) {
        throw new Error("위도 값이 올바르지 않습니다.");
      }
      if (longitudeValue !== undefined && Number.isNaN(longitudeValue)) {
        throw new Error("경도 값이 올바르지 않습니다.");
      }

      const availabilityCode =
        availabilityStatusMap[
          values.availabilityStatus as RoomAvailabilityStatus
        ] ?? 0;
      const totalMembersValue = values.totalMembers
        ? Number(values.totalMembers)
        : undefined;

      const selectedOptions = Array.from(
        new Set([...selectedLifestyle, ...selectedFacilities])
      );
      const optionsBlock = selectedOptions.length
        ? `선호 옵션:\n${selectedOptions.map((option) => `- ${option}`).join("\n")}`
        : "";
      const composedDescription = [values.description, optionsBlock]
        .filter(Boolean)
        .join("\n\n");

        // ⭐ 변경 1: JSON payload 대신 FormData 생성
    const formData = new FormData();
    formData.append("hostId", String(hostId!));
    formData.append("title", values.title);
    formData.append("rentPrice", String(rentPrice));
    formData.append("deposit", String(Number(values.deposit)));
    formData.append("address", values.address);
    formData.append("type", values.type);
    formData.append("availabilityStatus", String(availabilityCode));
    formData.append("description", composedDescription);
    formData.append("latitude", String(latitudeValue ?? 0));
    formData.append("longitude", String(longitudeValue ?? 0));
    formData.append("preferredGender", values.preferredGender ?? "");
    formData.append("preferredAge", values.preferredAge ?? "");
    formData.append("totalMembers", String(totalMembersValue ?? ""));
    selectedFacilities.forEach((option) => formData.append("options", option));
    selectedLifestyle.forEach((life) => formData.append("lifestyle", life));

      // ⭐ 변경 2: 이미지 파일들을 files 필드로 함께 전송
    images.forEach((file) => {
      formData.append("files", file);
    });

    // ⭐ 변경 3: 엔드포인트 + multipart 전송으로 한 번에 요청
    //   - api 인스턴스 baseURL이 `http://localhost:8080` 이라면 "/api/rooms"
    //   - baseURL이 `http://localhost:8080/api` 라면 "/rooms"로 맞추기
    const { data } = await api.post<RoomApiResponse>(
      "/rooms", // 🔥 여기 엔드포인트가 핵심
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    const createdRoomId = data?.id ?? (data as { roomId?: number }).roomId;

    // ⭐ 변경 4: 별도 /images 업로드 API는 더 이상 호출 X
    // if (createdRoomId && images.length > 0) {
    //   const formData = new FormData();
    //   images.forEach((file) => formData.append("files", file));
    //   await api.post(`/rooms/${createdRoomId}/images`, formData, {
    //     headers: { "Content-Type": "multipart/form-data" },
    //   });
    // }

      alert("룸 정보가 등록되었습니다.");
      handleReset();
      navigate(
        createdRoomId ? `/rooms?highlight=${createdRoomId}` : "/rooms",
        { replace: true }
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "룸 정보를 등록하는 중 오류가 발생했습니다.";
      alert(message);
    }
  };

  return (
    <Box sx={{ bgcolor: "#f4f6fb", minHeight: "100vh" }}>
      <SiteHeader activePath="/list-room" />
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Stack spacing={4}>
          <Stack spacing={1}>
            <Typography variant="h4" fontWeight={800}>
              룸메이트 모집하기
            </Typography>
            <Typography color="text.secondary">
              새로운 룸메이트를 모집해보세요. 정확한 정보 입력이 중요합니다.
            </Typography>
          </Stack>

          {!canSubmit && (
            <Alert severity="warning" sx={{ borderRadius: 3 }}>
              호스트 전환을 완료해야 방을 등록할 수 있습니다.
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <SectionPaper icon={<HomeWork color="primary" />} title="기본 정보">
                <Grid container spacing={3}>
                  <Grid xs={12}>
                    <FormTextField
                      name="title"
                      control={control}
                      label="모집 제목"
                      placeholder="예: 강남역 도보 5분 깔끔한 원룸 룸메이트 구해요"
                    />
                  </Grid>

                  <Grid xs={12} sm={3}>
                    <FormTextField
                      name="deposit"
                      control={control}
                      label="보증금"
                      placeholder="예: 10000000"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">₩</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid xs={12} md={3}>
                    <FormTextField
                      name="rentPrice"
                      control={control}
                      label="월세 (원)"
                      placeholder="예: 425000"
                      inputMode="numeric"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">₩</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid xs={12} md={3}>
                    <FormTextField
                      name="type"
                      control={control}
                      label="방 유형"
                      select
                      defaultValue=""
                    >
                      <MenuItem value="">
                        <em>방 유형을 선택하세요</em>
                      </MenuItem>
                      {roomTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </FormTextField>
                  </Grid>

                  <Grid xs={12} md={3}>
                    <FormTextField
                      name="availabilityStatus"
                      control={control}
                      label="모집 상태"
                      select
                    >
                      {availabilityOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </FormTextField>
                  </Grid>
                </Grid>
              </SectionPaper>

              <SectionPaper
                icon={<LocationOn color="primary" />}
                title="주소 및 위치"
              >
                <Grid container spacing={3}>
                  <Grid xs={12}>
                    <FormTextField
                      name="address"
                      control={control}
                      label="주소"
                      placeholder="예: 서울특별시 강남구 역삼동 123-45"
                    />
                  </Grid>

                  <Grid xs={12} md={6}>
                    <FormTextField
                      name="latitude"
                      control={control}
                      label="위도 (선택)"
                      placeholder="예: 37.4981"
                    />
                  </Grid>

                  <Grid xs={12} md={6}>
                    <FormTextField
                      name="longitude"
                      control={control}
                      label="경도 (선택)"
                      placeholder="예: 127.0276"
                    />
                  </Grid>
                </Grid>
              </SectionPaper>

              <SectionPaper
                icon={<PeopleAlt color="primary" />}
                title="룸메이트 조건"
              >
                <Grid container spacing={3}>
                  <Grid xs={12} md={4}>
                    <FormTextField
                      name="preferredGender"
                      control={control}
                      label="선호 성별"
                      select
                      defaultValue=""
                    >
                      {preferredGenderOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </FormTextField>
                  </Grid>

                  <Grid xs={12} md={4}>
                    <FormTextField
                      name="preferredAge"
                      control={control}
                      label="선호 연령대"
                      select
                      defaultValue=""
                    >
                      {preferredAgeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </FormTextField>
                  </Grid>

                  <Grid xs={12} md={4}>
                    <FormTextField
                      name="totalMembers"
                      control={control}
                      label="총 인원수"
                      select
                      defaultValue=""
                    >
                      {totalMemberOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </FormTextField>
                  </Grid>
                </Grid>
              </SectionPaper>

              <SectionPaper title="생활 패턴">
                <CheckboxGroup
                  options={lifestyleOptions}
                  selected={selectedLifestyle}
                  onToggle={(option) =>
                    toggleSelection(option, setSelectedLifestyle)
                  }
                />
              </SectionPaper>

              <SectionPaper title="부가 옵션">
                <CheckboxGroup
                  options={facilityOptions}
                  selected={selectedFacilities}
                  onToggle={(option) =>
                    toggleSelection(option, setSelectedFacilities)
                  }
                />
              </SectionPaper>

              <SectionPaper title="상세 설명">
                <FormTextField
                  name="description"
                  control={control}
                  label="상세 설명"
                  placeholder="룸메이트에 대한 상세한 설명을 작성해주세요. (최소 10자 이상)"
                  multiline
                  minRows={6}
                />
              </SectionPaper>

              <SectionPaper title="사진 업로드">
                <Stack spacing={2}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: "none" }}
                    ref={fileInputRef}
                    onChange={handleImagesChange}
                  />
                  <Button variant="outlined" onClick={handleImagePick}>
                    사진 추가 ({images.length}/6)
                  </Button>

                  {images.length > 0 && (
                    <Stack spacing={0.5}>
                      {images.map((file) => (
                        <Typography variant="caption" key={file.name}>
                          {file.name}
                        </Typography>
                      ))}
                    </Stack>
                  )}

                  <Typography variant="caption" color="text.secondary">
                    최대 6장까지 업로드 가능합니다. (JPG, PNG 형식)
                  </Typography>
                </Stack>
              </SectionPaper>

              <Paper
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 4,
                  boxShadow: "0 24px 48px rgba(15, 40, 105, 0.08)",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  justifyContent="flex-end"
                >
                  <Button variant="text" onClick={handleReset}>
                    초기화
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ minWidth: 180 }}
                    disabled={isSubmitting || !canSubmit}
                  >
                    {isSubmitting ? "등록 중..." : "룸메이트 모집하기"}
                  </Button>
                </Stack>
              </Paper>
            </Stack>
          </Box>
        </Stack>
      </Container>
      <SiteFooter />
    </Box>
  );
}



function CheckboxGroup({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
}) {
  return (
    <Grid container spacing={1.5}>
      {options.map((option) => (
        <Grid xs={12} sm={6} md={3} key={option}>
          <FormControlLabel
            control={
              <Checkbox
                checked={selected.includes(option)}
                onChange={() => onToggle(option)}
              />
            }
            label={option}
          />
        </Grid>
      ))}
    </Grid>
  );
}
