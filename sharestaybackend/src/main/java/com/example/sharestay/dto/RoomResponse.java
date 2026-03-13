package com.example.sharestay.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {
    private Long id;
    private String title;
    private double rentPrice;
    private int deposit;
    private String address;
    private String type;
    private int availabilityStatus;
    private String description;
    private List<String> options;
    private List<String> lifestyle;
    private String preferredGender;
    private String preferredAge;
    private Integer totalMembers;
    private List<RoomImageResponse> images;
    //private String shareLinkUrl;
    private Long hostId;
    private Long hostUserId;
}
