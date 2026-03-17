// src/pages/Guide.tsx
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import {
  AssignmentTurnedIn,
  HomeWork,
  PersonAddAlt,
} from "@mui/icons-material";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

const steps = [
  {
    icon: <PersonAddAlt fontSize="large" color="primary" />,
    title: "1. 회원가입",
    description:
      "간단한 정보 입력으로 무료 회원가입을 완료하세요. 게스트 또는 호스트 역할을 선택할 수 있습니다.",
    chip: "약 2분 소요",
  },
  {
    icon: <HomeWork fontSize="large" color="primary" />,
    title: "2. 방 찾기",
    description:
      "원하는 지역과 조건을 설정하여 안전도와 신뢰도가 검증된 매물을 찾아보세요.",
    chip: "실시간 데이터 기반",
  },
  {
    icon: <AssignmentTurnedIn fontSize="large" color="primary" />,
    title: "3. 예약하기",
    description:
      "마음에 드는 방을 찾았다면 간편한 예약 시스템으로 바로 예약을 완료하세요.",
    chip: "안전 결제 시스템",
  },
];

const tabs = ["시작하기", "이용 가이드", "자주 묻는 질문"];

export default function Guide() {
  return (
    <Box sx={{ bgcolor: "#f4f6fb", minHeight: "100vh" }}>
      <SiteHeader activePath="/guide" />
      <Box
        sx={{
          bgcolor: "white",
          pt: { xs: 8, md: 12 },
          pb: { xs: 6, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Chip label="Guide" color="primary" variant="outlined" />
            <Typography variant="h3" fontWeight={800}>
              ShareStay+ 이용 가이드
            </Typography>
            <Typography variant="h6" color="text.secondary" maxWidth={640}>
              처음 이용하신다면 아래 순서를 참고해 빠르게 맞춤 서비스를 경험해 보세요.
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
              {tabs.map((tab, index) => (
                <Button
                  key={tab}
                  variant={index === 0 ? "contained" : "text"}
                  sx={{
                    borderRadius: 999,
                    px: 3,
                    fontWeight: 600,
                    color: index === 0 ? "common.white" : "text.primary",
                  }}
                >
                  {tab}
                </Button>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Stack spacing={6}>
          <Stack spacing={1.5} textAlign="center">
            <Typography variant="h4" fontWeight={800}>
              ShareStay+ 시작하기
            </Typography>
            <Typography color="text.secondary" maxWidth={640} alignSelf="center">
              몇 분만 투자하면 안전하고 신뢰할 수 있는 룸쉐어링 서비스를 바로 이용할 수 있습니다.
            </Typography>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            {steps.map((step) => (
              <Card
                key={step.title}
                sx={{
                  flex: 1,
                  borderRadius: 4,
                  height: "100%",
                  boxShadow: "0 16px 32px rgba(15, 40, 105, 0.12)",
                  display: "flex",
                }}
              >
                <CardContent
                  sx={{
                    p: 4,
                    display: "flex",
                    flexDirection: "row",
                    gap: 3,
                    alignItems: "center",
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "rgba(12, 81, 255, 0.12)",
                      color: "primary.main",
                      width: 56,
                      height: 56,
                      flexShrink: 0,
                    }}
                  >
                    {step.icon}
                  </Avatar>
                  <Stack spacing={1} textAlign="left">
                    <Typography variant="h6" fontWeight={700}>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                    <Chip
                      label={step.chip}
                      color="primary"
                      variant="outlined"
                      sx={{ alignSelf: "flex-start" }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>

          <Box
            sx={{
              bgcolor: "white",
              borderRadius: 4,
              p: { xs: 4, md: 6 },
              boxShadow: "0 24px 48px rgba(15, 40, 105, 0.08)",
              textAlign: "center",
            }}
          >
            <Stack spacing={2}>
              <Typography variant="h5" fontWeight={800}>
                지금 바로 시작해 보세요
              </Typography>
              <Typography color="text.secondary" maxWidth={540} alignSelf="center">
                ShareStay+와 함께 안전하고 믿을 수 있는 룸쉐어링 경험을 시작해 보세요.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
                <Button variant="contained" size="large" href="/signup" sx={{ borderRadius: 999, px: 4 }}>
                  무료 회원가입
                </Button>
                <Button variant="outlined" size="large" href="/rooms" sx={{ borderRadius: 999, px: 4 }}>
                  방 둘러보기
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Container>

      <SiteFooter />
    </Box>
  );
}
