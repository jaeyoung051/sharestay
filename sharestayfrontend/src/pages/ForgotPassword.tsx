// src/pages/ForgotPassword.tsx
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export default function ForgotPassword() {
  return (
    <Box sx={{ bgcolor: "#f4f6fb", minHeight: "100vh" }}>
      <SiteHeader />
      <Container maxWidth="sm" sx={{ py: { xs: 6, md: 8 } }}>
        <Paper
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            boxShadow: "0 24px 48px rgba(15, 40, 105, 0.08)",
          }}
        >
          <Stack spacing={3} textAlign="center">
            <Stack spacing={1}>
              <Typography variant="h5" fontWeight={800}>
                비밀번호를 잊으셨나요?
              </Typography>
              <Typography color="text.secondary">
                가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를
                보내드립니다.
              </Typography>
            </Stack>
            <TextField
              label="이메일 주소"
              placeholder="example@sharestay.kr"
              fullWidth
            />
            <Button variant="contained" size="large">
              재설정 링크 보내기
            </Button>
            <Button variant="text" href="/login">
              로그인 페이지로 돌아가기
            </Button>
          </Stack>
        </Paper>
      </Container>
      <SiteFooter />
    </Box>
  );
}
