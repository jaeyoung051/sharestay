import React, { useEffect, useRef, useState, useCallback, useMemo,} from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Alert, Paper, Select, MenuItem, Slider, TextField, Button, Typography, List, ListItem, ListItemText, Divider, ListItemButton, Stack, Chip, Modal, IconButton, Fab, ListItemAvatar, Avatar } from "@mui/material";
import SiteHeader from "../components/SiteHeader";
import CloseIcon from "@mui/icons-material/Close";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { api, getAccessToken } from "../lib/api";
import type { RoomSummary } from "../types/room";
import { useAuth } from "../auth/useAuth";
import { mapRoomFromApi, resolveRoomImageUrl, } from "../types/room";
import {
  provinces,
  provinceDistrictMap,
  roomTypeOptions,
  filterFacilities,
} from "../types/filters";
import fallbackImageSrc from "../img/no_img.jpg";
import { fetchFavoriteRooms, toggleFavoriteRoom } from "../lib/favorites";
import FavoriteButton from "../components/FavoriteButton";


const fallbackImage = fallbackImageSrc;

const RoomMap: React.FC = () => {
  const { user } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null); // 지도 인스턴스를 저장할 ref
  const geocoderRef = useRef<kakao.maps.services.Geocoder | null>(null); // 지오코더 인스턴스를 저장할 ref
  const clustererRef = useRef<kakao.maps.MarkerClusterer | null>(null); // 클러스터러 인스턴스 ref
  const navigate = useNavigate(); // useNavigate 훅 추가
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([]); // 오버레이 참조를 위한 ref
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<RoomSummary[]>([]);

  const defaultPriceRange: [number, number] = [0, 2000000];

  // Final filter states
  const [roomType, setRoomType] = useState<string>("");
  const [region, setRegion] = useState<string>(""); // 지역 필터 상태 추가
  const [district, setDistrict] = useState<string>(""); // 시/군/구 필터 상태 추가
  const [priceRange, setPriceRange] = useState<number[]>(defaultPriceRange);
  const [facilities, setFacilities] = useState<Set<string>>(new Set());
  
  const [searchQuery, setSearchQuery] = useState("");
  // 필터 모달을 위한 임시 상태
  const [tempRoomType, setTempRoomType] = useState<string>("");
  const [tempPriceRange, setTempPriceRange] = useState<number[]>(defaultPriceRange);
  const [tempFacilities, setTempFacilities] = useState<Set<string>>(new Set());
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null); // 선택된 방 ID 상태
  const [hoveredRoomId, setHoveredRoomId] = useState<number | null>(null); // 마우스 오버된 방 ID 상태
  const highlightOverlayRef = useRef<kakao.maps.CustomOverlay | null>(null); // 강조 효과 오버레이를 관리하기 위한 ref
  const districtOptions = useMemo(() => {
    return region ? provinceDistrictMap[region] ?? [] : [];
  }, [region]);

  const [modalRoom, setModalRoom] = useState<RoomSummary | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  const handleToggleFacility = (facility: string) => {
    setTempFacilities((prev) => {
      const next = new Set(prev);
      if (next.has(facility)) next.delete(facility);
      else next.add(facility);
      return next;
    });
  };
  
  const handlePriceChange = (_event: Event, newValue: number | number[]) => {
    setTempPriceRange(newValue as number[]);
  };
  
  useEffect(() => {
    if (!user?.id) {
      setFavorites(new Set());
      return;
    }

    const loadFavorites = async () => {
      const favList = await fetchFavoriteRooms(user.id);
      const next = new Set<number>();
      favList.forEach((f) => next.add(Number(f.roomId)));
      setFavorites(next);
    };
    loadFavorites();
  }, [user?.id]);
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) {
      setError("카카오맵 SDK를 불러오지 못했습니다.");
      setIsLoading(false);
      return;
    }
    const kakao = window.kakao;

    kakao.maps.load(() => {
      const mapContainer = mapRef.current;
      if (!mapContainer) return;

      // 지도 초기화 로직을 담당하는 함수
      const initializeMap = (lat: number, lng: number) => {
        const position = new window.kakao.maps.LatLng(lat, lng);
        const map = new window.kakao.maps.Map(mapContainer, {
          center: position,
          level: 4,
        });

        mapInstanceRef.current = map;
        geocoderRef.current = new window.kakao.maps.services.Geocoder();
        clustererRef.current = new window.kakao.maps.MarkerClusterer({
          map: map,
          averageCenter: true,
          minLevel: 7,
          minClusterSize:1,
          gridSize: 200, // 클러스터링 격자 크기를 120px로 설정 (기본값 60)
          // 클러스터의 스타일을 가격표처럼 보이게 수정
          styles: [
            {
              width: "60px",
              height: "30px",
              background: "rgba(36, 255, 54, 0.8)",
              borderRadius: "5px",
              color: "#fff",
              textAlign: "center",
              lineHeight: "30px",
              fontWeight: "bold",
              fontSize: "14px",
            },
          ],
        });

        window.kakao.maps.event.addListener(map, "idle", () => {
          if (mapInstanceRef.current) {
            const currentMap = mapInstanceRef.current;
            const center = currentMap.getCenter();
            fetchRoomsNearby(center.getLat(), center.getLng(), currentMap.getLevel());
          }
        });

        fetchRoomsNearby(lat, lng, map.getLevel());
      };

      // 1. 사용자의 현재 위치를 기반으로 지도 초기화
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            initializeMap(latitude, longitude);
          },
          () => {
            // 2. 위치 정보 가져오기 실패 시 기본 위치(서울)로 초기화
            setError("위치 정보를 가져올 수 없습니다. 기본 위치로 지도를 표시합니다.");
            initializeMap(37.5665, 126.978);
          }
        );
      } else {
        // 3. Geolocation을 지원하지 않을 때 기본 위치(서울)로 초기화
        setError("이 브라우저에서는 위치 정보를 지원하지 않습니다.");
        initializeMap(37.5665, 126.978);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 최초 렌더링 시에만 지도를 초기화합니다.

  const fetchRoomsNearby = useCallback(
    async (lat: number, lng: number, level: number) => {
      setIsLoading(true);
      setError(null);

      // 🔥 추가: 최대 확대 레벨(Zoom Level) 제한
      const MAX_ZOOM_LEVEL = 12; // 이 값보다 지도를 축소하면(값이 작아지면) 데이터 로드 안 함
      if (level > MAX_ZOOM_LEVEL) {
        setRooms([]); // 기존에 표시되던 방 목록을 비웁니다.
        setError("지도가 너무 축소되었습니다. 지도를 확대하여 주변 방을 검색하세요.");
        setIsLoading(false);
        return;
      }
      try {
        // 현재 지도 화면의 사각 경계를 가져옵니다.
        if (!mapInstanceRef.current) {
          console.warn(`Map instance missing for fetchRoomsNearby (lat:${lat}, lng:${lng}, level:${level})`);
          return; // mapInstanceRef.current가 null이 아님을 보장
        }
        const bounds = mapInstanceRef.current.getBounds();
        const sw = bounds.getSouthWest(); // 남서쪽 좌표
        const center = mapInstanceRef.current!.getCenter();
        const ne = bounds.getNorthEast(); // 북동쪽 좌표

        // API 요청 시 isFavorite 상태를 포함시키기 위해 favorites를 의존성 배열에 추가하고,
        // API 응답 처리 시 favorites Set을 참조하여 isFavorite을 설정합니다.
        const currentFavorites = new Set(favorites);
        if (user?.id) {
          // 로그인 상태일 때만 찜 목록을 다시 불러와서 최신화
        }

        // Haversine 공식을 사용하여 지도 중심에서 모서리까지의 거리를 계산합니다.
        const R = 6371; // 지구의 반지름 (km)
        const lat1 = center.getLat() * (Math.PI / 180);
        const lat2 = ne.getLat() * (Math.PI / 180);
        const deltaLat = (ne.getLat() - center.getLat()) * (Math.PI / 180);
        const deltaLng = (ne.getLng() - center.getLng()) * (Math.PI / 180);

        const a =
          Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
          Math.cos(lat1) *
            Math.cos(lat2) *
            Math.sin(deltaLng / 2) *
            Math.sin(deltaLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const radiusKm = R * c; // 계산된 반경 (km)

        const params: Record<string, string | number | string[] | undefined> = {
          swLat: sw.getLat(),
          swLng: sw.getLng(),
          neLat: ne.getLat(),
          neLng: ne.getLng(),
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          level, // API에 지도 레벨도 전달
          radiusKm,
        };
        if (roomType) {
          params.type = roomType;
        }
        if (region) {
          params.region = region;
        }
        if (district) {
          params.district = district;
        }
        if (facilities.size > 0) {
          params.options = Array.from(facilities);
        }

        const token = getAccessToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const { data } = await api.get("/map/rooms/near", {
          params,
          headers,
        });

        console.log("API 응답 데이터:", data); // [추가] API 응답을 콘솔에서 확인

        // API 응답이 배열이거나, data 또는 result 프로퍼티에 배열이 담겨오는 경우를 모두 처리합니다.
        const roomData = Array.isArray(data)
          ? data
          : data?.data && Array.isArray(data.data)
          ? data.data
          : data?.result ?? [];

        const initialRooms: RoomSummary[] = Array.isArray(roomData)
          ? roomData.map((apiRoom: any) => {
              const room = mapRoomFromApi(apiRoom);
              // mapRoomFromApi에서 id/roomId가 매핑되지 않는 경우를 대비해 항상 할당합니다.
              if (apiRoom.roomId !== undefined) {
                room.roomId = apiRoom.roomId;
                room.id = apiRoom.roomId;
                room.totalMembers = apiRoom.availabilityStatus;
                room.hostId = apiRoom.hostId;
              }

              // 찜 상태 반영
              if (room.id && currentFavorites.has(room.id)) {
                room.isFavorite = true;
              }

              return room;
            })
          : [];
          
          // 주소는 있지만 좌표가 없는 방들을 필터링하여 지오코딩합니다.
          const geocodingPromises = initialRooms
          .filter((room) => room.address && (!room.latitude || !room.longitude))
          .map((room) => {
            return new Promise<RoomSummary>((resolve) => {
              if (!geocoderRef.current) {
                resolve(room); // 지오코더가 없으면 원본 방 정보 반환
                return;
              }
              geocoderRef.current!.addressSearch(
                room.address,
                (result, status) => { // result: { x: string, y: string }[]
                  if (status === window.kakao.maps.services.Status.OK) {
                    // 검색 성공 시, 좌표를 추가하여 반환
                    resolve({
                      ...room,
                      latitude: parseFloat(result[0].y),
                      longitude: parseFloat(result[0].x),
                    });
                  } else {
                    // 검색 실패 시, 원본 방 정보 반환
                    resolve(room);
                  }
                }
              );
            });
          });

        const geocodedRooms = await Promise.all(geocodingPromises);
        console.log(
          "Geocoded Rooms (with new coords):",
          geocodedRooms.filter((r) => r.latitude && r.longitude)
        );

        // ID를 기준으로 중복된 방을 제거합니다.
        const uniqueRooms = Array.from(
          new Map(
            [...initialRooms, ...geocodedRooms]
              .filter((room) => room.id)
              .map((room) => [room.id, room])
          ).values()
        );

        setRooms(uniqueRooms);
        console.log("매핑된 방 목록:", uniqueRooms);
      } catch (err) {
        console.error("주변 방 정보 로딩 실패:", err); // [추가] 실제 에러를 콘솔에 출력
        setError("주변 방 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false); // 로딩 상태를 finally 블록에서 해제
      }
    },
    [priceRange, roomType, region, district, facilities, user, favorites] // 의존성 배열에 region, district 추가
  );

  const handleRoomItemClick = useCallback(
    (clusterOrRoom: RoomSummary[] | RoomSummary) => {
      const representativeRoom = Array.isArray(clusterOrRoom) ? clusterOrRoom[0] : clusterOrRoom;

      if (!representativeRoom?.roomId) return;

      // 이미 선택된 마커를 다시 클릭하면 선택 해제
      if (selectedRoomId === representativeRoom.id) {
        setSelectedRoomId(null);
      } else {
        // 새로운 마커를 클릭하면 선택
        setSelectedRoomId(representativeRoom.roomId);
      }
    },
    [selectedRoomId] // selectedRoomId가 변경될 때마다 함수를 새로 만들어 최신 상태를 참조하도록 합니다.
  );

  const handleGoToMyLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const myPosition = new window.kakao.maps.LatLng(latitude, longitude);
          const map = mapInstanceRef.current;
          if (map) {
            map.panTo(myPosition);
            // 지도 이동 후, 해당 위치의 방들을 즉시 검색합니다.
            fetchRoomsNearby(latitude, longitude, map.getLevel());
          }
        },
        () => {
          alert("현재 위치를 가져올 수 없습니다.");
        }
      );
    } else {
      alert("이 브라우저에서는 위치 정보를 지원하지 않습니다.");
    }
  }, [fetchRoomsNearby]);

  // 지도 이동 및 데이터 로딩 로직을 통합한 함수
  const panToLocationAndFetch = useCallback((lat: number, lng: number) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const newPos = new window.kakao.maps.LatLng(lat, lng);
    setSelectedRoomId(null); // 새로운 위치로 이동 시 선택 해제
    map.panTo(newPos);
    // panTo는 비동기적으로 동작하므로, idle 이벤트를 기다리지 않고 즉시 fetch를 호출하여 빠른 피드백을 제공합니다.
    fetchRoomsNearby(lat, lng, map.getLevel());
  }, [fetchRoomsNearby]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const clusterer = clustererRef.current;
    if (!clusterer) return;

    // 1. 기존 오버레이와 클러스터러 초기화
    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];
    clusterer.clear();

    // 2. 좌표가 있는 방들만 필터링하여 커스텀 오버레이 생성
    const newOverlays = rooms
      .filter((room) => room.latitude && room.longitude)
      .map((room) => {
        const position = new window.kakao.maps.LatLng(
          room.latitude!,
          room.longitude!
        );
        const priceText = `${room.rentPrice.toLocaleString()}원`;

        const content = `<div style="
          padding: 5px 10px;
          background-color: ${selectedRoomId === room.id ? '#ff5722' : 'white'};
          color: ${selectedRoomId === room.id ? 'white' : 'black'};
          border: 1px solid ${selectedRoomId === room.id ? '#ff5722' : '#aaa'};
          border-radius: 5px;
          font-size: 12px;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        ">${priceText}</div>`;

        const overlay = new window.kakao.maps.CustomOverlay({
          position,
          content,
          yAnchor: 1,
        });

        // 오버레이 클릭 이벤트
        (overlay.a as HTMLElement).onclick = () => {
          handleRoomItemClick(room);
        };

        return overlay;
      });

    // 3. 클러스터러에 오버레이들 추가 (addMarkers 대신 addMarker 사용)
    clusterer.addMarkers(newOverlays);
    overlaysRef.current = newOverlays;

  }, [rooms, handleRoomItemClick, selectedRoomId]);

  // Pulsing animation을 위한 keyframes를 style 태그로 주입
  useEffect(() => {
    const styleId = "pulsing-animation-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.7; }
          70% { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(0.95); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // 선택 또는 호버 변경 시 하이라이트 원을 업데이트하는 useEffect
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // 이전 하이라이트가 있으면 먼저 제거
    if (highlightOverlayRef.current) {
      highlightOverlayRef.current.setMap(null);
    }

    const highlightId = selectedRoomId ?? hoveredRoomId;
    if (!highlightId) {
      return;
    }

    // 하이라이트할 방 찾기
    const roomToHighlight = rooms.find((room) => room.id === highlightId);

    if (roomToHighlight?.latitude && roomToHighlight?.longitude) {
      const isSelected = roomToHighlight.id === selectedRoomId;

      const content = document.createElement("div");
      content.style.width = "100px";
      content.style.height = "30px";
      content.style.borderRadius = "8px"; // 둥근 사각형
      content.style.backgroundColor = isSelected
        ? "rgba(255, 87, 34, 0.3)"
        : "rgba(128, 128, 128, 0.4)";
      content.style.animation = "pulse 1.5s infinite ease-out";

      const newHighlightOverlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(
          roomToHighlight.latitude,
          roomToHighlight.longitude
        ),
        content: content,
        yAnchor: 1, // 마커와 동일한 yAnchor로 위치 보정
        xAnchor: 0.5,
        zIndex: -1, // 마커 뒤에 표시되도록 z-index 설정
      });

      newHighlightOverlay.setMap(mapInstanceRef.current);
      highlightOverlayRef.current = newHighlightOverlay;
    }
  }, [selectedRoomId, hoveredRoomId, rooms]); // rooms가 변경될 때도 원을 다시 그려야 할 수 있음

  // 지도 컨테이너 resize 대응
  useEffect(() => {
    const observer = new ResizeObserver(() => mapInstanceRef.current?.relayout());
    if(mapRef.current) observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, []);

  // 필터 모달 열기
  const openFilterModal = () => {
    // 모달을 열 때 현재 필터 상태를 임시 상태로 복사
    setTempRoomType(roomType);
    setTempPriceRange(priceRange);
    setTempFacilities(new Set(facilities));
    setIsFilterModalOpen(true);
  };

  const handleApplyFilter = () => {
    // 임시 상태를 실제 필터 상태로 적용
    setRoomType(tempRoomType);
    setPriceRange(tempPriceRange);
    setFacilities(tempFacilities);
    setSelectedRoomId(null); // 필터 적용 시 선택 해제
    setIsFilterModalOpen(false);

    // fetchRoomsNearby는 필터 상태(roomType, priceRange 등)가 변경되면
    // 의존성 배열에 의해 자동으로 호출되므로 여기서 직접 호출할 필요가 없습니다.
    // 단, 지도 이동 없이 필터만 변경하는 경우를 위해 수동 호출이 필요할 수 있습니다.
    // 현재 fetchRoomsNearby의 의존성 배열이 이를 처리하므로 추가 호출은 생략합니다.
  };

  const handleResetFilter = () => {
    // 임시 상태와 실제 필터 상태를 모두 기본값으로 초기화
    const newFacilities = new Set<string>();
    setTempRoomType("");
    setTempPriceRange(defaultPriceRange);
    setTempFacilities(newFacilities);
    setRoomType("");
    setPriceRange(defaultPriceRange);
    setFacilities(newFacilities);

    setSelectedRoomId(null); // 필터 초기화 시 선택 해제
    setIsFilterModalOpen(false);
  };

  const handleSearch = () => {
    if (!searchQuery || !window.kakao) return;

    new window.kakao.maps.services.Places().keywordSearch(
      searchQuery,
      (data, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          panToLocationAndFetch(Number(data[0].y), Number(data[0].x));
          setSearchQuery(""); // 검색 후 검색창 내용 초기화
        } else {
          setError("검색 결과가 없습니다.");
        }
      }
    );
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const formatPriceLabel = (value: number) => {
    return value >= 2000000 ? '200만+' : (value === 0 ? '0원' : `${value / 10000}만`);
  };

  // '좋아요' 상태를 업데이트하는 헬퍼 함수 (중복 제거)
  const updateFavoriteStatus = (roomId: number, isLiked: boolean) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      isLiked ? next.add(roomId) : next.delete(roomId);
      return next;
    });
    setRooms((prevRooms) =>
      prevRooms.map((r) =>
        r.id === roomId ? { ...r, isFavorite: isLiked } : r
      )
    );
  };

  // ⭐ 추가: 좋아요 토글
  const handleToggleFavorite = async (roomId: number, nextLiked?: boolean) => {
    if (!user?.id) {
      alert("로그인이 필요합니다.");
      return;
    }

    const roomNum = Number(roomId);
    if (!roomNum) return;

    if (isFavoriteLoading) return;

    const isLiked = favorites.has(roomNum);
    const targetLiked = typeof nextLiked === "boolean" ? nextLiked : !isLiked;
    const currentlyLiked = !targetLiked;

    // UI 즉시 반영
    updateFavoriteStatus(roomNum, targetLiked);

    // 서버 반영
    setIsFavoriteLoading(true);
    try {
      await toggleFavoriteRoom(user.id, roomNum);
    } catch (err) {
      console.error("찜하기 처리 중 오류:", err);
      updateFavoriteStatus(roomNum, currentlyLiked); // 에러 발생 시 원래 상태로 롤백
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
  };

  const RoomDetailModal: React.FC<{
    room: RoomSummary | null;
    onClose: () => void;
    onNavigate: (roomId: number) => void;
  }> = ({ room, onClose, onNavigate}) => {
    if (!room) return null;

    const isLiked = room
      ? favorites.has(room.roomId) || room.isFavorite === true
      : false;

    const imageUrl = resolveRoomImageUrl(room.images?.[0]?.imageUrl);

    return (
      <Modal
        open={!!room}
        onClose={onClose}
        aria-labelledby="room-detail-modal-title"
      >
        <Box sx={modalStyle}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              id="room-detail-modal-title"
              variant="h6"
              component="h2"
            >
              방 정보 요약
            </Typography>
            <IconButton onClick={onClose} sx={{ p: 0.5 }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Stack spacing={2}>
            {imageUrl && (
              <Box
                component="img"
                src={imageUrl}
                alt={room.title}
                sx={{
                  width: "100%",
                  height: 200,
                  objectFit: "cover",
                  borderRadius: 2,
                }}
              />
            )}

            <Typography variant="h5" fontWeight={700}>
              {room.title}
            </Typography>
            <Typography variant="h6" color="primary">
              {room.rentPrice.toLocaleString()}원/월
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {room.address}
            </Typography>

            {room.description && (
              <Typography variant="body2" noWrap textOverflow="ellipsis">
                {room.description}
              </Typography>
            )}

            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
              {room.id && (
                <Box sx={{ mb: 'auto' }}>
                  <FavoriteButton
                    roomId={room.roomId}
                    isLiked={isLiked}
                    onToggle={() => handleToggleFavorite(room.roomId)}
                  />
                </Box>
              )}
              <Button variant="outlined" onClick={onClose}>
                닫기
              </Button>
              <Button
                variant="contained"
                onClick={() => room.id && onNavigate(room.id)}
                disabled={!room.id}
              >
                상세 페이지로 이동
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Modal>
    );
  };

  // 목록에 표시할 방 목록을 결정합니다.
  const displayedRooms = useMemo(() => {
    if (selectedRoomId) {      
      const selectedRoom = rooms.find((room) => room.id === selectedRoomId);
      return selectedRoom ? [selectedRoom] : [];
    }
    return rooms;
  }, [rooms, selectedRoomId]);

  // 무한 스크롤을 위한 상태 및 로직
  const ROOMS_PER_PAGE = 15; // 한 번에 불러올 방의 개수
  const [visibleCount, setVisibleCount] = useState(ROOMS_PER_PAGE);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // displayedRooms 데이터가 변경되면 스크롤 카운트를 초기화
  useEffect(() => {
    setVisibleCount(ROOMS_PER_PAGE);
  }, [displayedRooms]);

  // IntersectionObserver를 사용하여 무한 스크롤 구현
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < displayedRooms.length) {
          setVisibleCount((prev) => prev + ROOMS_PER_PAGE);
        }
      },
      { threshold: 1.0 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [visibleCount, displayedRooms]);
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <SiteHeader activePath="/rooms" />
      <Box
        component="main"
        sx={{
          display: "flex",
          flexDirection: "row",
          height: "calc(100vh - 65px)", // 전체 화면 높이에서 헤더 높이(약 65px)를 뺌
        }}
      >
        {/* 왼쪽 패널 */}
        <Paper
          elevation={3}
          sx={{
            width: 400,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            p: 2,
            overflowY: "hidden", // 전체 패널 스크롤 방지
          }}
        >
          <Stack spacing={2}>
            {/* 지역 검색 */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                label="지역/지하철 검색"
                variant="outlined"
                size="small"
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                sx={{ whiteSpace: "nowrap" }}
              >
                검색
              </Button>
            </Box>

            {/* 주변 방 목록 헤더 및 필터 버튼 */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 2,
                mb: 1,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6">주변 방 목록</Typography>
                {displayedRooms.length > 0 && (
                  <Chip label={`총 ${displayedRooms.length}개`} size="small" />
                )}
                {selectedRoomId && (
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setSelectedRoomId(null)}
                    sx={{ ml: 1 }}
                  >
                    전체 보기
                  </Button>
                )}
              </Stack>
              <Button
                variant="outlined"
                size="small"
                onClick={openFilterModal}
              >
                필터
              </Button>
            </Box>
          </Stack>
          {/* 주변 방 목록 */}
          <Box sx={{ flex: "1 1 0", minHeight: 0, overflowY: "auto", pt: 1 }}>
            <List dense>
              {displayedRooms.slice(0, visibleCount).length === 0 ? (
                <ListItem key="no-rooms-found">
                  <ListItemText
                    primary="주변에 방이 없습니다."
                    secondary="지도를 이동하거나 필터를 변경해보세요."
                  />
                </ListItem>
              ) : (
                displayedRooms.slice(0, visibleCount).map((room) => {
                  const roomId = room.id ?? room.roomId ?? null;
                  if (roomId === null) return null;

                  return (
                    <React.Fragment key={roomId}>
                      <ListItem
                        id={`room-item-${roomId}`}
                        disablePadding
                        onMouseEnter={() => setHoveredRoomId(room.roomId)}
                        onMouseLeave={() => setHoveredRoomId(null)}
                        sx={{
                          backgroundColor:
                            selectedRoomId === roomId || hoveredRoomId === roomId
                              ? "action.hover"
                              : "transparent",
                          transition: "background-color 0.3s",
                        }}
                      >
                        <ListItemButton
                          sx={{
                            borderLeft:
                              hoveredRoomId === roomId
                                ? "4px solid #ffc107"
                                : "none",
                            paddingLeft:
                              hoveredRoomId === roomId ? "12px" : "16px",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                            width="100%"
                          >
                            <Box
                              component="img"
                              src={room.images?.[0]?.imageUrl ?? fallbackImage}
                              alt={room.title}
                              onClick={() => setModalRoom(room)}
                              sx={{
                                width: 170,
                                height: 150,
                                borderRadius: 2,
                                objectFit: "cover",
                                flexShrink: 0,
                                cursor: "pointer",
                              }}
                            />
                            <Box
                              sx={{
                                flexGrow: 1,
                                position: "relative",
                                alignSelf: "stretch",
                              }}
                            >
                              <ListItemText
                                primary={room.title}
                                secondary={`${room.rentPrice.toLocaleString()}원 | ${
                                  room.address
                                }`}
                                onClick={() => setModalRoom(room)}
                                sx={{ cursor: "pointer", height: "100%" }}
                              />
                            </Box>
                            <Box onClick={(e) => e.stopPropagation()}>
                              <FavoriteButton
                                roomId={room.roomId}
                                isLiked={favorites.has(room.roomId)}
                                onToggle={() => handleToggleFavorite(room.roomId)}
                              />
                            </Box>
                          </Stack>
                        </ListItemButton>
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  );
                })
              )}
            </List>
            {/* 무한 스크롤 감지를 위한 로더 엘리먼트 */}
            {visibleCount < displayedRooms.length && (
              <Box ref={loaderRef} sx={{ height: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            )}
          </Box>
        </Paper>
        {/* 오른쪽 지도 영역 */}
        <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
          <Box ref={mapRef} sx={{ width: "100%", height: "100%" }} />
          <Fab
            color="primary"
            aria-label="go to my location"
            sx={{ position: "absolute", bottom: 24, right: 24 }}
            onClick={handleGoToMyLocation}
          >
            <MyLocationIcon />
          </Fab>
        </Box>
        {(isLoading || error) && (
          <Box position="absolute" top={80} right={16} p={2} zIndex={1000}>
            {isLoading && <CircularProgress />}
            {error && (
              <Alert severity="warning" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
          </Box>
        )}
        <RoomDetailModal
          room={modalRoom}
          onClose={() => setModalRoom(null)}
          onNavigate={(roomId) => navigate(`/rooms/${roomId}`)}
        />
        {/* 필터 모달 */}
        <Modal
          open={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          aria-labelledby="filter-modal-title"
        >
          <Box sx={modalStyle}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography id="filter-modal-title" variant="h6" component="h2">
                필터
              </Typography>
              <IconButton
                onClick={() => setIsFilterModalOpen(false)}
                sx={{ p: 0.5 }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Stack spacing={3}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  지역
                </Typography>
                <Select
                  value={region}
                  onChange={(e) => {
                    setRegion(e.target.value);
                    setDistrict(""); // 지역 변경 시 시/군/구 초기화
                  }}
                  fullWidth
                  size="small"
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>지역 전체</em>
                  </MenuItem>
                  {provinces.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>

              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  시/군/구
                </Typography>
                <Select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  fullWidth
                  size="small"
                  displayEmpty
                  disabled={!region} // 지역이 선택되어야 활성화
                >
                  <MenuItem value="">
                    <em>구/읍/면 전체</em>
                  </MenuItem>
                  {districtOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  방 종류
                </Typography>
                <Select
                  value={tempRoomType}
                  onChange={(e) => setTempRoomType(e.target.value)}
                  fullWidth
                  size="small"
                  displayEmpty
                >
                  {roomTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>

              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  가격 범위
                </Typography>
                <Slider
                  value={tempPriceRange}
                  onChange={handlePriceChange}
                  valueLabelDisplay="auto"
                  valueLabelFormat={formatPriceLabel} // 툴팁 포맷 적용
                  min={0}
                  max={2000000}
                  step={10000}
                />
                <Typography variant="caption" color="text.secondary">
                  {formatPriceLabel(tempPriceRange[0])} ~{" "}
                  {formatPriceLabel(tempPriceRange[1])}
                </Typography>
              </Stack>

              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  편의시설
                </Typography>
                <Stack spacing={1} flexWrap="wrap" direction="row" useFlexGap>
                  {filterFacilities.map((facility) => (
                    <Chip
                      key={facility}
                      label={facility}
                      variant={
                        tempFacilities.has(facility) ? "filled" : "outlined"
                      }
                      color={
                        tempFacilities.has(facility) ? "primary" : "default"
                      }
                      onClick={() => handleToggleFacility(facility)}
                      sx={{
                        borderRadius: 2,
                      }}
                    />
                  ))}
                </Stack>
              </Stack>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 1,
                  mt: 2,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={handleResetFilter}
                  fullWidth
                >
                  초기화
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleApplyFilter}
                  fullWidth
                >
                  적용
                </Button>
              </Box>
            </Stack>
          </Box>
        </Modal>
      </Box>
      {/* 필요하면 나중에 지도 아래에 리스트 붙일 수 있음 */}
      {/* <SiteFooter /> */}
    </Box>
  );

};

export default RoomMap;
