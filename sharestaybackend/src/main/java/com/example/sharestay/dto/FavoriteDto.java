package com.example.sharestay.dto;

import com.example.sharestay.entity.Favorite;
import com.example.sharestay.dto.RoomImageResponse;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class FavoriteDto {
    private Long roomId;       // DB 참조용
    private String roomName;   // 프론트 표시용
    private List<RoomImageResponse> roomImg;    // 프론트 표시용
    private LocalDateTime likedAt;

    public FavoriteDto(Favorite favorite) {
        this.roomId = favorite.getRoom().getId();
        this.roomName = favorite.getRoom().getTitle();
        this.roomImg = favorite.getRoom().getRoomImages()
                .stream()
                .map(img -> new RoomImageResponse(img.getId(), img.getImageUrl()))
                .collect(Collectors.toList());
        this.likedAt = favorite.getLikedAt();
    }
}
