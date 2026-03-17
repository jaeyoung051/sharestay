package com.example.sharestay.dto;


import com.example.sharestay.entity.Host;
import com.example.sharestay.entity.User;
import lombok.Getter;

@Getter
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String username;
    private String nickname;
    private String role;    // String 기준

    private String introduction;
    private Boolean termsAgreed;

    private AuthResponse(String accessToken, String refreshToken, String username, String nickname, String role, String introduction, Boolean termsAgreed) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.username = username;
        this.nickname = nickname;
        this.role = role;
        this.introduction = introduction;
        this.termsAgreed = termsAgreed;
    }

    public static AuthResponse from(User user, Host host) {
        String accessToken = "fake-jwt-token-for-" + user.getUsername();
        String refreshToken = "fake-refresh-token";

        return new AuthResponse(
                accessToken,
                refreshToken,
                user.getUsername(),
                user.getNickname(),
                user.getRole(),
                host != null ? host.getIntroduction() : null,
                host != null && host.isTermsAgreed()
        );
    }
}
