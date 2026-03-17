// src/pages/SafetyMap.tsx
import {
  Box,
  Container,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { api } from "../lib/api";
import type { ApiEnvelope } from "../auth/types";
import type { Statistic } from "../types/statistic";

const STAT_TYPES = [
  { value: "SAFETY", label: "안전도" },
  { value: "TRUST", label: "신뢰도" },
  { value: "ACTIVITY", label: "활동성" },
];

export default function SafetyMap() {
  const [statType, setStatType] = useState<string>("SAFETY");
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get<ApiEnvelope<Statistic[] | unknown[]>>(
        "/statistics",
        {
          params: { type: statType },
        }
      );
      const list = Array.isArray(data.result) ? data.result : [];
      const normalized = list.map((item) => {
        const source = item as Statistic & Record<string, unknown>;
        return {
          statisticId:
            (source.statisticId as number) ??
            Number(source.id ?? Math.random()),
          statisticType: String(source.statisticType ?? statType),
          dataType: String(source.dataType ?? "score"),
          value: Number(source.value ?? 0),
          recordedAt: String(source.recordedAt ?? new Date().toISOString()),
        } as Statistic;
      });
      setStatistics(normalized);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "통계 데이터를 불러오는 중 문제가 발생했습니다.";
      setError(message);
      setStatistics([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statType]);

  return (
    <Box sx={{ bgcolor: "#f4f6fb", minHeight: "100vh" }}>
      <SiteHeader activePath="/safety-map" />
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Paper
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            boxShadow: "0 24px 48px rgba(15, 40, 105, 0.08)",
          }}
        >
          <Stack spacing={3}>
            <Stack spacing={1} textAlign="center">
              <Typography variant="h4" fontWeight={800}>
                안전도 지도
              </Typography>
              <Typography
                color="text.secondary"
                maxWidth={640}
                alignSelf="center"
              >
                지역별 안전도와 활동성 데이터를 확인하고, ShareStay+의 추천
                정책을 이해해보세요. 통계 유형을 변경해 다양한 지표를 살펴볼 수
                있습니다.
              </Typography>
            </Stack>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "flex-start", md: "center" }}
              justifyContent="space-between"
            >
              <Typography variant="subtitle1" fontWeight={600}>
                통계 유형 선택
              </Typography>
              <Select
                value={statType}
                onChange={(event) => setStatType(event.target.value)}
                sx={{ minWidth: 200, borderRadius: 3 }}
              >
                {STAT_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </Stack>

            {error && (
              <Typography color="error" textAlign="center">
                {error}
              </Typography>
            )}

            {isLoading ? (
              <Box
                sx={{ display: "grid", placeItems: "center", minHeight: 240 }}
              >
                <CircularProgress />
              </Box>
            ) : statistics.length === 0 ? (
              <Typography color="text.secondary" textAlign="center">
                선택한 유형의 데이터가 아직 없습니다. 잠시 후 다시 시도해주세요.
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>지표</TableCell>
                    <TableCell>데이터 유형</TableCell>
                    <TableCell align="right">값</TableCell>
                    <TableCell align="right">기준 시각</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {statistics.map((stat) => (
                    <TableRow key={stat.statisticId} hover>
                      <TableCell>{stat.statisticType}</TableCell>
                      <TableCell>{stat.dataType}</TableCell>
                      <TableCell align="right">
                        {Number.isFinite(stat.value)
                          ? stat.value.toFixed(2)
                          : stat.value}
                      </TableCell>
                      <TableCell align="right">
                        {new Date(stat.recordedAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Stack>
        </Paper>
      </Container>
      <SiteFooter />
    </Box>
  );
}
