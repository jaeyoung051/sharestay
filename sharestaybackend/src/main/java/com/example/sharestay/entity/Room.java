package com.example.sharestay.entity;

import com.example.sharestay.dto.RoomRequest;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Data
@Entity
@NoArgsConstructor(force = true)
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false, updatable = false, name = "room_id")
    private Long id;

    // host랑 관계 (host 클래스 만든 곳이랑 머지후 주석 풀기
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "host_id")
//    private final Host host;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private double rentPrice;   // 룸쉐어링 할 때의 가격

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String type;  // 원룸인지 투룸인지

    @Column
    private Double latitude;  // 위도

    @Column
    private Double longitude;     // 경도

    @Column(nullable = false)
    private int availabilityStatus;   // 수용 인원

    @Column(nullable = false)
    private String description;  // 상세 설명 같은 거..?

    // 룸메이트 조건
    @Column
    private String preferredGender;   // 선호 성별

    @Column
    private String preferredAge;      // 선호 연령대

    @Column
    private Integer totalMembers;     // 총 인원수

    // 생활 패턴 (콤마로 구분된 문자열)
    @Column(length = 500)
    private String lifestyle;

    // 필터 검색 안 돼서 추가함 (한 꺼번에 저장하고 프론트에 , 기준으로 땜)
    @Column(length = 500)
    private String options;  // 예: "에어컨, 냉장고, 세탁기"
    /*
        Application 에서 room.setOption으로 넣으면 프론트에서 이미 쓰고 있는 extractTags 함수가
        "에어컨, 냉장고, 세탁기"를 잘라서 [ "에어컨", "냉장고", "세탁기" ]로 만들어줌.
     */

    @Column(nullable = false)
    private int deposit;



//    // Room 이 저장될 때 함께 저장, 삭제 될 때 함께 삭제
//    @OneToOne(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
//    private ShareLink shareLink;
//
//    public void setShareLink(ShareLink shareLink) {
//        this.shareLink = shareLink;
//        if (shareLink != null && shareLink.getRoom() != this) {
//            shareLink.setRoom(this);  // 주인 쪽도 맞춰줌
//        }
//    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_id")
    private Host host;

    @JsonIgnoreProperties("room")    // RoomImage 클래스의 필드명이 room이기 때문
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoomImage> roomImages = new ArrayList<>();

    /*
        List<RoomImage> roomImages 초기화를 new ArrayList<>() 로 해두면 NPE 방지됨.

RoomImage와 ShareLink의 cascade 관계는 명확히 관리되지만, 순환참조 방지를 위해 @ToString.Exclude 추가 추천.
     */


    public Room(Host host, String title, double rentPrice, String address, String type,
                double latitude, double longitude, int availabilityStatus, String description, int deposit) {
        this.host = host;
        this.title = title;
                this.rentPrice = rentPrice;
        this.address = address;
        this.type = type;
        this.latitude = latitude;
        this.longitude = longitude;
        this.availabilityStatus = availabilityStatus;
        this.description = description;
        this.deposit = deposit;
    }

    // 업데이트 메서드 (RoomRequest 기반)
    public void update(RoomRequest request) {
        this.title = request.getTitle();
        this.rentPrice = request.getRentPrice();
        this.deposit = request.getDeposit();
        this.address = request.getAddress();
        this.type = request.getType();
        this.latitude = request.getLatitude();
        this.longitude = request.getLongitude();
        this.availabilityStatus = request.getAvailabilityStatus();
        this.description = request.getDescription();
        this.preferredGender = request.getPreferredGender();
        this.preferredAge = request.getPreferredAge();
        this.totalMembers = request.getTotalMembers();
        setOptionsFromList(request.safeOptions());
        setLifestyleFromList(request.safeLifestyle());
    }
    // update()로, 수정할 때 매번 필드를 하나하나 꺼내서 set 할 필요가 없음.
    // room.update(request) 하면 끝

    // RoomImage 더미데이터 때문에 만들어 놓은 거
    public void addRoomImage(String imageUrl) {
        RoomImage image = new RoomImage();  // Lombok @Data / @NoArgsConstructor 있으니까 기본 생성자 사용
        image.setImageUrl(imageUrl);
        image.setRoom(this);               // 역방향 연관관계 세팅
        this.roomImages.add(image);        // 컬렉션에 추가
    }

    // options 검색할 때 필요 문자열을 List 형태로 변환
    // DTO → 엔티티 저장할 때 사용
    public void setOptionsFromList(List<String> optionList) {
        if (optionList == null || optionList.isEmpty()) {
            this.options = null;    // 혹은 "" 로 통일해도 됨
        } else {
            this.options = optionList.stream()
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .distinct()
                    .collect(Collectors.joining(","));
        }
    }

    // 엔티티 → DTO 보낼 때 사용 (문자열 → 리스트)
    public List<String> getOptionsAsList() {
        if (options == null || options.isBlank()) {
            return List.of();
        }
        return Arrays.stream(options.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    // lifestyle 검색/응답용
    public void setLifestyleFromList(List<String> lifestyleList) {
        if (lifestyleList == null || lifestyleList.isEmpty()) {
            this.lifestyle = null;
        } else {
            this.lifestyle = lifestyleList.stream()
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .distinct()
                    .collect(Collectors.joining(","));
        }
    }

    public List<String> getLifestyleAsList() {
        if (lifestyle == null || lifestyle.isBlank()) {
            return List.of();
        }
        return Arrays.stream(lifestyle.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }


}
