package com.example.sharestay.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
// 모든 예외를 통일된 방식으로 처리
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BannedUserException.class)
    public ResponseEntity<Map<String, String>> handleBannedUser(BannedUserException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of(
                        "error", "banned_user",
                        "message", ex.getMessage()
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleOtherExceptions(Exception ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                        "error", "unauthorized",
                        "message", ex.getMessage()
                ));
    }
}
