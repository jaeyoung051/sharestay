// src/components/Room/hooks/useMap.ts
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { RoomSummary } from "../../../types/room";

interface UseMapParams {
  fetchRoomsNearby: (
    lat: number,
    lng: number,
    radiusKm: number
  ) => Promise<any>;
  rooms: RoomSummary[];
}

export function useMap({ fetchRoomsNearby, rooms }: UseMapParams) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const [error, setError] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  // -----------------------------
  // 1. 초기 지도 생성
  // -----------------------------
  const initializeMap = useCallback(() => {
    if (!window.kakao || !window.kakao.maps) {
      setError("카카오맵 SDK를 불러오지 못했습니다.");
      return;
    }

    window.kakao.maps.load(() => {
      const mapContainer = mapRef.current;
      if (!mapContainer) return;

      const handleMapIdle = () => {
        if (!mapInstanceRef.current) return;

        const map = mapInstanceRef.current;
        const center = map.getCenter();
        const bounds = map.getBounds();
        const ne = bounds.getNorthEast();

        // 반경 계산 (하버사인)
        const R = 6371;
        const lat1 = center.getLat() * (Math.PI / 180);
        const lat2 = ne.getLat() * (Math.PI / 180);
        const deltaLat = (ne.getLat() - center.getLat()) * (Math.PI / 180);
        const deltaLng = (ne.getLng() - center.getLng()) * (Math.PI / 180);

        const a =
          Math.sin(deltaLat / 2) ** 2 +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

        const radiusKm = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        fetchRoomsNearby(center.getLat(), center.getLng(), radiusKm);
      };

      const createMap = (center: any, level: number) => {
        const map = new window.kakao.maps.Map(mapContainer, { center, level });
        mapInstanceRef.current = map;

        window.kakao.maps.event.addListener(map, "idle", handleMapIdle);
        handleMapIdle(); // 첫 로딩 때 API 요청
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            createMap(
              new window.kakao.maps.LatLng(
                position.coords.latitude,
                position.coords.longitude
              ),
              5
            );
          },
          () => {
            setError("위치 정보를 가져올 수 없습니다. 기본 위치로 설정합니다.");
            createMap(new window.kakao.maps.LatLng(37.5665, 126.978), 5);
          }
        );
      } else {
        setError("브라우저가 위치 정보를 지원하지 않습니다.");
        createMap(new window.kakao.maps.LatLng(37.5665, 126.978), 5);
      }
    });
  }, [fetchRoomsNearby]);

  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  // -----------------------------
  // 2. 방 클릭 핸들러
  // -----------------------------
  const handleRoomItemClick = useCallback((room: RoomSummary) => {
    const roomId = room.id ?? room.roomId ?? null;
    if (roomId === null) return;
    setSelectedRoomId((prev) => (prev === roomId ? null : roomId));
  }, []);

  // -----------------------------
  // 3. 방 오버레이 생성
  // -----------------------------
  const overlays = useMemo(() => {
    if (!window.kakao || !rooms) return [];

    return rooms
      .map((room) => {
        if (!room.id || !room.latitude || !room.longitude) return null;

        const position = new window.kakao.maps.LatLng(
          room.latitude,
          room.longitude
        );
        const isSelected = selectedRoomId === room.id;

        const content = `
          <div 
            style="
              background:#fff;
              border:1px solid ${isSelected ? "#ff5722" : "#000"};
              color:${isSelected ? "#ff5722" : "#000"};
              padding:4px 8px;
              border-radius:4px;
              font-size:12px;
              font-weight:${isSelected ? 700 : 500};
              cursor:pointer;
              white-space:nowrap;
            "
          >
            ${room.rentPrice.toLocaleString()}원
          </div>
        `;

        const overlay = new window.kakao.maps.CustomOverlay({
          position,
          content,
          yAnchor: 1,
        }) as any;

        overlay.room = room;
        return overlay;
      })
      .filter((o): o is any => o !== null);
  }, [rooms, selectedRoomId]);

  // -----------------------------
  // 4. 오버레이 지도에 표시
  // -----------------------------
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!map._overlays) map._overlays = [];

    // 이전 오버레이 해제
    map._overlays.forEach((o: any) => o.setMap(null));
    map._overlays = [];

    // 새 오버레이 표시
    overlays.forEach((overlay: any) => {
      overlay.setMap(map);

      // 클릭 이벤트만 단순하게 바인딩
      overlay.a.onclick = () => handleRoomItemClick(overlay.room);

      map._overlays.push(overlay);
    });
  }, [overlays, handleRoomItemClick]);

  return {
    mapRef,
    error,
    selectedRoomId,
    setSelectedRoomId,
  };
}
