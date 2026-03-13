// src/components/SectionPaper.tsx
import { Paper, Stack, Typography, Box } from "@mui/material";
import type { ReactNode } from "react";

function SectionTitle({
  icon,
  title,
}: {
  icon?: ReactNode;
  title: string;
}) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      {icon && (
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // bgcolor: "primary.main",
            color: "primary.contrastText",
          }}
        >
          {icon}
        </Box>
      )}
      <Typography variant="h6" fontWeight={700}>
        {title}
      </Typography>
    </Stack>
  );
}

export default function SectionPaper({
  icon,
  title,
  children,
}: {
  icon?: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <Paper
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 4,
        boxShadow: "0 24px 48px rgba(15, 40, 105, 0.08)",
      }}
    >
      <Stack spacing={3}>
        <SectionTitle icon={icon} title={title} />
        {children}
      </Stack>
    </Paper>
  );
}
