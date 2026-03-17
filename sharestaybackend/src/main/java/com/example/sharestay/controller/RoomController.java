package com.example.sharestay.controller;

import com.example.sharestay.dto.RoomDetailResponse;
import com.example.sharestay.dto.RoomRequest;
import com.example.sharestay.dto.RoomResponse;
import com.example.sharestay.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@Tag(name = "Room API", description = "방 등록/조회/수정/삭제 API")
public class RoomController {

    private final RoomService roomService;

    @Operation(summary = "방 등록", description = "호스트가 방 기본 정보와 이미지 파일을 함께 등록합니다.")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RoomResponse> createRoom(
            @ModelAttribute RoomRequest request,
            @RequestParam(required = false) List<MultipartFile> files
    ) {
        RoomResponse response = roomService.createRoom(request, files);
        return ResponseEntity.ok(response);
    }

    // 메인 화면 간단 검색과 필터 검색 통합
    @Operation(summary = "방 검색", description = "지역, 유형, 가격 범위, 옵션 등 다양한 조건으로 방 목록을 검색합니다.")
    @GetMapping("/search")
    public ResponseEntity<List<RoomResponse>> searchRooms(   // 이건 검색 시
         @RequestParam(required = false) String region,     // 시/광역시 또는 구 단위까지 포함하는 지역명
         @RequestParam(required = false) String district,   // 하위 구/읍/면
         @RequestParam(required = false) String type,
         @RequestParam(required = false) Double minPrice,
         @RequestParam(required = false) Double maxPrice,
         @RequestParam(required = false) String option
    ) {
        return ResponseEntity.ok(
                roomService.searchRooms(region, district, type, minPrice, maxPrice, option)
        );
    }

    @Operation(summary = "방 전체 조회", description = "조건 없이 모든 방 목록을 반환합니다.")
    @GetMapping
    public ResponseEntity<List<RoomResponse>> getAllRooms() {
        List<RoomResponse> rooms = roomService.getRoomList();
        return ResponseEntity.ok(rooms);
    }


    @Operation(summary = "방 상세 조회", description = "특정 방의 상세 정보를 조회합니다.")
    @GetMapping("/{roomId}")
    public ResponseEntity<RoomDetailResponse> getRoomDetail(@PathVariable Long roomId) {
        return ResponseEntity.ok(roomService.getRoomDetail(roomId));
    }

    @Operation(summary = "내 방 관리", description = "특정 호스트가 등록한 방 목록을 조회합니다.")
    @GetMapping("/host/{hostId}")
    public ResponseEntity<List<RoomResponse>> getRoomsByHost(@PathVariable Long hostId) {
        List<RoomResponse> rooms = roomService.getRoomListByHost(hostId);
        return ResponseEntity.ok(rooms);
    }


    @Operation(summary = "방 정보 수정", description = "방 기본 정보를 수정합니다.")
    @PutMapping("/{roomId}")
    public ResponseEntity<RoomResponse> updateRoom(
            @PathVariable Long roomId,
            @RequestBody RoomRequest request
    ) {
        return ResponseEntity.ok(roomService.updateRoom(roomId, request));
    }


    @Operation(summary = "방 이미지 수정", description = "기존 이미지를 삭제하고 새 이미지로 교체합니다.")
    @PostMapping(value = "/{roomId}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> updateRoomImages(
            @PathVariable Long roomId,
            @RequestParam(required = false, name = "files") List<MultipartFile> files
    ) {
        // 이미지 선택 안 하고 저장 눌렀을 때 500에러 안 나게 그냥 OK 리턴
        if (files == null || files.isEmpty()) {
            return ResponseEntity.ok().build();
        }

        roomService.updateRoomImages(roomId, files);
        return ResponseEntity.ok().build();
    }




    @Operation(summary = "방 삭제", description = "특정 방을 삭제합니다.")
    @DeleteMapping("/{roomId}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long roomId) {
        roomService.deleteRoom(roomId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
