package com.example.sharestay.dto;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private String nickname;
    private String address;
    private String phoneNumber;
    private String lifeStyle;
    private String hostIntroduction;
}
