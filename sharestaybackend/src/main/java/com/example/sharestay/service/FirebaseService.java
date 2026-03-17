package com.example.sharestay.service;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Bucket;
import com.google.firebase.cloud.StorageClient;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
public class FirebaseService {

    private static final String BUCKET_NAME = "sharestay-4d2c6.firebasestorage.app"; // 다운받은 파일의 project_id와 동일

    /*
     * 🔥 Firebase Storage 파일 업로드
     * @param file 업로드할 파일
     * @return 업로드된 파일의 공개 URL
     */
    public String uploadFile(MultipartFile file) {
        try {
            // 파일명 생성 (UUID + 확장자 유지)
            String fileName = generateFileName(file.getOriginalFilename());

            // Firebase Storage bucket 가져오기
            Bucket bucket = StorageClient.getInstance().bucket(BUCKET_NAME);

            // 파일 업로드 (rooms 폴더 하위)
            Blob blob = bucket.create(
                    "rooms/" + fileName,     // 저장될 경로 (폴더/파일명)
                    file.getBytes(),
                    file.getContentType()
            );

            // 다운로드 가능한 public URL 생성
            String encodedFileName = URLEncoder.encode(blob.getName(), StandardCharsets.UTF_8);

            return "https://firebasestorage.googleapis.com/v0/b/"
                    + BUCKET_NAME
                    + "/o/"
                    + encodedFileName
                    + "?alt=media";

        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Firebase 파일 업로드 중 오류 발생", e);

        }
    }

    /**
     * 🔥 Firebase Storage 파일 삭제 (선택적 사용)
     */
    public void deleteFile(String fileUrl) {
        try {
            Bucket bucket = StorageClient.getInstance().bucket(BUCKET_NAME);

            // URL에서 파일 경로만 추출 (rooms/xxxx.jpg)
            String decodedPath = extractPathFromUrl(fileUrl);

            Blob blob = bucket.get(decodedPath);
            if (blob != null) {
                blob.delete();
            }
        } catch (Exception e) {
            throw new RuntimeException("Firebase 파일 삭제 중 오류 발생", e);
        }
    }

    // 유틸 메서드

    // UUID 기반 파일명 생성
    private String generateFileName(String originalName) {
        String ext = "";
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf("."));
        }
        return UUID.randomUUID() + ext;
    }

    // URL → Firebase 내부 경로로 변환
    private String extractPathFromUrl(String url) {
        String prefix = "o/";
        String suffix = "?alt=media";

        int start = url.indexOf(prefix) + prefix.length();
        int end = url.indexOf(suffix);

        return url.substring(start, end)
                .replace("%2F", "/");  // 인코딩된 경로 복원
    }
}


/*
    업로드 경로: rooms/{랜덤UUID}.{확장자}

리턴값: 실제 접속 가능한 이미지 URL

나중에 Storage 보안규칙에서 인증이 필요하게 바꾸면, URL 접근 정책도 같이 고려해야 함.
 */

//    public String uploadFile(MultipartFile file) {
//        // 실제 Firebase Storage 업로드 로직
//        // StorageReference ref = storage.getReference().child("rooms/" + file.getOriginalFilename());
//        // ref.putBytes(file.getBytes());
//        // return ref.getDownloadUrl().toString();
//
//        // 🔹 지금은 테스트용으로 더미 URL 반환
//        return "https://firebase.storage.fake/" + file.getOriginalFilename();
//    }