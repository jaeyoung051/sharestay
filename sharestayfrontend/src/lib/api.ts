// src/lib/api.ts
import axios, { AxiosError } from "axios";

const ACCESS_TOKEN_KEY = "jwt";
const USERNAME_KEY = "auth_username";

// 백엔드 API와 통신하기 위한 axios 인스턴스를 생성합니다.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // ensure session cookies (e.g., OAuth/guest) are sent
});

// 세션 스토리지에 저장된 토큰/아이디를 관리하는 함수들
function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

function getStoredUsername() {
  return sessionStorage.getItem(USERNAME_KEY);
}

function setAccessToken(token: string | null) {
  if (token) sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  else sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

function setStoredUsername(username: string | null) {
  if (username) sessionStorage.setItem(USERNAME_KEY, username);
  else sessionStorage.removeItem(USERNAME_KEY);
}

function clearTokens() {
  setAccessToken(null);
  setStoredUsername(null);
}

// 모든 요청에 Authorization 헤더를 자동으로 붙입니다.
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && window.location.pathname !== "/login") {
      alert("인증이 만료되었거나 권한이 없습니다. 다시 시도하거나 로그인해 주세요.");
    }

    if (error.response?.status === 403) {
      // const message =
      //   (error.response.data as { message?: string } | undefined)?.message ??
      //   "정지된 계정입니다. 관리자에게 문의하세요.";
      // alert(message);
    }
    throw error;
  }
);

export {
  api,
  getAccessToken,
  setAccessToken,
  getStoredUsername,
  setStoredUsername,
  clearTokens,
};


// src/lib/api.ts
// import axios, { AxiosError } from "axios";

// const ACCESS_TOKEN_KEY = "jwt";
// const USERNAME_KEY = "auth_username";

// const api = axios.create({
// baseURL: import.meta.env.VITE_API_BASE,
// headers: { "Content-Type": "application/json-" },
// });

// // 토큰/유저정보 관리
// function getAccessToken() {
// return sessionStorage.getItem(ACCESS_TOKEN_KEY);
// }

// function getStoredUsername() {
// return sessionStorage.getItem(USERNAME_KEY);
// }

// function setAccessToken(token: string | null) {
// if (token) sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
// else sessionStorage.removeItem(ACCESS_TOKEN_KEY);
// }

// function setStoredUsername(username: string | null) {
// if (username) sessionStorage.setItem(USERNAME_KEY, username);
// else sessionStorage.removeItem(USERNAME_KEY);
// }

// function clearTokens() {
// setAccessToken(null);
// setStoredUsername(null);
// }

// // 요청 interceptor: JWT 자동 추가
// api.interceptors.request.use((config) => {
// const token = getAccessToken();
// if (token) config.headers.Authorization = `Bearer ${token}`;
// return config;
// });

// // 응답 interceptor: 401 처리 시 안전하게 분기
// api.interceptors.response.use(
// (response) => response,
// (error: AxiosError) => {
// const path = error.config?.url || "";


// // permitAll API 목록
// const publicPaths = ["/api/rooms", "/api/map", "/uploads", "/api/statistics"];
// const isPublicApi = publicPaths.some((p) => path.startsWith(p));

// if (error.response?.status === 401 && !isPublicApi) {
//   // 로그인 필요 API에서만 redirect
//   clearTokens();
//   if (window.location.pathname !== "/login") {
//     window.location.href = "/login";
//   }
// }

// throw error;


// }
// );

// export {
// api,
// getAccessToken,
// setAccessToken,
// getStoredUsername,
// setStoredUsername,
// clearTokens,
// };
