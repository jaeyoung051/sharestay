// src/pages/LifestyleSetup.tsx
import Grid from "@mui/material/Unstable_Grid2";
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { api } from "../lib/api";
import { useAuth } from "../auth/useAuth";

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

export default function LifestyleSetup() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const initialSelected = useMemo(() => {
    if (!user?.lifeStyle) return [];
    if (Array.isArray(user.lifeStyle)) return user.lifeStyle;
    return user.lifeStyle
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [user?.lifeStyle]);

  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSelected(initialSelected);
  }, [initialSelected]);

  const toggleOption = (option: string) => {
    setSelected((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await api.post("/user/lifestyle", { lifestyles: selected });
      await refreshProfile().catch(() => undefined);
      navigate("/");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "라이프스타일 정보를 저장하는 중 오류가 발생했습니다.";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      await api.post("/user/lifestyle", { lifestyles: [] });
      await refreshProfile().catch(() => undefined);
    } catch (error) {
      // 건너뛰기는 오류가 나도 계속 진행
    } finally {
      setIsSubmitting(false);
      navigate("/");
    }
  };

  return (
    <Box sx={{ bgcolor: "#f4f6fb", minHeight: "100vh" }}>
      <SiteHeader activePath="/lifestyle" />
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Paper
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            boxShadow: "0 24px 48px rgba(15, 40, 105, 0.08)",
          }}
        >
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Typography variant="h4" fontWeight={800}>
                라이프스타일을 선택해주세요
              </Typography>
              <Typography color="text.secondary">
                함께 지내고 싶은 룸메이트의 생활 패턴을 미리 알려주시면 맞춤
                추천에 도움이 됩니다. 언제든 마이페이지에서 수정할 수 있습니다.
              </Typography>
            </Stack>

            <Grid container spacing={1.5}>
              {lifestyleOptions.map((option) => (
                <Grid xs={12} sm={6} md={3} key={option}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selected.includes(option)}
                        onChange={() => toggleOption(option)}
                      />
                    }
                    label={option}
                  />
                </Grid>
              ))}
            </Grid>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                variant="contained"
                onClick={handleComplete}
                disabled={isSubmitting}
                sx={{ borderRadius: 999, px: 4 }}
              >
                완료하기
              </Button>
              <Button
                variant="text"
                onClick={handleSkip}
                disabled={isSubmitting}
                sx={{ borderRadius: 999, px: 4 }}
              >
                건너뛰기
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
      <SiteFooter />
    </Box>
  );
}
