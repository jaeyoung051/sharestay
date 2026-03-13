package com.example.sharestay.service;

import com.example.sharestay.entity.User;
import com.example.sharestay.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
//
//@Service
//@RequiredArgsConstructor
//@Slf4j
//public class CustomUserService extends DefaultOAuth2UserService {
//
//    private final UserRepository userRepository;
//
//    @Override
//    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
//        log.info("구글 로그인 진입");
//        // 1️⃣ Google에서 유저 정보 불러오기
//        OAuth2User oAuth2User = super.loadUser(userRequest);
//        Map<String, Object> attributes = oAuth2User.getAttributes();
//
//        // 2️⃣ 구글에서 가져온 정보에서 이메일과 이름 추출
//        // 수정 포인트: get("email")과 get("name") 반환값이 Object이므로 String으로 캐스팅
//        String email = (String) attributes.get("email");
//        String name = (String) attributes.get("name"); // name이 없을 수 있으므로 나중에 기본값 처리
//
//        // 3️⃣ DB 조회 (username = email)
//        // 기존: 단순 findByUsername
//        // 수정: 첫 로그인 시 새 유저 생성 및 기본값 세팅
//        User user = userRepository.findByUsername(email)
//                .orElseGet(() -> {
//                    // 3-1️⃣ 첫 로그인 → 새 유저 생성
//                    User newUser = User.createGoogleUser(email); // User 엔티티에 static 생성자 추가 필요
//
//                    // 3-2️⃣ 구글 닉네임 세팅, null 처리
//                    newUser.setNickname(name != null ? name : "GoogleUser");
//
//                    // 3-3️⃣ NOT NULL 필드 기본값 세팅
//                    newUser.setPhoneNumber("000-0000-0000");
//                    newUser.setAddress(null);
//                    newUser.setLifeStyle(null);
//
//                    // 3-4️⃣ DB 저장 후 반환
//                    return userRepository.save(newUser);
//                });
//
//        // 4️⃣ Security 인증 객체 반환
//        // attributes: OAuth2User 정보 그대로 전달
//        // 권한: ROLE_USER 또는 ROLE_ADMIN 등 DB에 있는 역할 반영
//        // nameAttributeKey: "email"로 설정해서 SecurityContextHolder에서 Principal 조회 가능
//        return new org.springframework.security.oauth2.core.user.DefaultOAuth2User(
//                java.util.List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole())),
//                attributes,
//                "email"
//        );
//    }
//}
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        log.info("구글 로그인 진입");

        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");

        User user = userRepository.findByUsername(email)
                .orElseGet(() -> {
                    String encodedPassword = passwordEncoder.encode(UUID.randomUUID().toString());
                    User newUser = User.createGoogleUser(email, encodedPassword);
                    if (name != null && !name.isBlank()) {
                        newUser.setNickname(name);
                    }
                    return userRepository.save(newUser);
                });

        return new org.springframework.security.oauth2.core.user.DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole())),
                attributes,
                "email"
        );
    }
}
