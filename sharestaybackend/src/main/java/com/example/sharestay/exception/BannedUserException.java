package com.example.sharestay.exception;
// 밴 계정 예외를 의미 있는 이름으로 분리
public class BannedUserException extends RuntimeException {
    public BannedUserException(String message) {
        super(message);
    }
}
