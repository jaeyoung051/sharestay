// src/pages/AdminDashboard.tsx
import { Box, Container, Tab, Tabs, Typography } from "@mui/material";
import { useState } from "react";
import AdminUsers from "./AdminUsers";
import AdminBans from "./AdminBans";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export default function AdminDashboard() {
  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <SiteHeader />

      <Container sx={{ flex: 1, py: 4 }}>
        <Box
          display="flex"
          alignItems="center"
          mb={2}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Typography variant="h5" fontWeight={700} mr={4}>
            관리자 대시보드
          </Typography>
          <Tabs value={tabIndex} onChange={handleChange}>
            <Tab label="회원 관리" />
            <Tab label="Ban 관리" />
          </Tabs>
        </Box>

        {tabIndex === 0 && <AdminUsers />}
        {tabIndex === 1 && <AdminBans />}
      </Container>

      <SiteFooter />
    </Box>
  );
}
