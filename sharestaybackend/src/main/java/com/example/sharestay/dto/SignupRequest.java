package com.example.sharestay.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignupRequest {
    // user
    private String username;
    private String password;
    private String nickname;
    private String address;
    private String phoneNumber;
    private String lifeStyle;
    private String role;


    // host
    private String hostIntroduction;
    private boolean hostTermsAgreed;
}
