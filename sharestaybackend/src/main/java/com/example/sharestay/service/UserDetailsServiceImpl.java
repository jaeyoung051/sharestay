package com.example.sharestay.service;

import com.example.sharestay.entity.User;
import com.example.sharestay.repository.UserRepository;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.userdetails.User.UserBuilder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            throw new UsernameNotFoundException("User not found.");
        }

        User currentUser = userOpt.get();

        // ⭐ 핵심: 밴된 경우 인증 차단
        if (currentUser.isBanned()) {
            throw new DisabledException("User is banned.");
        }

        // username은 DB에 저장된 값(이메일) 그대로 사용하여 JWT의 sub와 일치시키고,
        // roles는 ROLE_ 접두어가 중복되지 않도록 정규화하며, 비어있을 경우 기본 GUEST로 지정한다.
        String normalizedRole = currentUser.getRole();
        if (normalizedRole != null && normalizedRole.startsWith("ROLE_")) {
            normalizedRole = normalizedRole.substring("ROLE_".length());
        }
        if (normalizedRole == null || normalizedRole.isBlank()) {
            normalizedRole = "GUEST";
        }

        UserBuilder builder = org.springframework.security.core.userdetails.User.withUsername(currentUser.getUsername());
        builder.password(currentUser.getPassword());
        builder.roles(normalizedRole);

        return builder.build();
    }
}
