// src/lib/favorites.ts
import { api } from "./api";
import type { FavoriteRoom } from "../types/favorite";

/**
 * 📌 즐겨찾기 목록 조회
 * - 반드시 userId가 존재할 때만 호출해야 함
 * - userId가 없으면 빈 배열 반환 (API 호출 불필요)
 */
export const fetchFavoriteRooms = async (userId: number | null | undefined) => {
  if (!userId) return []; // 로그인 이전에 호출되면 오류 방지

  const { data } = await api.get<FavoriteRoom[]>("/favorites/list", {
    params: { userId },
  });

  if (!Array.isArray(data)) return [];

  // roomId가 문자열로 내려오는 경우가 있어 숫자로 정규화
  return data.map((item) => {
    const parsed = Number(item.roomId);
    return {
      ...item,
      roomId: Number.isFinite(parsed) ? parsed : (item.roomId as number),
    };
  });
};

/**
 * 📌 즐겨찾기 토글 (추가/삭제)
 * - userId가 없으면 바로 종료 (undefined 방지)
 * - 백엔드는 query param 기반으로 동작하므로 body는 null로 보냄
 * - params로 userId, roomId만 전달하면 완벽히 정상 동작
 */
export const toggleFavoriteRoom = async (
  userId: number | null | undefined,
  roomId: number
) => {
  if (!userId) {
    alert("로그인 후 이용해주세요.");
    return;
  }

  await api.post(
    "/favorites/toggle",
    null, // body 필요 없음 (백엔드는 query param 사용)
    {
      params: { userId, roomId },
    }
  );
};
