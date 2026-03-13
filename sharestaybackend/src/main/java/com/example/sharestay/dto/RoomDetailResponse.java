package com.example.sharestay.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class RoomDetailResponse {
    private Long id;
    private String title;
    private double rentPrice;
    private int deposit;
    private String address;
    private String type;
    private int availabilityStatus;
    private String description;

    // 룸메이트 선호 추가
    private String preferredGender;
    private String preferredAge;
    private Integer totalMembers;

    private List<String> lifestyle;
    private List<String> options;
    private double latitude;
    private double longitude;
    private List<String> imageUrls;
//    private String shareLinkUrl;

    // 호스트 프로필로 들어가서 수정할 때 필요해서 추가
    private Long hostId;
    private Long hostUserId;

    private String hostIntroduction;
    private String hostNickname;
}
