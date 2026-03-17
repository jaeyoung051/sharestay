﻿// src/pages/Signup.tsx
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PhoneIphoneOutlinedIcon from "@mui/icons-material/PhoneIphoneOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../auth/useAuth";
import type { Roles } from "../auth/types";
import type { ComponentProps } from "react";
import { Link as RouterLink } from "react-router-dom";

const roles: Roles[] = ["GUEST", "HOST"];

const schema = z
  .object({
    username: z.string().email("유효한 이메일 주소를 입력해 주세요."),
    password: z
      .string()
      .min(8, "비밀번호는 최소 8자 이상이어야 합니다.")
      .regex(/[A-Za-z]/, "비밀번호에 영문자를 포함해 주세요.")
      .regex(/\d/, "비밀번호에 숫자를 포함해 주세요."),
    confirmPassword: z.string().min(8, "비밀번호를 한 번 더 입력해 주세요."),
    nickname: z.string().min(2, "닉네임은 최소 2자 이상이어야 합니다."),
    address: z.string().optional().or(z.literal("")),
    phoneNumber: z.string().min(8, "연락처를 입력해 주세요."),
    lifeStyle: z.string().optional().or(z.literal("")),
    role: z.enum(["GUEST", "HOST"]),
    hostIntroduction: z.string().optional(),
    hostTermsAgreed: z.boolean().optional(),
    agreeTerms: z
      .boolean()
      .refine(Boolean, { message: "서비스 이용약관에 동의해 주세요." }),
    agreePrivacy: z
      .boolean()
      .refine(Boolean, { message: "개인정보 수집 및 이용에 동의해 주세요." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  })
  .superRefine((values, ctx) => {
    if (values.role === "HOST") {
      if (
        !values.hostIntroduction ||
        values.hostIntroduction.trim().length < 1
      ) {
        ctx.addIssue({
          path: ["hostIntroduction"],
          code: z.ZodIssueCode.custom,
          message: "호스트 소개를 입력해 주세요.",
        });
      }
      if (!values.hostTermsAgreed) {
        ctx.addIssue({
          path: ["hostTermsAgreed"],
          code: z.ZodIssueCode.custom,
          message: "호스트 약관에 동의해 주세요.",
        });
      }
    }
  });

type FormValues = z.infer<typeof schema>;

export default function Signup() {
  const { signup } = useAuth();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      nickname: "",
      address: "",
      phoneNumber: "",
      lifeStyle: "",
      role: "GUEST",
      agreeTerms: false,
      agreePrivacy: false,
      hostTermsAgreed: false,
      hostIntroduction: "",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async ({
    confirmPassword,
    agreeTerms,
    agreePrivacy,
    hostIntroduction,
    hostTermsAgreed,
    address,
    ...rest
  }: FormValues) => {
    const normalizedPayload = {
      ...rest,
      address: (address ?? "").trim(),
      lifeStyle: (rest.lifeStyle ?? "").trim(),
      hostIntroduction:
        rest.role === "HOST" ? (hostIntroduction ?? "").trim() : "",
      hostTermsAgreed: rest.role === "HOST" ? Boolean(hostTermsAgreed) : false,
    };
    try {
      await signup(normalizedPayload);
      alert("회원가입이 완료되었습니다. 로그인해 주세요.");
      window.location.href = "/login";
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "회원가입에 실패했습니다. 다시 시도해 주세요.";
      alert(message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f4f6fb",
        display: "grid",
        placeItems: "center",
        px: 2,
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 520,
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          boxShadow:
            "0px 8px 20px rgba(15, 23, 42, 0.08), 0px 2px 6px rgba(15, 23, 42, 0.12)",
        }}
      >
        <Stack spacing={3} component="form" onSubmit={handleSubmit(onSubmit)}>
          <Box textAlign="center">
            <Typography
              component={RouterLink}
              to="/"
              variant="h4"
              fontWeight={800}
              color="primary.main"
              sx={{ textDecoration: "none" }}
            >
              ShareStay+
            </Typography>
          </Box>

          <Stack spacing={2.5}>
            <ControlledField
              control={control}
              name="username"
              label="이메일"
              placeholder="이메일을 입력하세요"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineOutlinedIcon color="disabled" />
                  </InputAdornment>
                ),
              }}
            />
            <ControlledField
              control={control}
              name="password"
              label="비밀번호"
              placeholder="비밀번호를 입력하세요"
              type="password"
              helperText="8자 이상, 영문/숫자 포함"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon color="disabled" />
                  </InputAdornment>
                ),
              }}
            />
            <ControlledField
              control={control}
              name="confirmPassword"
              label="비밀번호 확인"
              placeholder="비밀번호를 다시 입력하세요"
              type="password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon color="disabled" />
                  </InputAdornment>
                ),
              }}
            />
            <ControlledField
              control={control}
              name="nickname"
              label="닉네임"
              placeholder="닉네임을 입력하세요"
            />
            <ControlledField
              control={control}
              name="phoneNumber"
              label="연락처"
              placeholder="연락처를 입력하세요"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIphoneOutlinedIcon color="disabled" />
                  </InputAdornment>
                ),
              }}
            />
            <ControlledField
              control={control}
              name="address"
              label="주소 (선택)"
              placeholder="주소를 입력하세요"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HomeOutlinedIcon color="disabled" />
                  </InputAdornment>
                ),
              }}
            />
            <ControlledField
              control={control}
              name="lifeStyle"
              label="라이프스타일 (선택)"
              placeholder="선호하는 생활 패턴을 입력하세요"
              multiline
              minRows={3}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <NotesOutlinedIcon color="disabled" />
                  </InputAdornment>
                ),
              }}
            />

            <Stack spacing={1}>
              <Typography fontWeight={600}>역할 선택</Typography>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    error={!!errors.role}
                    helperText="호스트를 선택하면 관리자 승인이 필요할 수 있습니다."
                  >
                    {roles.map((role) => (
                      <MenuItem key={role} value={role}>
                        {role === "GUEST"
                          ? "게스트 (방 찾기, 예약)"
                          : "호스트 (룸 등록)"}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Stack>

            {selectedRole === "HOST" && (
              <Stack
                spacing={1.5}
                sx={{ border: "1px solid #e3e8f7", p: 2, borderRadius: 2 }}
              >
                <Typography fontWeight={600} color="primary.main">
                  호스트 추가 정보
                </Typography>
                <Controller
                  control={control}
                  name="hostIntroduction"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={field.value ?? ""}
                      label="호스트 소개"
                      placeholder="게스트에게 알려주고 싶은 내용을 입력하세요."
                      multiline
                      minRows={3}
                      error={!!errors.hostIntroduction}
                      helperText={
                        errors.hostIntroduction?.message ?? "필수 입력"
                      }
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="hostTermsAgreed"
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value ?? false}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label="호스트 약관에 동의합니다."
                    />
                  )}
                />
                {errors.hostTermsAgreed && (
                  <Typography variant="caption" color="error">
                    {errors.hostTermsAgreed.message}
                  </Typography>
                )}
              </Stack>
            )}

            <Controller
              control={control}
              name="agreeTerms"
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="서비스 이용약관에 동의합니다."
                />
              )}
            />
            {errors.agreeTerms && (
              <Typography variant="caption" color="error">
                {errors.agreeTerms.message}
              </Typography>
            )}

            <Controller
              control={control}
              name="agreePrivacy"
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="개인정보 수집 및 이용에 동의합니다."
                />
              )}
            />
            {errors.agreePrivacy && (
              <Typography variant="caption" color="error">
                {errors.agreePrivacy.message}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{ borderRadius: 2, py: 1.4, fontWeight: 700, mt: 1 }}
            >
              {isSubmitting ? "가입 중..." : "회원가입"}
            </Button>
          </Stack>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            이미 계정이 있으신가요?{" "}
            <Link component={RouterLink} to="/login" underline="hover">
              로그인
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}

type FieldProps = {
  label: string;
  placeholder?: string;
  helperText?: string;
  errorMessage?: string;
  name: keyof FormValues;
  control: any;
} & ComponentProps<typeof TextField>;

function ControlledField({
  label,
  errorMessage,
  helperText,
  control,
  name,
  ...rest
}: FieldProps) {
  return (
    <Stack spacing={1}>
      <Typography fontWeight={600}>{label}</Typography>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => {
          const derivedError = errorMessage ?? fieldState.error?.message;
          return (
            <TextField
              {...field}
              value={field.value ?? ""}
              error={!!derivedError}
              helperText={derivedError ?? helperText}
              {...rest}
            />
          );
        }}
      />
    </Stack>
  );
}
