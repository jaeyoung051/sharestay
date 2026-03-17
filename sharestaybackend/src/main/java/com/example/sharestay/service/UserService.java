package com.example.sharestay.service;

import com.example.sharestay.entity.Host;
import com.example.sharestay.repository.HostRepository;
import com.example.sharestay.entity.User;
import com.example.sharestay.repository.UserRepository;
import com.example.sharestay.dto.AuthResponse;
import com.example.sharestay.dto.SignupRequest;
import com.example.sharestay.dto.UpdateUserRequest;
import com.example.sharestay.dto.UserProfileResponse;
import com.example.sharestay.security.SecurityUtils;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final HostRepository hostRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }

        User user = new User(
                request.getUsername(),
                passwordEncoder.encode(request.getPassword()),
                "LOCAL",
                request.getNickname(),
                request.getAddress(),
                request.getPhoneNumber(),
                request.getRole(),
                request.getLifeStyle()
        );

        User savedUser = userRepository.save(user);
        Host host = null;

        if ("HOST".equalsIgnoreCase(request.getRole())) {
            if (request.getHostIntroduction() == null || request.getHostIntroduction().isEmpty()) {
                throw new RuntimeException("호스트 소개를 입력해 주세요.");
            }
            if (!request.isHostTermsAgreed()) {
                throw new RuntimeException("호스트 약관에 동의해야 합니다.");
            }

            host = new Host(request.getHostIntroduction(), request.isHostTermsAgreed(), savedUser);
            hostRepository.save(host);
        }

        return AuthResponse.from(savedUser, host);
    }

    public UserProfileResponse getUser(String username) {
        assertSelfOrAdmin(username);
        User user = loadUserEntity(username);
        return toResponse(user);
    }

    public List<UserProfileResponse> getAllUser() {
        assertAdmin();
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public UserProfileResponse updateUser(String username, UpdateUserRequest request) {
        assertSelfOrAdmin(username);
        User user = loadUserEntity(username);

        if (request.getNickname() != null) {
            user.setNickname(request.getNickname());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getLifeStyle() != null) {
            user.setLifeStyle(request.getLifeStyle());
        }

        handleHostUpdate(user, request);

        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    private void handleHostUpdate(User user, UpdateUserRequest request) {
        if (request.getHostIntroduction() == null || request.getHostIntroduction().isBlank()) {
            return;
        }
        if (!"HOST".equalsIgnoreCase(user.getRole()) && !SecurityUtils.isAdmin()) {
            throw new AccessDeniedException("호스트 정보는 호스트 계정만 수정할 수 있습니다.");
        }
        Host host = hostRepository.findByUser(user).orElseGet(() -> new Host("", true, user));

        host.setIntroduction(request.getHostIntroduction());
        hostRepository.save(host);
    }

    private User loadUserEntity(String username) {
        Optional<User> user = userRepository.findByUsername(username);
        return user.orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }

    private UserProfileResponse toResponse(User user) {
        Host host = hostRepository.findByUser(user).orElse(null);
        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getNickname(),
                user.getAddress(),
                user.getPhoneNumber(),
                user.getLifeStyle(),
                user.getRole(),
                user.getSignupDate(),
                host != null ? host.getId() : null,
                host != null ? host.getIntroduction() : null,
                host != null ? host.isTermsAgreed() : false
        );
    }

    private void assertSelfOrAdmin(String username) {
        if (SecurityUtils.isAdmin()) {
            return;
        }
        String currentUser = SecurityUtils.getCurrentUsername();
        if (currentUser == null || !currentUser.equalsIgnoreCase(username)) {
            throw new AccessDeniedException("본인 정보에 대해서만 접근할 수 있습니다.");
        }
    }

    private void assertAdmin() {
        if (!SecurityUtils.isAdmin()) {
            throw new AccessDeniedException("관리자 권한이 필요합니다.");
        }
    }
}
