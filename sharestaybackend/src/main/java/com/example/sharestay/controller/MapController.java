package com.example.sharestay.controller;

import com.example.sharestay.dto.MapDto;
import com.example.sharestay.service.MapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/map")
@RequiredArgsConstructor
public class MapController {

    private final MapService mapService;

    @GetMapping("/rooms/near")
    public ResponseEntity<List<MapDto>> findRoomsNearby(
            // 프론트엔드에서 보내는 사각 경계 및 필터 파라미터
            @RequestParam("swLat") Double swLat,
            @RequestParam("swLng") Double swLng,
            @RequestParam("neLat") Double neLat,
            @RequestParam("neLng") Double neLng,
            @RequestParam(value = "minPrice", defaultValue = "0") double minPrice,
            @RequestParam(value = "maxPrice", defaultValue = "5000000") double maxPrice,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "options", required = false) List<String> options
    ) {
        // MapService의 새로운 메서드를 호출하여 결과를 받습니다.
        List<MapDto> rooms = mapService.getRoomsInBoundary(swLat, swLng, neLat, neLng, minPrice, maxPrice, type, options);
        return ResponseEntity.ok(rooms);
    }
}