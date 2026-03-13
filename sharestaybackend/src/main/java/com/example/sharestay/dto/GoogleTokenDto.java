package com.example.sharestay.dto;

import lombok.Getter;
import lombok.Setter;

// 클라이언트로부터 Google ID 토큰을 받기 위한 DTO
@Getter
public class GoogleTokenDto {
    // 프런트엔드에서 보낸 idToken 필드와 매핑됩니다.
    private String idToken;
}