// src/pages/Privacy.tsx
import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

const policies = [
  {
    title: "수집하는 개인정보 항목",
    body: "회사는 회원가입, 상담, 서비스 신청 등을 위해 다음과 같은 개인정보를 수집합니다. 필수 항목: 아이디, 비밀번호, 닉네임, 이메일. 선택 항목: 연락처, 선호 설정, 부가 정보.",
  },
  {
    title: "개인정보의 수집 및 이용 목적",
    body: "서비스 제공에 관한 계약 이행 및 서비스 제공에 따른 요금정산, 회원 관리, 신규 서비스 개발 및 마케팅 목적, 민원 처리 등을 위해 개인정보를 활용합니다.",
  },
  {
    title: "개인정보의 보유 및 이용기간",
    body: "회사는 이용자의 개인정보를 원칙적으로 수집 및 이용 목적이 달성되면 지체 없이 파기합니다. 단, 관련 법령에 따라 일정 기간 보관할 필요가 있는 경우 해당 기간 동안 보관합니다.",
  },
  {
    title: "개인정보의 파기 절차 및 방법",
    body: "전자적 파일 형태의 정보는 복구 및 재생이 되지 않도록 기술적인 방법을 이용하여 삭제하며, 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다.",
  },
];

export default function Privacy() {
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
              개인정보처리방침
            </Typography>
            <Typography color="text.secondary">
              ShareStay+는 이용자의 개인정보를 소중히 여기며, 안전하고 투명하게
              처리하기 위해 최선을 다하고 있습니다.
            </Typography>
            {policies.map((policy) => (
              <Stack spacing={1.5} key={policy.title}>
                <Typography variant="h6" fontWeight={700}>
                  {policy.title}
                </Typography>
                <Typography color="text.secondary">{policy.body}</Typography>
              </Stack>
            ))}
            <Typography variant="body2" color="text.secondary">
              ※ 본 방침은 2026년 1월 1일부터 적용됩니다.
            </Typography>
          </Stack>
        </Paper>
      </Container>
      <SiteFooter />
    </Box>
  );
}
