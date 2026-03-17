package com.example.sharestay.controller;

import com.example.sharestay.dto.LoginRequest;
import com.example.sharestay.entity.Ban;
import com.example.sharestay.entity.User;
import com.example.sharestay.repository.UserRepository;
import com.example.sharestay.service.BanService;
import com.example.sharestay.service.JwtService;
import jakarta.persistence.EntityNotFoundException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class LoginController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final BanService banService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            // 1) 사용자 조회
            User user = userRepository.findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new EntityNotFoundException("User not found"));

            // 2) 정지 여부 확인
            Optional<Ban> activeBan = banService.getActiveBanByUserId(user.getId());
            if (activeBan.isPresent()) {
                Ban ban = activeBan.get();
                Map<String, Object> body = new HashMap<>();
//                body.put("message", "정지된 계정입니다.");
                body.put("banId", ban.getId());
                body.put("endDate", ban.getEndDate()); // null이면 영구정지로 간주
                body.put("permanent", ban.getEndDate() == null);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
            }

            // 3) 비밀번호 인증
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            String token = jwtService.generateToken(loginRequest.getUsername());
            return ResponseEntity.ok()
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .body(Map.of("accessToken", token));
        } catch (EntityNotFoundException | BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "아이디 또는 비밀번호가 올바르지 않습니다."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "로그인 처리 중 오류가 발생했습니다."));
        }
    }
}
