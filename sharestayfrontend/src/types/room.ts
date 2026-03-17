const assetBaseUrl = (import.meta.env.VITE_BASE_URL ?? "").replace(/\/$/, "");

export const resolveRoomImageUrl = (value?: string | null) => {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  if (!assetBaseUrl) return value;
  const trimmed = value.startsWith("/") ? value.slice(1) : value;
  return `${assetBaseUrl}/${trimmed}`;
};

export interface RoomImageResponse {
  id: number;
  imageUrl: string;
}

export interface RoomImage {
  id?: number;
  imageId?: number;
  roomId?: number;
  imageUrl: string;
  isPrimary?: boolean;
}

export type RoomAvailabilityStatus = "AVAILABLE" | "UNAVAILABLE" | "PENDING";

export interface RoomSummary {
  roomId: number;
  id?: number | null;
  hostId?: number | null;
  hostUserId?: number | null;
  preferredGender?: string | null;
  preferredAge?: string | null;
  totalMembers?: number | null;
  lifestyle?: string[] | string | null;
  title: string;
  rentPrice: number;
  deposit? : number;
  address: string;
  type: string;
  latitude?: number;
  longitude?: number; 
  availabilityStatus: RoomAvailabilityStatus | number;
  description?: string;
  safetyScore?: number;
  trustScore?: number;
  tags?: string[];
  isFavorite?: boolean;   // ✅ 여길 실제로 채워줄 거임
  favoriteId?: number;
  options?: string[] | string | null;
  images?: RoomImage[];
  shareLinkUrl?: string;
  hostIntroduction?: string;
  hostNickname?: string | null;
}

export interface RoomRequestPayload {
  hostId: number;
  title: string;
  rentPrice: number;
  deposit : number;
  address: string;
  type: string;
  availabilityStatus: number;
  description: string;
  latitude: number | null;
  longitude: number | null;
  preferredGender?: string | null;
  preferredAge?: string | null;
  totalMembers?: number | null;
  options?: string[];
  lifestyle?: string[];
}


export interface RoomApiResponse {
  id: number;
  hostId?: number | null;
  hostUserId?: number | null;
  preferredGender?: string | null;
  preferredAge?: string | null;
  totalMembers?: number | null;
  lifestyle?: string[] | null;
  title: string;
  rentPrice: number;
  deposit? : number;
  address: string;
  type: string;
  availabilityStatus: number;
  description: string;
  latitude?: number;
  longitude?: number;
  options?: string | string[] | null;
  images: RoomImageResponse[];
  imageUrls?: string[];
  shareLinkUrl?: string | null;
  shareLink?: { linkUrl?: string | null };

  hostIntroduction?: string | null;
  hostNickname?: string | null;

  // ✅ 백엔드에서 좋아요 정보 내려줄 때 받을 용도
  isFavorite?: boolean;
  favoriteId?: number | null;
}

export interface RoomDetailApiResponse {
  id: number;
  hostId?: number | null;
  hostUserId?: number | null;
  preferredGender?: string | null;
  preferredAge?: string | null;
  totalMembers?: number | null;
  lifestyle?: string[] | null;
  title: string;
  rentPrice: number;
  deposit? : number;
  address: string;
  type: string;
  availabilityStatus: number;
  description: string;
  options?: string[] | string | null;
  latitude: number;
  longitude: number;
  images?: RoomImageResponse[];
  imageUrls?: string[];
  shareLinkUrl?: string | null;
  shareLink?: { linkUrl?: string | null };

  hostIntroduction?: string | null;
  hostNickname?: string | null;

  // ✅ 상세 API에도 옵션으로 붙을 수 있으니 같이 둠
  isFavorite?: boolean;
  favoriteId?: number | null;
}

export interface ShareLinkResponse {
  linkUrl: string;
}

export const mapRoomFromApi = (
  room: RoomApiResponse | RoomDetailApiResponse
): RoomSummary => {
  const rawRoomId = (room as any).roomId ?? room.id;
  const parsedRoomId = Number(rawRoomId);
  const roomId = Number.isFinite(parsedRoomId) ? parsedRoomId : room.id;

  const normalizedImages: RoomImage[] =
    room.images?.map((image) => ({
      id: image.id,
      imageId: image.id,
      roomId: roomId,
      imageUrl: resolveRoomImageUrl(image.imageUrl) ?? image.imageUrl ?? "",
    })) ??
    room.imageUrls?.map((url, index) => ({
      id: index,
      imageId: index,
      roomId: roomId,
      imageUrl: resolveRoomImageUrl(url) ?? url ?? "",
    })) ??
    [];

//  - 공유 링크를 백엔드가 아니라 프론트에서 직접 생성한다.
//  - 백엔드 ShareLink 기능(엔티티/서비스/컨트롤러)을 전부 주석 때문에
//  - 항상 /rooms/{roomId} 형태의 단순 URL만 사용하도록 강제함
  const shareLinkUrl =
  roomId ? `${window.location.origin}/rooms/${roomId}` : undefined;

  return {
    roomId: roomId,
    id: roomId ?? room.id,
    hostId: "hostId" in room ? room.hostId : undefined,
    hostUserId: "hostUserId" in room ? room.hostUserId : undefined,
    preferredGender: "preferredGender" in room ? room.preferredGender : undefined,
    preferredAge: "preferredAge" in room ? room.preferredAge : undefined,
    totalMembers: "totalMembers" in room ? room.totalMembers : undefined,
    lifestyle: "lifestyle" in room ? room.lifestyle : undefined,
    title: room.title,
    rentPrice: room.rentPrice,
    deposit: "deposit" in room ? room.deposit : undefined,
    address: room.address,
    type: room.type,
    availabilityStatus: room.availabilityStatus,
    latitude: "latitude" in room ? room.latitude : undefined,
    longitude: "longitude" in room ? room.longitude : undefined,
    description: room.description,
    options: "options" in room ? room.options : undefined,
    images: normalizedImages,
    shareLinkUrl,
    isFavorite: "isFavorite" in room ? room.isFavorite : undefined,
    favoriteId: "favoriteId" in room ? room.favoriteId ?? undefined : undefined,

    hostIntroduction:
          "hostIntroduction" in room ? room.hostIntroduction ?? undefined : undefined,
        hostNickname:
          "hostNickname" in room ? room.hostNickname ?? undefined : undefined,

    // hostIntroduction: "hostIntroduction" in room ? room.hostIntroduction ?? undefined : undefined,
    // hostNickname: "hostNickname" in room ? room.hostNickname ?? undefined : undefined,
  };
};
