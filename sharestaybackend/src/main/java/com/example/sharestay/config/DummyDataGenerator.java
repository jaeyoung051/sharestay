package com.example.sharestay.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.*;
import com.example.sharestay.entity.*;
import com.example.sharestay.repository.*;

@Component
@RequiredArgsConstructor
public class DummyDataGenerator {

    private final UserRepository userRepository;
    private final HostRepository hostRepository;
    private final RoomRepository roomRepository;

    private final Random random = new Random();

    /* ------------------------------------
        Firebase 이미지 리스트
    ------------------------------------- */
    private static final List<String> ROOM_IMAGES = List.of(
            "https://firebasestorage.googleapis.com/v0/b/sharestay-4d2c6.firebasestorage.app/o/rooms%2F3d-kwaejeoghan-dogseosil.jpg?alt=media&token=6aa1cc21-20e5-4bc6-b5b5-4552daecd01d",
            "https://firebasestorage.googleapis.com/v0/b/sharestay-4d2c6.firebasestorage.app/o/rooms%2F51edef840db1a.png?alt=media&token=720e627b-8d23-4e7e-8fa1-6bd748a83ad9",
            "https://firebasestorage.googleapis.com/v0/b/sharestay-4d2c6.firebasestorage.app/o/rooms%2Fliving-room-2732939_1280.jpg?alt=media&token=e2bf5e11-398c-4b87-80a1-28b988045d5f",
            "https://firebasestorage.googleapis.com/v0/b/sharestay-4d2c6.firebasestorage.app/o/rooms%2Fbedroom-416062_640.jpg?alt=media&token=e8d9aceb-72c4-4b22-93d6-885e51b7f5e9",
            "https://firebasestorage.googleapis.com/v0/b/sharestay-4d2c6.firebasestorage.app/o/rooms%2Fintelieo-sigmul-iissneun-minimeollijeum-chimdae.jpg?alt=media&token=7ac951f1-b017-4084-8d91-1e8feb5699a6",
            "https://firebasestorage.googleapis.com/v0/b/sharestay-4d2c6.firebasestorage.app/o/rooms%2Fkitchen-6916200_640.jpg?alt=media&token=5d616e87-bf0a-4ac8-8253-d8f3f40c7d5f",
            "https://firebasestorage.googleapis.com/v0/b/sharestay-4d2c6.firebasestorage.app/o/rooms%2Froom-boy-2132349_1280.jpg?alt=media&token=e9f7131f-4be7-4987-be4e-fe88a5d9b197",
            "https://firebasestorage.googleapis.com/v0/b/sharestay-4d2c6.firebasestorage.app/o/rooms%2Fhome-820389_1280.jpg?alt=media&token=e2d18205-4b4c-4200-a4d5-abe38d720185",
            "https://firebasestorage.googleapis.com/v0/b/sharestay-4d2c6.firebasestorage.app/o/rooms%2Fbedroom-1872196_1280.jpg?alt=media&token=78d11423-e245-4b8a-8bd0-54e31587c66c",
            "https://firebasestorage.googleapis.com/v0/b/sharestay-4d2c6.firebasestorage.app/o/rooms%2F%E1%84%8B%E1%85%A9%E1%84%89%E1%85%A7%E1%86%AB%E1%84%87%E1%85%B2.avif?alt=media&token=8c03acc3-3cd9-4b8b-b239-4e3813603333",
            "https://firebasestorage.googleapis.com/v0/b/sharestay-4d2c6.firebasestorage.app/o/rooms%2F%E1%84%80%E1%85%AA%E1%86%BC%E1%84%8B%E1%85%A1%E1%86%AB%E1%84%85%E1%85%B5%20%E1%84%87%E1%85%B2.avif?alt=media&token=b0a52fb2-b4ca-4778-b72f-552893f650b0"
    );

