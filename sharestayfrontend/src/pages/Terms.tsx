// src/pages/Terms.tsx
import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

const termsSections = [
  {
    title: "제1조 목적",
    body: "이 약관은 ShareStay+ (이하 '회사')가 제공하는 룸쉐어링 매칭 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.",
  },
  {
    title: "제2조 용어의 정의",
    body: "① '이용자'란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다. ② '회원'이란 회사와 서비스 이용계약을 체결하고 계정을 발급받은 자를 의미합니다.",
  },
  {
    title: "제3조 약관의 명시와 개정",
    body: "회사는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다. 회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있으며, 변경된 약관은 공지 후 효력이 발생합니다.",
  },
  {
    title: "제4조 서비스의 제공",
    body: "회사는 다음과 같은 서비스를 제공합니다. 1) 룸메이트 및 매물 정보 매칭, 2) 지역 안전도 및 생활 데이터 제공, 3) 기타 회사가 정하는 서비스.",
  },
];

export default function Terms() {
  return (
    <Box sx={{ bgcolor: "#f4f6fb", minHeight: "100vh" }}>
      <SiteHeader />
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 8 } }}>
        <Paper
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            boxShadow: "0 24px 48px rgba(15, 40, 105, 0.08)",
            bgcolor: "white",
          }}
        >
          <Stack spacing={3}>
            <Typography variant="h4" fontWeight={800}>
              서비스 이용약관
            </Typography>
            <Typography color="text.secondary">
              본 약관은 여러분이 ShareStay+ 서비스를 이용함에 있어 필요한 권리와
              의무를 포함하고 있습니다. 서비스 이용 전에 반드시 숙지해 주세요.
            </Typography>
            {termsSections.map((section) => (
              <Stack spacing={1.5} key={section.title}>
                <Typography variant="h6" fontWeight={700}>
                  {section.title}
                </Typography>
                <Typography color="text.secondary">{section.body}</Typography>
              </Stack>
            ))}
            <Typography variant="body2" color="text.secondary">
              ※ 본 약관은 2026년 1월 1일부터 적용됩니다.
            </Typography>
          </Stack>
        </Paper>
      </Container>
      <SiteFooter />
    </Box>
  );
}
