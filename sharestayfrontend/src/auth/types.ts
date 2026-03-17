// src/auth/types.ts
export type Roles = "GUEST" | "HOST" | "ADMIN";

export interface UserInfo {
  id: number;
  username: string;
  nickname?: string;
  email?: string;
  role?: Roles;
  roles: Roles[];
  hostId?: number | null;
  address?: string;
  phoneNumber?: string;
  lifeStyle?: string;
  signupDate?: string;
  hostIntroduction?: string;
  hostTermsAgreed?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  userId: number;
  username: string;
}

export interface SignupPayload {
  username: string;
  password: string;
  nickname: string;
  address: string;
  phoneNumber: string;
  lifeStyle: string;
  role: Roles;
  hostIntroduction?: string;
  hostTermsAgreed?: boolean;
}

export interface UpdateProfilePayload {
  nickname?: string;
  address?: string;
  phoneNumber?: string;
  lifeStyle?: string;
  hostIntroduction?: string;
}

export interface ApiEnvelope<T> {
  code: number;
  message: string;
  result: T;
  timestamp?: string;
}
