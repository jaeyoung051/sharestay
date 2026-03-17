package com.example.sharestay.dto;

import com.example.sharestay.entity.Ban;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class BanResponse {
    private final Long banId;
    private final Long userId;
    private final String reason;
    private final LocalDateTime bannedAt;
    private final LocalDateTime endDate;
    private final boolean isActive;
    private final String memo;

    // 프런트에서 active 필드명으로도 받을 수 있게 별도 getter 제공
    @JsonProperty("active")
    public boolean getActive() {
        return isActive;
    }

    public BanResponse(Ban ban) {
        this.banId = ban.getId();
        this.userId = ban.getUser().getId();
        this.reason = ban.getReason();
        this.bannedAt = ban.getBannedAt();
        this.endDate = ban.getEndDate();
        this.isActive = ban.isActive();
        this.memo = ban.getMemo();
    }

    public static BanResponse from(Ban ban) {
        return new BanResponse(ban);
    }
}
