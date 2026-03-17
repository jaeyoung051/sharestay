package com.example.sharestay.dto;

import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {
    private Long id;
    private String username;
    private String nickname;
    private String address;
    private String phoneNumber;
    private String lifeStyle;
    private String role;
    private Date signupDate;
    private Long hostId;
    private String hostIntroduction;
    private Boolean hostTermsAgreed;
}
