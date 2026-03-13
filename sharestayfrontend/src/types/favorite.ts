import { resolveRoomImageUrl } from "./room";

export interface FavoriteRoom {
  roomId: number;
  roomName: string;
  roomImg?: FavoriteRoomImage;
  likedAt?: string;
}

export type FavoriteRoomImage =
  | string
  | null
  | undefined
  | FavoriteRoomImageObject
  | Array<string | FavoriteRoomImageObject | null | undefined>;

interface FavoriteRoomImageObject {
  imageUrl?: string | null;
  url?: string | null;
  path?: string | null;
}

/**
 * Normalizes various image representations returned from the backend.
 */
export const extractFavoriteImageUrl = (
  source: FavoriteRoomImage
): string | undefined => {
  if (!source) return undefined;

  const tryResolve = (value?: string | null) => {
    if (!value) return undefined;
    return resolveRoomImageUrl(value);
  };

  if (typeof source === "string") {
    return tryResolve(source);
  }

  const list: Array<string | FavoriteRoomImageObject | null | undefined> = Array.isArray(source)
    ? source
    : [source];
  for (const candidate of list) {
    if (!candidate) continue;
    if (typeof candidate === "string") {
      const result = tryResolve(candidate);
      if (result) return result;
      continue;
    }
    const result =
      tryResolve(candidate.imageUrl) ??
      tryResolve(candidate.url) ??
      tryResolve(candidate.path);
    if (result) return result;
  }

  return undefined;
};
