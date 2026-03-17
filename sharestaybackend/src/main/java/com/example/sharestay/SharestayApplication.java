package com.example.sharestay;


import com.example.sharestay.repository.FavoriteRepository;
import com.example.sharestay.repository.HostRepository;
import com.example.sharestay.entity.User;
import com.example.sharestay.repository.RoomRepository;
import com.example.sharestay.repository.UserRepository;
import com.example.sharestay.entity.*;


import com.example.sharestay.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;

@SpringBootApplication
@RequiredArgsConstructor
public class SharestayApplication implements CommandLineRunner {
    private final UserRepository userRepository;
    private final HostRepository hostRepository;
    private final RoomRepository roomRepository;
    private final FavoriteRepository favoriteRepository;
    private final RoomService roomService;

    public static void main(String[] args) {
        SpringApplication.run(SharestayApplication.class, args);
    }

    @Override
    public void run(String... args) {
        PasswordEncoder encoder = new BCryptPasswordEncoder();

        // 이미 초기 데이터 있으면 다시 안 넣기
        if (userRepository.existsByUsername("kim1@test.com")) {
            return;
        }

    /* -------------------------
       1. ADMIN 계정 2개
    -------------------------- */
        User admin1 = new User(
                "kim1@test.com",
                encoder.encode("user1234"),
                "LOCAL",
                "도하 킴",
                "인천, 대한민국",
                "010-1234-5678",
                "ADMIN",
                "금연 · 반려동물 없음 · 조용한 활동 선호"
        );
        userRepository.save(admin1);

        User admin2 = new User(
                "admin@test.com",
                encoder.encode("user1234"),
                "LOCAL",
                "관리자2",
                "서울, 대한민국",
                "010-2222-9999",
                "ADMIN",
                "시스템 운영 및 모니터링 담당 관리자 계정"
        );
        userRepository.save(admin2);


    /* -------------------------
       2. HOST 계정 3개
    -------------------------- */
        User hostUser1 = new User(
                "host1@test.com",
                encoder.encode("user1234챙ㄷ"),
                "LOCAL",
                "홍대 호스트",
                "서울 마포구",
                "010-1111-1111",
                "HOST",
                "깨끗한 방을 좋아하는 호스트입니다."
        );
        userRepository.save(hostUser1);

        User hostUser2 = new User(
                "host2@test.com",
                encoder.encode("user1234"),
                "LOCAL",
                "강남 호스트",
                "서울 강남구",
                "010-2222-1111",
                "HOST",
                "직장인과 장기 거주자를 선호합니다."
        );
        userRepository.save(hostUser2);

        User hostUser3 = new User(
                "host3@test.com",
                encoder.encode("user1234"),
                "LOCAL",
                "잠실 호스트",
                "서울 송파구",
                "010-3333-1111",
                "HOST",
                "교통과 치안을 중시하는 호스트입니다."
        );
        userRepository.save(hostUser3);

        User hostUser4 = new User(
                "host4@test.com",
                encoder.encode("user1234"),
                "LOCAL",
                "부산 호스트",
                "부산광역시 해운대구",
                "010-7777-1111",
                "HOST",
                "해운대 근처에서 다양한 숙소를 운영 중입니다."
        );
        userRepository.save(hostUser4);


    /* -------------------------
       3. GUEST 계정 3개
    -------------------------- */
        User guest1 = new User(
                "guest1@test.com",
                encoder.encode("user1234"),
                "LOCAL",
                "김게스트",
                "부산 해운대",
                "010-4444-4444",
                "GUEST",
                "조용한 환경과 청결한 방을 선호합니다."
        );
        userRepository.save(guest1);

        User guest2 = new User(
                "guest2@test.com",
                encoder.encode("user1234"),
                "LOCAL",
                "박여행",
                "대구 수성구",
                "010-5555-5555",
                "GUEST",
                "가성비 좋은 방을 선호합니다."
        );
        userRepository.save(guest2);

        User guest3 = new User(
                "guest3@test.com",
                encoder.encode("user1234"),
                "LOCAL",
                "최출장",
                "서울 노원구",
                "010-6666-5555",
                "GUEST",
                "주차 가능 숙소를 선호합니다."
        );
        userRepository.save(guest3);


    /* -------------------------
       4. Host 엔티티 3개
    -------------------------- */
        Host host1 = new Host(
                "홍대/합정 인근에서 조용하고 편안한 생활을 돕는 호스트입니다. " +
                        "주변에 카페와 맛집, 편의시설이 잘 갖춰져 있어 주말에는 여유롭게 쉬거나 산책하기 좋고, " +
                        "평일에는 조용히 공부하거나 재택근무를 하기에도 좋은 환경이에요. " +
                        "깨끗한 공간과 규칙적인 생활을 선호하는 분과 함께 지내고 싶습니다.",
                true,
                hostUser1
        );

        Host host2 = new Host(
                "강남역에서 도보 5분 거리에 위치한 깔끔하고 모던한 원룸에서 함께 살 룸메이트를 찾고 있습니다." +
                        " 최근 리모델링을 완료하여 매우 깨끗하며, 필요한 모든 가전제품이 구비되어 있습니다. 교통이 매우 편리하고 주변에 편의시설이 잘 갖춰져 있어 생활하기 좋습니다. " +
                        "깔끔하고 조용한 생활을 선호하는 20대 여성분을 찾고 있어요!",
                true,
                hostUser2
        );

        Host host3 = new Host(
                "잠실 일대의 야경과 쾌적한 주거 환경을 자랑하는 호스트입니다. " +
                        "석촌호수와 롯데월드몰이 가까워 여가 생활을 즐기기 좋고, 지하철과 버스 노선도 잘 발달되어 있어 " +
                        "출퇴근이나 등교에도 편리한 위치에 있어요. " +
                        "기본적인 생활 규칙을 서로 지키면서도 편하게 지낼 수 있는 룸메이트를 찾고 있습니다.",
                true,
                hostUser3
        );

        Host host4 = new Host(
                "부산 해운대/광안리 일대를 기반으로 편안한 숙소를 제공하는 호스트입니다. " +
                        "바다와 가까운 위치라 여유로운 분위기를 느끼실 수 있고, 카페와 맛집, 산책로가 잘 갖춰져 있어 " +
                        "휴식과 일상을 모두 만족시키기 좋은 공간이에요. " +
                        "바다를 좋아하고 기본적인 정리정돈을 함께 지켜 줄 룸메이트를 기다리고 있습니다.",
                true,
                hostUser4
        );

        hostRepository.save(host1);
        hostRepository.save(host2);
        hostRepository.save(host3);
        hostRepository.save(host4);


    /* -------------------------
       5. Room 6개 (호스트별로 분배)
          availabilityStatus:
          0 = 모집중, 1 = 예약중, 2 = 마감
    -------------------------- */

        // host1 방 2개
        Room room1 = new Room(
                host1,
                "홍대입구 근처 원룸",
                550000,
                "서울특별시 마포구 서교동 12-3",
                "원룸",
                37.557123,
                126.923456,
                0, // 모집중
                "깔끔하고 교통 좋은 원룸입니다.",
                2000000
        );
        room1.setOptions("에어컨, 냉장고, 세탁기, 엘리베이터");
        room1.setPreferredGender("여성");
        room1.setPreferredAge("20대");
        room1.setTotalMembers(2);
        room1.setLifestyleFromList(List.of("금연", "조용한 생활"));

        Room room2 = new Room(
                host1,
                "합정역 루프탑 사용 가능 쉐어하우스",
                450000,
                "서울특별시 마포구 합정동 321-8",
                "쉐어하우스",
                37.549911,
                126.914905,
                0, // 모집중
                "루프탑과 공용 라운지가 있는 합정 쉐어하우스입니다.",
                2500000
        );
        room2.setOptions("와이파이, TV, 주차장, 침대");
        room2.setPreferredGender("무관");
        room2.setPreferredAge("30대");
        room2.setTotalMembers(4);
        room2.setLifestyleFromList(List.of("사교적", "요리 자주"));

        // host2 방 2개
        Room room3 = new Room(
                host2,
                "강남역 도보 5분 원룸",
                300000,
                "서울특별시 강남구 역삼동 123-4",
                "원룸",
                37.497942,
                127.027621,
                1, // 예약중
                "강남역 인근 직장인에게 최적의 원룸입니다.",
                3500000
        );
        room3.setOptions("엘리베이터, 주차장, 와이파이, 책상");
        room3.setPreferredGender("여성");
        room3.setPreferredAge("20대");
        room3.setTotalMembers(2);
        room3.setLifestyleFromList(List.of("운동 좋아함", "조용한 생활"));

        Room room4 = new Room(
                host2,
                "건대입구역 풀옵션 원룸",
                450000,
                "서울특별시 광진구 화양동 22-10",
                "원룸",
                37.540408,
                127.069210,
                1, // 예약중
                "풀옵션(에어컨, 세탁기, 냉장고) 포함된 신축 원룸입니다.",
                3000000
        );

        room4.setOptions("에어컨, 냉장고, 세탁기, 엘리베이터, TV");
        room4.setPreferredGender("남성");
        room4.setPreferredAge("30대");
        room4.setTotalMembers(1);
        room4.setLifestyleFromList(List.of("금연", "일찍 기상"));

        // host3 방 2개
        Room room5 = new Room(
                host3,
                "신촌역 근처 투룸",
                400000,
                "서울특별시 서대문구 창천동 45-7",
                "투룸",
                37.559819,
                126.942308,
                2, // 마감
                "연세대/이대생에게 인기 많은 조용한 투룸입니다.",
                500000
        );
        room5.setOptions("에어컨, 세탁기, 인터넷, 보안시설");
        room5.setPreferredGender("여성");
        room5.setPreferredAge("20대");
        room5.setTotalMembers(3);
        room5.setLifestyleFromList(List.of("조용한 생활", "독서"));

        Room room6 = new Room(
                host3,
                "잠실새내역 오피스텔 원룸",
                350000,
                "서울특별시 송파구 잠실동 200-15",
                "오피스텔",
                37.511822,
                127.086554,
                2, // 마감
                "롯데월드, 잠실역 접근성 좋은 오피스텔 원룸입니다.",
                3000000
        );
        room6.setOptions("엘리베이터, 주차장, 와이파이, 침대");
        room6.setPreferredGender("남성");
        room6.setPreferredAge("30대");
        room6.setTotalMembers(2);
        room6.setLifestyleFromList(List.of("사교적", "운동 좋아함"));

        Room room7 = new Room(
                host4,
                "해운대 오션뷰 원룸",
                600000,
                "부산광역시 해운대구 우동 1400-1",
                "원룸",
                35.163054,
                129.163556,
                0,  // 모집중
                "바다가 보이는 오션뷰 원룸입니다.",
                5000000
        );
        room7.setOptions("에어컨, 세탁기, 냉장고, 주차장, 와이파이");
        room7.setPreferredGender("여성");
        room7.setPreferredAge("20대");
        room7.setTotalMembers(2);
        room7.setLifestyleFromList(List.of("금연", "운동 좋아함"));

        Room room8 = new Room(
                host4,
                "광안리 해변 도보 3분 투룸",
                550000,
                "부산광역시 수영구 광안해변로 203",
                "투룸",
                35.153215,
                129.118598,
                0,  // 모집중
                "광안리 바다가 보이는 투룸입니다.",
                5500000
        );
        room8.setOptions("에어컨, TV, 침대, 베란다, 엘리베이터");
        room8.setPreferredGender("무관");
        room8.setPreferredAge("30대");
        room8.setTotalMembers(4);
        room8.setLifestyleFromList(List.of("음악 감상", "사교적"));


        room1.addRoomImage("https://firebasestorage.googleapis.com/v0/b/sharestay-4d2c6.firebasestorage.app/o/rooms%2F3d-kwaejeoghan-dogseosil.jpg?alt=media&token=6aa1cc21-20e5-4bc6-b5b5-4552daecd01d");

        room2.addRoomImage("https://firebasestorage.googleapis.com/v0/b/sharestay-4d2c6.firebasestorage.app/o/rooms%2F51edef840db1a.png?alt=media&token=720e627b-8d23-4e7e-8fa1-6bd748a83ad9");
        room2.addRoomImage("https://firebasestorage.googleapis.com/v0/b/sharestay-4d2c6.firebasestorage.app/o/rooms%2Fliving-room-2732939_1280.jpg?alt=media&token=e2bf5e11-398c-4b87-80a1-28b988045d5f");

        room3.addRoomImage("https://firebasestorage.googleapis.com/v0/b/sharestay-4d2c6.firebasestorage.app/o/rooms%2Fbedroom-416062_640.jpg?alt=media&token=e8d9aceb-72c4-4b22-93d6-885e51b7f5e9");

        room4.addRoomImage("https://firebasestorage.googleapis.com/v0/b/sharestay-4d2c6.firebasestorage.app/o/rooms%2Fintelieo-sigmul-iissneun-minimeollijeum-chimdae.jpg?alt=media&token=7ac951f1-b017-4084-8d91-1e8feb5699a6");
        room4.addRoomImage("https://firebasestorage.googleapis.com/v0/b/sharestay-4d2c6.firebasestorage.app/o/rooms%2Fkitchen-6916200_640.jpg?alt=media&token=5d616e87-bf0a-4ac8-8253-d8f3f40c7d5f");

        room5.addRoomImage("https://firebasestorage.googleapis.com/v0/b/sharestay-4d2c6.firebasestorage.app/o/rooms%2Froom-boy-2132349_1280.jpg?alt=media&token=e9f7131f-4be7-4987-be4e-fe88a5d9b197");

        room6.addRoomImage("https://firebasestorage.googleapis.com/v0/b/sharestay-4d2c6.firebasestorage.app/o/rooms%2Fhome-820389_1280.jpg?alt=media&token=e2d18205-4b4c-4200-a4d5-abe38d720185");
        room6.addRoomImage("https://firebasestorage.googleapis.com/v0/b/sharestay-4d2c6.firebasestorage.app/o/rooms%2Fbedroom-1872196_1280.jpg?alt=media&token=78d11423-e245-4b8a-8bd0-54e31587c66c");

        room7.addRoomImage("https://firebasestorage.googleapis.com/v0/b/sharestay-4d2c6.firebasestorage.app/o/rooms%2F%E1%84%8B%E1%85%A9%E1%84%89%E1%85%A7%E1%86%AB%E1%84%87%E1%85%B2.avif?alt=media&token=8c03acc3-3cd9-4b8b-b239-4e3813603333");
        room8.addRoomImage("https://firebasestorage.googleapis.com/v0/b/sharestay-4d2c6.firebasestorage.app/o/rooms%2F%E1%84%80%E1%85%AA%E1%86%BC%E1%84%8B%E1%85%A1%E1%86%AB%E1%84%85%E1%85%B5%20%E1%84%87%E1%85%B2.avif?alt=media&token=b0a52fb2-b4ca-4778-b72f-552893f650b0");
        List<Room> rooms = Arrays.asList(room1, room2, room3, room4, room5, room6, room7, room8);
        roomRepository.saveAll(rooms);

        List<Room> roomList = new ArrayList<>();

        // 부산 전역 구 + 동 + 랜덤 위도/경도 범위
        Map<String, Object[]> REGION_DATA = new HashMap<>() {{
            put("부산진구", new Object[]{"부전동,전포동,가야동,당감동".split(","), 35.149, 35.175, 129.040, 129.070});
            put("해운대구", new Object[]{"우동,중동,좌동,송정동".split(","), 35.155, 35.230, 129.110, 129.190});
            put("동래구", new Object[]{"명륜동,온천동,사직동".split(","), 35.185, 35.215, 129.060, 129.100});
            put("남구", new Object[]{"대연동,용호동,문현동".split(","), 35.120, 35.150, 129.070, 129.105});
            put("수영구", new Object[]{"민락동,광안동,남천동".split(","), 35.135, 35.170, 129.100, 129.130});
            put("북구", new Object[]{"구포동,덕천동,화명동".split(","), 35.205, 35.265, 128.990, 129.030});
            put("사상구", new Object[]{"감전동,덕포동,주례동".split(","), 35.140, 35.180, 128.980, 129.020});
            put("사하구", new Object[]{"하단동,신평동,장림동".split(","), 35.070, 35.110, 128.960, 129.010});
            put("강서구", new Object[]{"명지동,신호동,대저동".split(","), 35.085, 35.210, 128.810, 128.960});
            put("연제구", new Object[]{"연산동".split(","), 35.170, 35.205, 129.060, 129.090});
            put("동구", new Object[]{"초량동,수정동".split(","), 35.125, 35.150, 129.040, 129.065});
            put("서구", new Object[]{"부민동,아미동".split(","), 35.085, 35.130, 129.010, 129.040});
            put("영도구", new Object[]{"봉래동,영선동".split(","), 35.060, 35.100, 129.040, 129.080});
            put("중구", new Object[]{"남포동,광복동".split(","), 35.095, 35.115, 129.025, 129.040});
            put("금정구", new Object[]{"장전동,구서동".split(","), 35.230, 35.285, 129.055, 129.110});
            put("기장군", new Object[]{"정관읍,일광읍,기장읍".split(","), 35.235, 35.330, 129.170, 129.260});
        }};

        String[] TYPES = {"ONE_ROOM", "TWO_ROOM", "OFFICETEL", "APARTMENT"};

//        for (int i = 1; i <= 200; i++) {
//            // 🔥 랜덤 구 선택
//            List<String> keys = new ArrayList<>(REGION_DATA.keySet());
//            String gu = keys.get((int) (Math.random() * keys.size()));
//
//            Object[] regionInfo = REGION_DATA.get(gu);
//
//            String[] dongs = (String[]) regionInfo[0];
//            double minLat = (double) regionInfo[1];
//            double maxLat = (double) regionInfo[2];
//            double minLng = (double) regionInfo[3];
//            double maxLng = (double) regionInfo[4];
//
//            String dong = dongs[(int) (Math.random() * dongs.length)];
//
//            double lat = minLat + Math.random() * (maxLat - minLat);
//            double lng = minLng + Math.random() * (maxLng - minLng);
//
//            String type = TYPES[(int) (Math.random() * TYPES.length)];
//
//            Room room19 = new Room(
//                    host1,
//                    gu + " " + dong + " 랜덤 방 " + i,
//                    300000 + (int)(Math.random() * 271) * 10000,
//                    "부산광역시 " + gu + " " + dong + " " + i + "-1",
//                    type,
//                    lat,
//                    lng,
//                    1 + (int)(Math.random() * 3),
//                    "부산 전역 랜덤 더미 데이터입니다."
//            );
//
//            roomList.add(room19);
//        }
//
//        roomRepository.saveAll(roomList);



    /* -------------------------
       6. Favorite 샘플
    -------------------------- */
        Favorite favorite1 = new Favorite();
        favorite1.setUser(guest1);
        favorite1.setRoom(room1);

        Favorite favorite2 = new Favorite();
        favorite2.setUser(guest2);
        favorite2.setRoom(room3);

        Favorite favorite3 = new Favorite();
        favorite3.setUser(guest3);
        favorite3.setRoom(room5);

        favoriteRepository.save(favorite1);
        favoriteRepository.save(favorite2);
        favoriteRepository.save(favorite3);


        // ⚠ 개발용: 더미 데이터에만 한 번 돌리고, 끝난 뒤에는 주석 처리해 두기
        //roomService.backfillShareLinks();
    }

}
