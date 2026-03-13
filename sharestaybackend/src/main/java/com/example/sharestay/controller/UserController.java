package com.example.sharestay.controller;

import com.example.sharestay.dto.AuthResponse;
import com.example.sharestay.dto.SignupRequest;
import com.example.sharestay.dto.UpdateUserRequest;
import com.example.sharestay.dto.UserProfileResponse;
import com.example.sharestay.service.UserService;
import java.util.List;
import java.util.Map;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest request) {
        AuthResponse response = userService.signup(request);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN') or #email == authentication.name")
    @GetMapping("/users/{email}")
    public UserProfileResponse getUser(@PathVariable String email) {
        return userService.getUser(email);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public List<UserProfileResponse> getAllUser() {
        return userService.getAllUser();
    }

    @PreAuthorize("hasRole('ADMIN') or #email == authentication.name")
    @PutMapping("/users/{email}")
    public UserProfileResponse updateUser(@PathVariable String email, @RequestBody UpdateUserRequest request) {
        return userService.updateUser(email, request);
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(Map.of(
                "username", user.getUsername()
                // role 정보가 필요하면 UserDetailsService에서 권한 가져오는 방법 사용
        ));
    }


}