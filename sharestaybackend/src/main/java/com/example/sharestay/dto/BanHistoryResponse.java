package com.example.sharestay.dto;

import com.example.sharestay.entity.BanHistory;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class BanHistoryResponse {
    private final Long historyId;
    private final Long banId;
    private final Long userId;
    private final String action;
    private final String reason;
    private final LocalDateTime endDate;
    private final String memo;
    private final LocalDateTime createdAt;

    public BanHistoryResponse(BanHistory history) {
        this.historyId = history.getId();
        this.banId = history.getBan().getId();
        this.userId = history.getUser().getId();
        this.action = history.getAction();
        this.reason = history.getReason();
        this.endDate = history.getEndDate();
        this.memo = history.getMemo();
        this.createdAt = history.getCreatedAt();
    }

    public static BanHistoryResponse from(BanHistory history) {
        return new BanHistoryResponse(history);
    }
}
