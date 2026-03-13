import Grid from "@mui/material/Unstable_Grid2";
import { Box, Container, Divider, Stack, Typography } from "@mui/material";

export default function SiteFooter() {
  return (
    <Box sx={{ bgcolor: "#030b24", color: "rgba(255,255,255,0.75)", py: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid xs={12} md={4}>
            <Stack spacing={2}>
              <Typography variant="h6" color="common.white" fontWeight={700}>
                ShareStay+
              </Typography>
              <Typography variant="body2">
                지역 안전도와 활동성 데이터를 기반으로 한 신뢰할 수 있는 룸쉐어링
                플랫폼입니다. 안전하고 편리한 룸메이트 경험을 도와드립니다.
              </Typography>
              <Stack direction="row" spacing={1}>
                {["Instagram", "Facebook", "YouTube"].map((channel) => (
                  <Box
                    key={channel}
                    component="a"
                    href="#"
                    sx={{
                      px: 1.5,
                      py: 0.75,
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.2)",
                      fontSize: "0.75rem",
                      color: "inherit",
                    }}
                  >
                    {channel}
                  </Box>
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
                    방 찾기
                  </Box>
                  <Box component="a" href="/safety-map" color="inherit">
                    안전도 지도
                  </Box>
                  <Box component="a" href="/list-room" color="inherit">
                    방 등록
                  </Box>
                  <Box component="a" href="/guide" color="inherit">
                    이용방법
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
            © 2025 ShareStay+. All rights reserved.
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.6 }}>
            Powered by Readdy
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}