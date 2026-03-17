package com.example.sharestay.controller;

import com.example.sharestay.dto.BanHistoryResponse;
import com.example.sharestay.dto.BanRequest;
import com.example.sharestay.dto.BanResponse;
import com.example.sharestay.service.BanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bans")
@RequiredArgsConstructor
public class BanController {
    private final BanService banService;

    /**
     * 사용자 정지 등록
     */
    @PostMapping("/users/{userId}")
    public ResponseEntity<BanResponse> banUser(@PathVariable Long userId, @RequestBody BanRequest request) {
        BanResponse response = banService.banUser(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 사용자 단위 정지 해제
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> unbanUser(@PathVariable Long userId) {
        banService.unbanUser(userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 개별 정지 ID로 해제
     */
    @DeleteMapping("/{banId}")
    public ResponseEntity<Void> unbanByBanId(@PathVariable Long banId) {
        banService.unbanByBanId(banId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 활성 정지 수정 (사유/만료일/메모)
     */
    @PatchMapping("/{banId}")
    public ResponseEntity<BanResponse> updateBan(@PathVariable Long banId, @RequestBody BanRequest request) {
        return ResponseEntity.ok(banService.updateBan(banId, request));
    }

    /**
     * 특정 사용자의 정지 기록 조회
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<List<BanResponse>> getBanHistory(@PathVariable Long userId) {
        List<BanResponse> history = banService.getBanHistory(userId);
        return ResponseEntity.ok(history);
    }

    /**
     * 특정 사용자의 정지 이력(변경/해제/재정지) 조회
     */
    @GetMapping("/users/{userId}/history")
    public ResponseEntity<List<BanHistoryResponse>> getBanHistoryLog(@PathVariable Long userId) {
        return ResponseEntity.ok(banService.getBanHistoryLog(userId));
    }

    /**
     * 전체 정지 기록 조회
     */
    @GetMapping
    public ResponseEntity<List<BanResponse>> getAllBans() {
        return ResponseEntity.ok(banService.getAllBans());
    }
}
