package com.example.sharestay.security;

import com.example.sharestay.entity.User;
import com.example.sharestay.exception.BannedUserException;
import com.example.sharestay.repository.UserRepository;
import com.example.sharestay.service.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.UUID;

@Component
@Slf4j
public class CustomSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${oauth2.success.redirect-url}")
    private String redirectUrl;

    public CustomSuccessHandler(JwtService jwtService,
                                UserRepository userRepository,
                                PasswordEncoder passwordEncoder) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        log.info("구글 로그인 석세스 핸들러 진입");  // 핸들러 진입 로그

        // 1️⃣ 인증 객체에서 이메일 가져오기
        String email = authentication.getName();   // 구글 로그인 시 이메일 반환

        userRepository.findByUsername(email)
                .orElseGet(() -> {
                    String encodedPassword = passwordEncoder.encode(UUID.randomUUID().toString());
                    return userRepository.save(User.createGoogleUser(email, encodedPassword));
                });
        // jwt 토큰 생성
        String accessToken = jwtService.generateAccessToken(email);
        String refreshToken = jwtService.generateRefreshToken(email);

        String redirectWithToken = UriComponentsBuilder
                .fromHttpUrl(redirectUrl)
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", refreshToken)
                .queryParam("username", email)
                .build(true)
                .toUriString();

        // 프론트로 리다이렉트
        response.sendRedirect(redirectWithToken);
    }
}
