package com.example.sharestay.service;

import com.example.sharestay.dto.MapDto;
import com.example.sharestay.dto.RoomImageResponse;
import com.example.sharestay.entity.Room;
import com.example.sharestay.repository.RoomRepository;
import lombok.Data;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@Data
public class MapService {

    private final RoomRepository roomRepository;

    // 전체 방 지도 정보 조회
    public List<MapDto> getAllRoomsForMap() {
        return roomRepository.findAll().stream()
                .map(room -> MapDto.builder()
                        .roomId(room.getId())
                        .title(room.getTitle())
                        .address(room.getAddress())
                        .type(room.getType())
                        .latitude(room.getLatitude())
                        .longitude(room.getLongitude())
                        .rentPrice(room.getRentPrice())
                        .availabilityStatus(availabilityStatusToString(room.getAvailabilityStatus()))
                        .description(room.getDescription())
                        .images(room.getRoomImages().stream()
                                .map(img -> new RoomImageResponse(img.getId(), img.getImageUrl()))
                                .collect(Collectors.toList()))
                        .build())
                .toList();
    }

    // 특정 좌표 기준 근처 방 조회 (거리 km 기준)
    public List<MapDto> getRoomsNearLocation(double userLat, double userLng, double radiusKm) {
        List<Room> rooms = roomRepository.findRoomsNearLocation(userLat, userLng, radiusKm);

        return rooms.stream()
                .map(room -> MapDto.builder()
                        .roomId(room.getId())
                        .title(room.getTitle())
                        .address(room.getAddress())
                        .type(room.getType())
                        .latitude(room.getLatitude())
                        .longitude(room.getLongitude())
                        .rentPrice(room.getRentPrice())
                        .availabilityStatus(availabilityStatusToString(room.getAvailabilityStatus()))
                        .description(room.getDescription())
                        .images(room.getRoomImages().stream()
                                .map(img -> new RoomImageResponse(img.getId(), img.getImageUrl()))
                                .collect(Collectors.toList()))
                        .build())
                .toList();
    }

    // 지도 경계 기반 근처 방 조회 (사각형 기준)
    public List<MapDto> getRoomsInBoundary(
            Double swLat, Double swLng, Double neLat, Double neLng,
            Double minPrice, Double maxPrice, String type, List<String> options
    ) {
        // 1. DB 1차 필터 (여기서 이미 null 좌표 포함된 상태로 가져옴)
        List<Room> rooms = roomRepository.findRoomsInBoundary(
                swLat, swLng, neLat, neLng, minPrice, maxPrice
        );

        // 2. 서비스에서 추가 필터 적용
        List<Room> filteredRooms = rooms.stream()
                .filter(room ->
                        type == null ||
                                type.isEmpty() ||
                                room.getType().equalsIgnoreCase(type)
                )
                .filter(room -> {
                    if (options == null || options.isEmpty()) return true;
                    String description = room.getDescription() != null ? room.getDescription() : "";
                    return options.stream().allMatch(description::contains);
                })
                .collect(Collectors.toList());

        // 3. DTO 변환
        return filteredRooms.stream()
                .map(room -> MapDto.builder()
                        .roomId(room.getId())
                        .title(room.getTitle())
                        .address(room.getAddress())
                        .type(room.getType())
                        .latitude(room.getLatitude())
                        .longitude(room.getLongitude())
                        .rentPrice(room.getRentPrice())
                        .availabilityStatus(availabilityStatusToString(room.getAvailabilityStatus()))
                        .description(room.getDescription())
                        .images(room.getRoomImages().stream()
                                .map(img -> new RoomImageResponse(img.getId(), img.getImageUrl()))
                                .collect(Collectors.toList()))
                        .build())
                .toList();
    }

    // int 상태 코드를 String으로 변환
    private String availabilityStatusToString(int status) {
        return switch (status) {
            case 0 -> "모집중";
            case 1 -> "예약중";
            case 2 -> "마감";
            default -> "알 수 없음";
        };
    }

    // 특정 방 지도 정보 조회
    public MapDto getRoomMapInfo(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("해당 방이 없습니다."));

        return MapDto.builder()
                .roomId(room.getId())
                .title(room.getTitle())
                .address(room.getAddress())
                .type(room.getType())
                .latitude(room.getLatitude())
                .longitude(room.getLongitude())
                .rentPrice(room.getRentPrice())
                .availabilityStatus(availabilityStatusToString(room.getAvailabilityStatus()))
                .description(room.getDescription())
                .images(room.getRoomImages().stream()
                        .map(img -> new RoomImageResponse(img.getId(), img.getImageUrl()))
                        .collect(Collectors.toList()))
                .build();
    }
}
