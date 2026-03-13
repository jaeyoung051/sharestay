package com.example.sharestay.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false, updatable = false, name = "user_id")
    private Long id;

    @Column(unique = true)
    private String username;

    @Column(nullable = false, name = "password_hash")
    private String password;

    @Column(nullable = false)
    private String loginType; // local or google

    @Column(nullable = false, unique = true)
    private String nickname;

    @Column(name = "address")
    private String address;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private Date signupDate;

    @Column(name = "life_style")
    private String lifeStyle;

    @PrePersist
    public void prePersist() {
        if (this.signupDate == null) {
            this.signupDate = new Date();
        }
    }

    public User(String username,
                String password,
                String loginType,
                String nickname,
                String address,
                String phoneNumber,
                String role,
                String lifeStyle) {
        this.username = username;
        this.password = password;
        this.loginType = loginType;
        this.nickname = nickname;
        this.address = address;
        this.phoneNumber = phoneNumber;
        this.role = role;
        this.lifeStyle = lifeStyle;
    }

    public static User createGoogleUser(String email) {
        return createGoogleUser(email, "");
    }

    public static User createGoogleUser(String email, String encodedPassword) {
        String safePassword = encodedPassword != null ? encodedPassword : "";
        User user = new User(email,
                safePassword,
                "google",
                "GoogleUser",
                null,
                "000-0000-0000",
                "GUEST",
                null);
        return user;
    }

    public boolean isBanned() {
        return false;
    }

}