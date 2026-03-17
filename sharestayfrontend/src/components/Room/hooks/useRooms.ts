// src/components/Room/hooks/useRooms.ts
import { useState, useCallback } from "react";
import axios from "axios";
import type { RoomSummary } from "../../../types/room";

const ACCESS_TOKEN_KEY = "jwt";

export const useRooms = (filters: {
  roomType: string;
  priceRange: number[];
  facilities: Set<string>;
}) => {
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoomsNearby = useCallback(
    async (
      lat: number,
      lng: number,
      radiusKm: number
    ): Promise<RoomSummary[]> => {
      setIsLoading(true);
      setError(null);
      try {
        const token = sessionStorage.getItem(ACCESS_TOKEN_KEY);
        const res = await axios.get("/api/map/rooms/near", {
          params: {
            lat,
            lng,
            radiusKm,
            minPrice: filters.priceRange[0],
            maxPrice: filters.priceRange[1],
            roomType: filters.roomType || undefined,
          },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        // API 응답이 { result: [...] } 형태일 수 있으므로, 실제 배열을 안전하게 추출합니다.
        const roomData = Array.isArray(res.data)
          ? res.data
          : res.data?.result ?? [];

        setRooms(roomData);
        return roomData;
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          setError("로그인이 필요합니다.");
        } else {
          const message =
            err instanceof Error ? err.message : "서버 오류";
          setError(message);
        }
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [filters]
  );

  return {
    rooms,
    isLoading,
    error,
    fetchRoomsNearby,
    setError,
  };
};
