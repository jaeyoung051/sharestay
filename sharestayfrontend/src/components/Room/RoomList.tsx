import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  Typography,
  Stack,
  Button,
} from "@mui/material";
import type { RoomSummary } from "../../types/room";
import { resolveRoomImageUrl } from "../../types/room";

interface Props {
  rooms: RoomSummary[];
  selectedRoomId: number | null;
  hoveredRoomId: number | null;
  setSelectedRoomId: (id: number | null) => void;
  setHoveredRoomId: (id: number | null) => void;
  setIsFilterModalOpen: (open: boolean) => void;
}

const RoomList: React.FC<Props> = ({
  rooms,
  selectedRoomId,
  hoveredRoomId,
  setSelectedRoomId,
  setHoveredRoomId,
  setIsFilterModalOpen,
}) => {
  return (
    <Box
      sx={{
        width: 400,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        p: 2,
        overflowY: "hidden",
      }}
    >
      <Stack spacing={2}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">주변 방 목록</Typography>
          {selectedRoomId && (
            <Button
              size="small"
              variant="text"
              onClick={() => setSelectedRoomId(null)}
            >
              전체 보기
            </Button>
          )}
          <Button
            variant="outlined"
            size="small"
            onClick={() => setIsFilterModalOpen(true)}
          >
            필터
          </Button>
        </Box>
      </Stack>
      <Box sx={{ flex: "1 1 0", minHeight: 0, overflowY: "auto", pt: 1 }}>
        <List dense>
          {rooms.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="주변에 방이 없습니다."
                secondary="지도를 이동하거나 필터를 변경해보세요."
              />
            </ListItem>
          ) : (
            rooms.map((room) => {
              const roomId = room.id ?? room.roomId ?? null;
              if (roomId === null) return null;

              return [
              <ListItem
                key={roomId}
                disablePadding
                onMouseEnter={() => setHoveredRoomId(roomId)}
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
                  onClick={() => setSelectedRoomId(roomId)}
                  sx={{
                    borderLeft:
                      hoveredRoomId === roomId ? "4px solid #ffc107" : "none",
                    paddingLeft: hoveredRoomId === roomId ? "12px" : "16px",
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      variant="rounded"
                      src={resolveRoomImageUrl(room.images?.[0]?.imageUrl)}
                      alt={room.title}
                      sx={{ width: 56, height: 56, mr: 1 }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={room.title}
                    secondary={`${room.rentPrice.toLocaleString()}원 | ${
                      room.address
                    }`}
                  />
                </ListItemButton>
              </ListItem>,
              <Divider key={`divider-${roomId}`} component="li" />,
            ];
            })
          )}
        </List>
      </Box>
    </Box>
  );
};

export default RoomList;