    /* ------------------------------------
        전국 시·도 중심 좌표
    ------------------------------------- */
    private static final Map<String, double[]> CITY_COORDS = Map.ofEntries(
            Map.entry("서울특별시", new double[]{37.5665, 126.9780}),
            Map.entry("부산광역시", new double[]{35.1796, 129.0756}),
            Map.entry("대구광역시", new double[]{35.8714, 128.6014}),
            Map.entry("인천광역시", new double[]{37.4563, 126.7052}),
            Map.entry("광주광역시", new double[]{35.1595, 126.8526}),
            Map.entry("대전광역시", new double[]{36.3504, 127.3845}),
            Map.entry("울산광역시", new double[]{35.5384, 129.3114}),
            Map.entry("세종특별자치시", new double[]{36.4800, 127.2890}),
            Map.entry("경기도", new double[]{37.4138, 127.5183}),
            Map.entry("강원도", new double[]{37.8228, 128.1555}),
            Map.entry("충청북도", new double[]{36.6357, 127.4913}),
            Map.entry("충청남도", new double[]{36.5184, 126.8000}),
            Map.entry("전라북도", new double[]{35.8205, 127.1087}),
            Map.entry("전라남도", new double[]{34.8161, 126.4630}),
            Map.entry("경상북도", new double[]{36.4919, 128.8889}),
            Map.entry("경상남도", new double[]{35.4606, 128.2132}),
            Map.entry("제주특별자치도", new double[]{33.4996, 126.5312})
    );

    /* ------------------------------------
        라이프스타일/옵션
    ------------------------------------- */
    private static final List<String> LIFESTYLE = List.of(
            "금연", "애완동물 없음", "조용한 생활", "사교적",
            "운동 좋아함", "요리 자주", "독서", "일찍 기상"
    );

    private static final List<String> OPTIONS = List.of(
            "에어컨", "세탁기", "냉장고", "TV",
            "주차장", "침대", "와이파이", "베란다"
    );

    /* ------------------------------------
        실행 시 자동 생성
    ------------------------------------- */
    @PostConstruct
    public void init() {
        if (roomRepository.count() > 0) return;

        System.out.println("===== DummyDataGenerator START =====");

        generateHosts(10);
        generateRoomsNationwide(2000);

        System.out.println("===== DummyDataGenerator END =====");
    }

    /* ------------------------------------
        HOST 생성
    ------------------------------------- */
    private void generateHosts(int count) {
        PasswordEncoder encoder = new BCryptPasswordEncoder();

        for (int i = 5; i <= count; i++) {
            User user = new User(
                    "host" + i + "@test.com",
                    encoder.encode("1234"),
                    "LOCAL",
                    "호스트" + i,
                    "대한민국",
                    "010-0000-" + (1000 + i),
                    "HOST",
                    "자동 생성된 호스트입니다."
            );
            userRepository.save(user);

            Host host = new Host(
                    "전국 자동 호스트 프로필입니다.",
                    true,
                    user
            );
            hostRepository.save(host);
        }
    }

    /* ------------------------------------
        전국 Room 생성
    ------------------------------------- */
    private void generateRoomsNationwide(int count) {

        List<Host> hosts = hostRepository.findAll();
        List<Room> rooms = new ArrayList<>();

        List<String> cityList = new ArrayList<>(CITY_COORDS.keySet());

        for (int i = 0; i < count; i++) {

            Host host = hosts.get(random.nextInt(hosts.size()));
            String city = cityList.get(random.nextInt(cityList.size()));

            double[] base = CITY_COORDS.get(city);

            double lat = base[0] + (random.nextDouble() - 0.5) * 0.4;
            double lng = base[1] + (random.nextDouble() - 0.5) * 0.4;

            Room room = new Room(
                    host,
                    city + " 쉐어하우스 " + (i + 1),
                    300000 + random.nextInt(400000),
                    city + " " + (random.nextInt(200) + 1) + "번지",
                    "원룸",
                    lat,
                    lng,
                    random.nextInt(3),
                    "자동 생성된 테스트 방입니다.",
                    1000000 + random.nextInt(4000000)
            );

            // 옵션 추가
            room.setOptions(
                    OPTIONS.get(random.nextInt(OPTIONS.size())) + ", " +
                            OPTIONS.get(random.nextInt(OPTIONS.size()))
            );

            // 라이프스타일 추가
            room.setLifestyleFromList(List.of(
                    LIFESTYLE.get(random.nextInt(LIFESTYLE.size())),
                    LIFESTYLE.get(random.nextInt(LIFESTYLE.size()))
            ));

            // Firebase 이미지 랜덤 추가
            int imgCount = 1 + random.nextInt(2); // 1~2장
            for (int j = 0; j < imgCount; j++) {
                String url = ROOM_IMAGES.get(random.nextInt(ROOM_IMAGES.size()));
                room.addRoomImage(url);
            }

            rooms.add(room);
        }

        roomRepository.saveAll(rooms);
    }
}
