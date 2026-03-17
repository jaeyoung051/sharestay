package com.example.sharestay.service;

import com.example.sharestay.dto.RoomDetailResponse;
import com.example.sharestay.dto.RoomImageResponse;
import com.example.sharestay.dto.RoomRequest;
import com.example.sharestay.dto.RoomResponse;
import com.example.sharestay.entity.Host;
import com.example.sharestay.entity.Room;
import com.example.sharestay.entity.RoomImage;
//import com.example.sharestay.entity.ShareLink;
import com.example.sharestay.repository.FavoriteRepository;
import com.example.sharestay.repository.HostRepository;
import com.example.sharestay.repository.RoomImageRepository;
import com.example.sharestay.repository.RoomRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomImageRepository roomImageRepository;
    private final HostRepository hostRepository;
    private final FirebaseService firebaseService;
    private final FavoriteRepository favoriteRepository;


    // 상세보기
    /*
        이 메서드 안에서 DB 작업(삭제 + 저장)이 하나의 트랜잭션으로 처리됨
        중간에 예외 나면 전체 롤백
     */
    @Transactional(readOnly = true)
    public RoomDetailResponse getRoomDetail(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        List<String> imageUrls = roomImageRepository.findByRoomId(roomId)
                .stream()
                .map(RoomImage::getImageUrl)
                .collect(Collectors.toList());

        Long hostId = room.getHost() != null ? room.getHost().getId() : null;
        Long hostUserId = (room.getHost() != null && room.getHost().getUser() != null)
                ? room.getHost().getUser().getId()
                : null;
        String hostIntroduction = (room.getHost() != null)
                ? room.getHost().getIntroduction()
                : null;
        String hostNickname = (room.getHost() != null && room.getHost().getUser() != null)
                ? room.getHost().getUser().getNickname()   // 여기 User 엔티티에 맞춰서 getName()이면 그걸로
                : null;


        return new RoomDetailResponse(
                room.getId(),
                room.getTitle(),
                room.getRentPrice(),
                room.getDeposit(),
                room.getAddress(),
                room.getType(),
                room.getAvailabilityStatus(),
                room.getDescription(),
                room.getPreferredGender(),
                room.getPreferredAge(),
                room.getTotalMembers(),
                room.getLifestyleAsList(),
                room.getOptionsAsList(),
                room.getLatitude(),
                room.getLongitude(),
                imageUrls,
                //room.getShareLink() != null ? room.getShareLink().getLinkUrl() : null,
                hostId,
                hostUserId,
                hostIntroduction,
                hostNickname
        );
    }

    // RoomService 안에 추가 ⭐
    // 이미지 수정때문에 이미지 저장 공통 메서드 추가
    private void saveRoomImages(Room room, List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return; // 업로드할 이미지가 없으면 아무 것도 안 함
        }

        for (MultipartFile file : files) {
            // 1) Firebase에 파일 업로드하고 URL 받기
            String imageUrl = firebaseService.uploadFile(file);

            // 2) RoomImage 엔티티 생성 (room 연관관계 포함)
            RoomImage image = new RoomImage(room, imageUrl);

            // 3) room → roomImages 컬렉션에 추가
            room.getRoomImages().add(image);
        }

        // 4) room 저장 (cascade 설정되어 있으면 같이 저장됨)
        roomRepository.save(room);
    }



    // 방 등록
    @Transactional
    public RoomResponse createRoom(RoomRequest request, List<MultipartFile> files) {
        Host host = hostRepository.findById(request.getHostId())
                .orElseThrow(() -> new IllegalArgumentException("Host not found"));

        Room room = request.toEntity(host);

//        ShareLink shareLink = new ShareLink();
//        room.setShareLink(shareLink);

        // 위도/경도가 null이거나 0일 경우 DB에 null로 저장
        if (room.getLatitude() == null || room.getLatitude() == 0.0) {
            room.setLatitude(null);
        }
        if (room.getLongitude() == null || room.getLongitude() == 0.0) {
            room.setLongitude(null);
        }

        roomRepository.save(room);

        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                String imageUrl = firebaseService.uploadFile(file);
                RoomImage image = new RoomImage(room, imageUrl);
                room.getRoomImages().add(image);
            }
        }

        Room savedRoom = roomRepository.save(room);

        // 🔥 공통 메서드로 이미지 저장
        saveRoomImages(room, files);

        return toResponse(room);
    }

    // 검색(간단 검색 / 필터 검색 통합)
    @Transactional(readOnly = true)
    public List<RoomResponse> searchRooms(
            String region, String district, String type,
            Double minPrice, Double maxPrice,
            String option
    ) {
        List<Room> rooms = roomRepository.searchRooms(district, region, type, minPrice, maxPrice, option);

        return rooms.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // 이미지 수정용(위에 만든 공통 메서드 활용)
    @Transactional
    public void updateRoomImages(Long roomId, List<MultipartFile> files) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        // 1) 기존 이미지 모두 삭제 (DB 기준)
        roomImageRepository.deleteAllByRoomId(roomId);
        room.getRoomImages().clear();  // JPA 엔티티의 컬렉션 내역도 같이 비워줌(1차 캐시 상태 정리)

        // 2) 새 이미지들 저장 (공통 메서드 활용)
        saveRoomImages(room, files);
    }


    @Transactional
    public RoomResponse updateRoom(Long roomId, RoomRequest request) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        room.update(request);

        // 위도/경도가 null이거나 0일 경우 DB에 null로 저장
        if (room.getLatitude() == null || room.getLatitude() == 0.0) {
            room.setLatitude(null);
        }
        if (room.getLongitude() == null || room.getLongitude() == 0.0) {
            room.setLongitude(null);
        }

        Room updated = roomRepository.save(room);
        return toResponse(updated);
    }

    @Transactional
    public void deleteRoom(Long roomId) {
        favoriteRepository.deleteAllByRoomId(roomId);
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));


        roomRepository.delete(room);
    }

    // 그냥 전체 목록만 불러오기
    @Transactional(readOnly = true)
    public List<RoomResponse> getRoomList() {
        return roomRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> getRoomListByHost(Long hostId) {
        List<Room> rooms = roomRepository.findByHostId(hostId);
        return rooms.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }



    /**
     * 마이그레이션 용도: 기존 방들 중 공유 링크가 없는 경우 기본 ShareLink를 채워 넣습니다.
     * 존재하지 않으면 새 ShareLink를 생성하고 저장합니다.
     */
//    @Transactional
//    public void backfillShareLinks() {
//        List<Room> rooms = roomRepository.findAll();
//        for (Room room : rooms) {
//            if (room.getShareLink() == null) {
//                ShareLink link = new ShareLink();
//                room.setShareLink(link);
//                roomRepository.save(room);
//            }
//        }
//    }

    private RoomResponse toResponse(Room room) {
        List<RoomImageResponse> imageUrls = room.getRoomImages()
                .stream()
                .map(img -> new RoomImageResponse(img.getId(), img.getImageUrl()))
                .toList();

        Long hostId = room.getHost() != null ? room.getHost().getId() : null;
        Long hostUserId = (room.getHost() != null && room.getHost().getUser() != null)
                ? room.getHost().getUser().getId()
                : null;

        return new RoomResponse(
                room.getId(),
                room.getTitle(),
                room.getRentPrice(),
                room.getDeposit(),
                room.getAddress(),
                room.getType(),
                room.getAvailabilityStatus(),
                room.getDescription(),
                room.getOptionsAsList(),
                room.getLifestyleAsList(),
                room.getPreferredGender(),
                room.getPreferredAge(),
                room.getTotalMembers(),
                imageUrls,
                //room.getShareLink() != null ? room.getShareLink().getLinkUrl() : null,
                hostId,
                hostUserId
        );
    }
}