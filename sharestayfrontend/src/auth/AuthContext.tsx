// src/auth/AuthContext.tsx
import React, { createContext, useEffect, useMemo, useState } from "react";
import {
  api,
  clearTokens,
  getAccessToken,
  getStoredUsername,
  setAccessToken,
  setStoredUsername,
} from "../lib/api";
import type {
  LoginResponse,
  Roles,
  SignupPayload,
  UpdateProfilePayload,
  UserInfo,
} from "./types";

type BackendUser = {
  id: number;
  username: string;
  nickname?: string;
  role?: string;
  roles?: string[];
  hostId?: number;
  address?: string;
  phoneNumber?: string;
  lifeStyle?: string;
  signupDate?: string;
  hostIntroduction?: string;
  hostTermsAgreed?: boolean;
};

type AuthContextType = {
  user: UserInfo | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
};

const noop = async () => {};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: noop,
  signup: noop,
  logout: () => undefined,
  refreshProfile: noop,
  updateProfile: noop,
});

const AVAILABLE_ROLES: Roles[] = ["GUEST", "HOST", "ADMIN"];

const normalizeRole = (value: string): Roles | null => {
  const normalized = value.replace(/^ROLE_/i, "").toUpperCase();
  return AVAILABLE_ROLES.includes(normalized as Roles) ? (normalized as Roles) : null;
};

function toRoles(role?: string, roles?: string[]): Roles[] {
  const source = roles?.length ? roles : role ? [role] : [];
  if (!source.length) return [];
  return Array.from(
    new Set(
      source
        .map(normalizeRole)
        .filter((roleValue): roleValue is Roles => roleValue !== null),
    ),
  );
}

function mapUser(dto: BackendUser): UserInfo {
  const normalizedRoles = toRoles(dto.role, dto.roles);
  return {
    id: dto.id,
    username: dto.username,
    nickname: dto.nickname,
    email: dto.username,
    role: normalizedRoles[0],
    roles: normalizedRoles,
    hostId: dto.hostId ?? null,
    address: dto.address,
    phoneNumber: dto.phoneNumber,
    lifeStyle: dto.lifeStyle,
    signupDate: dto.signupDate,
    hostIntroduction: dto.hostIntroduction,
    hostTermsAgreed: dto.hostTermsAgreed,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (username: string) => {
    const safeUsername = encodeURIComponent(username);
    const { data } = await api.get<BackendUser>(`/users/${safeUsername}`);

    const mapped = mapUser(data);
    setUser(mapped);

    return mapped;
  };

  useEffect(() => {
    const token = getAccessToken();
    const username = getStoredUsername();

    // 여기에 sub 디코드/console.log 추가
    if (token) {
      const payload = token.split(".")[1];
      try {
        const decoded = JSON.parse(atob(payload));
        console.log(
          "[Auth] JWT sub:",
          decoded.sub,
          "stored username:",
          username
        );
      } catch (e) {
        console.warn("[Auth] token decode failed", e);
      }
    }
    
    if (!token || !username) {
      setIsLoading(false);
      return;
    }

    fetchProfile(username)
      .catch(() => {
        clearTokens();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const { data } = await api.post<LoginResponse>("/login", {
      username,
      password,
    });
    if (!data?.accessToken) {
      throw new Error("Access token is missing in the response.");
    }

    setAccessToken(data.accessToken);
    setStoredUsername(username);

    const profile = await fetchProfile(username);
    
    if (profile.id) {
      sessionStorage.setItem("userId", String(profile.id));
    }
  };

  const signup = async (payload: SignupPayload) => {
    await api.post("/signup", payload);
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    window.location.href = "/login";
  };

  const refreshProfile = async () => {
    const username = getStoredUsername();
    if (!username) return;
    await fetchProfile(username);
  };

  const updateProfile = async (payload: UpdateProfilePayload) => {
    const username = getStoredUsername();
    if (!username) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }
    const safeUsername = encodeURIComponent(username);
    await api.put(`/users/${safeUsername}`, payload);
    await fetchProfile(username);
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      signup,
      logout,
      refreshProfile,
      updateProfile,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
