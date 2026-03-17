package com.example.sharestay.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "favorite",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "room_id"}))
@Getter
@Setter
public class Favorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "favorite_id", nullable = false, updatable = false)
    private Long id;

    // 한 명의 유저에 여러 Favorite이 있을 수 있다.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 한 방은 여러 Favorite에 참조될 수 있다(여러 유저가 즐겨찾기 가능).
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @CreationTimestamp      // 엔티티가 처음 DB에 저장될 때(persist) 자동으로 현재 시각을 createAt에 넣어줌.
    @Column(name = "liked_at", nullable = false, updatable = false)// updatable = false를 지정하면 한 번 생성된 값은 수정하지 못하도록 막아줌.
    private LocalDateTime likedAt;
}