//package com.example.sharestay.entity;
//
//import jakarta.persistence.*;
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
//import java.util.UUID;
//
//@Entity
//@NoArgsConstructor(force = true)
//@AllArgsConstructor
//@Data
//public class ShareLink {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    @Column(nullable = false, updatable = false, name = "link_id")
//    private Long id;
//
//    // Room과 1:1 관계  (Room 데이터 저장, 삭제시 같이 저장, 삭제)
//    @OneToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "room_id", unique = true, nullable = false)
//    private Room room;
//
//    @Column(nullable = false, unique = true, name = "link_url")
//    private String linkUrl;
//
//    // 링크 자동 생성 로직 (roomId와 상관없이 UUID 기반)
//    @PrePersist
//    private void prePersist() {
//        if (this.linkUrl == null) {
//            this.linkUrl = "https://sharestay.com/share/" + UUID.randomUUID();
//        }
//    }
//
//}
