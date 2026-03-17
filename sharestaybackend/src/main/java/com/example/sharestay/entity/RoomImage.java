package com.example.sharestay.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor(force = true)
@Data
@JsonIgnoreProperties("room") // 순환 참조 방지
public class RoomImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false, updatable = false, name = "image_id")
    private Long id;

    // 1:N
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @Column(nullable = false)
    private String imageUrl;

    public RoomImage(Room room, String imageUrl) {
        this.room = room;
        this.imageUrl = imageUrl;
    }
}
