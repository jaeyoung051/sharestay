package com.example.sharestay.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "ban_history")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BanHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id", nullable = false, updatable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ban_id", nullable = false)
    private Ban ban;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 20)
    private String action; // CREATE, UPDATE, UNBAN, REBAN

    @Column(nullable = false, length = 255)
    private String reason;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(columnDefinition = "TEXT")
    private String memo;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    private BanHistory(Ban ban, User user, String action, String reason, LocalDateTime endDate, String memo) {
        this.ban = ban;
        this.user = user;
        this.action = action;
        this.reason = reason;
        this.endDate = endDate;
        this.memo = memo;
        this.createdAt = LocalDateTime.now();
    }

    public static BanHistory log(Ban ban, User user, String action, String reason, LocalDateTime endDate, String memo) {
        return new BanHistory(ban, user, action, reason, endDate, memo);
    }
}
