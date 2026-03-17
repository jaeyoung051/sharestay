package com.example.sharestay.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initialize() {
        try {
            // 파일 이름 그대로 넣기!!
            InputStream serviceAccount =
                    new ClassPathResource("sharestay-4d2c6-firebase-adminsdk-fbsvc-0ed9c968be.json")
                            .getInputStream();

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    // 🔥 Storage 버킷 이름은 Firebase 콘솔에 표시된 그대로 적기
                    .setStorageBucket("sharestay-4d2c6.firebasestorage.app")
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("🔥 Firebase initialized successfully!");
            }

        } catch (Exception e) {
            throw new IllegalStateException("❌ Firebase 서비스 키 파일을 찾을 수 없습니다.", e);
        }
    }
}
