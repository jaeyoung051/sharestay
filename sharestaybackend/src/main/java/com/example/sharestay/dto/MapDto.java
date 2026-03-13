package com.example.sharestay.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class MapDto {
    private Long roomId;
    private String title;
    private String address;
    private String type;
    private Double latitude;
    private Double longitude;
    private double rentPrice;
    private String availabilityStatus;
    private String description;
    private List<RoomImageResponse> images;
}