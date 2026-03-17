import type { RoomAvailabilityStatus, RoomSummary } from "../types/room";

export type BackendRoomResponse = {
  id: number;
  title: string;
  rentPrice: number;
  address: string;
  type: string;
  availabilityStatus?: RoomAvailabilityStatus | number;
  description?: string;
};

export type ShareLinkResponse = {
  linkUrl: string;
};

export const adaptRoomResponse = (
  room: BackendRoomResponse
): RoomSummary => ({
  roomId: room.id,
  id: room.id,
  title: room.title ?? "",
  rentPrice: room.rentPrice ?? 0,
  address: room.address ?? "",
  type: room.type ?? "",
  availabilityStatus: room.availabilityStatus ?? "AVAILABLE",
  description: room.description,
  tags: [],
  options: [],
  images: [],
});

export const getRoomIdentifier = (
  room: Pick<RoomSummary, "roomId" | "id">
): number =>
  typeof room.roomId === "number"
    ? room.roomId
    : typeof room.id === "number"
      ? room.id
      : 0;
