package com.example.sharestay.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class BanRequest {
    private String reason;
    private LocalDateTime expireAt; // 만료일 (null이면 영구)
    private String memo;
    private Boolean active; // null: 유지, true: 정지, false: 해제
}
