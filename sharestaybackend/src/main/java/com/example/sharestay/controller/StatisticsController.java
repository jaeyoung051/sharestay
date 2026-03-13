package com.example.sharestay.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    /**
     * Temporary public endpoint so the frontend can render safety stats
     * without requiring authentication. Replace with real data source later.
     */
    @GetMapping("/safety")
    public ResponseEntity<List<Map<String, Object>>> getSafetyStatistics(
            @RequestParam(defaultValue = "3") int limit
    ) {
        List<Map<String, Object>> sample = new ArrayList<>();
        sample.add(Map.of(
                "district", "서울",
                "safetyScore", 85,
                "trustScore", 90,
                "activityScore", 78,
                "crimeRate", "낮음",
                "cctvDensity", "높음",
                "trend", "안정적"
        ));
        sample.add(Map.of(
                "district", "부산",
                "safetyScore", 72,
                "trustScore", 70,
                "activityScore", 65,
                "crimeRate", "보통",
                "cctvDensity", "중간",
                "trend", "완만한 개선"
        ));
        sample.add(Map.of(
                "district", "대전",
                "safetyScore", 68,
                "trustScore", 66,
                "activityScore", 60,
                "crimeRate", "보통",
                "cctvDensity", "중간",
                "trend", "변동 적음"
        ));

        int size = sample.size();
        int safeLimit = Math.max(1, Math.min(limit, size));
        return ResponseEntity.ok(sample.subList(0, safeLimit));
    }
}
