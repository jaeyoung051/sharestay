package com.example.sharestay.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "ban")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Ban {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false, updatable = false, name = "ban_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 255)
    private String reason;

    @Column(name = "banned_at", nullable = false)
    private LocalDateTime bannedAt;

    @Column(name = "end_date")
    private LocalDateTime endDate; // null이면 영구

    @Column(name = "is_active")
    private boolean isActive;

    @Column(columnDefinition = "TEXT")
    private String memo;

    private Ban(User user, String reason, LocalDateTime endDate, String memo) {
        this.user = user;
        this.reason = reason;
        this.endDate = endDate;
        this.memo = memo;
    }

    public static Ban createBan(User user, String reason, LocalDateTime endDate, String memo) {
        return new Ban(user, reason, endDate, memo);
    }

    @PrePersist
    protected void onCreate() {
        this.bannedAt = LocalDateTime.now();
        this.isActive = true;
    }

    public void deactivate() {
        this.isActive = false;
    }

    public void activate(String reason, LocalDateTime endDate, String memo) {
        this.isActive = true;
        this.reason = reason;
        this.endDate = endDate;
        this.memo = memo;
        this.bannedAt = LocalDateTime.now();
    }

    public void update(String reason, LocalDateTime endDate, String memo) {
        if (reason != null && !reason.isBlank()) {
            this.reason = reason;
        }
        this.endDate = endDate;
        this.memo = memo;
    }
}
