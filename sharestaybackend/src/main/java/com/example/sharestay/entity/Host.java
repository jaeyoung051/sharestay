package com.example.sharestay.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.*;

@Getter
@Setter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Host {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false, updatable = false, name = "host_id")
    private Long id;

    // host 소개
    @Column(nullable = false)
    private String introduction;

    // 정보 제공 동의
    @Column(nullable = false, name = "terms_agreed")
    private boolean termsAgreed;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
// 주석
    public Host(String introduction, boolean termsAgreed, User user) {
        this.introduction = introduction;
        this.termsAgreed = termsAgreed;
        this.user = user;
    }
}
