package com.example.sharestay.service;

import com.example.sharestay.entity.Favorite;
import com.example.sharestay.repository.FavoriteRepository;
import com.example.sharestay.entity.Room;
import com.example.sharestay.entity.User;
import com.example.sharestay.repository.RoomRepository;
import com.example.sharestay.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

//@Service
//public class FavoriteService {
//
//    private final FavoriteRepository favoriteRepository;
//
//    public FavoriteService(FavoriteRepository favoriteRepository) {
//        this.favoriteRepository = favoriteRepository;
//    }
//
//    @Transactional// 즐겨찾기 추가
//    public Favorite addFavorite(User user, Room room) {
//        return favoriteRepository.findByUserAndRoom(user, room)
//                .orElseGet(() -> {
//                    Favorite favorite = new Favorite();
//                    favorite.setUser(user);
//                    favorite.setRoom(room);
//                    return favoriteRepository.save(favorite);
//                });
//    }
//
//    // 즐겨찾기 삭제
//    public void deleteFavorite(User user, Room room) {
//        favoriteRepository.findByUserAndRoom(user, room)
//                .ifPresent(favoriteRepository::delete);
//    }
//
//    // 즐겨찾기 단건 조회
//    public Optional<Favorite> getFavorite(User user, Room room) {
//        return favoriteRepository.findByUserAndRoom(user, room);
//    }
//
//    // 사용자별 즐겨찾기 전체 조회
//    public List<Favorite> getFavoritesByUser(User user) {
//        return favoriteRepository.findAllByUser(user);
//    }
//}
@Service
public class FavoriteService {
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final FavoriteRepository favoriteRepository;

    public FavoriteService(
            UserRepository userRepository,
            RoomRepository roomRepository,
            FavoriteRepository favoriteRepository
    ) {
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.favoriteRepository = favoriteRepository;
    }

    // 즐겨찾기 추가
    @Transactional
    public void addFavorite(Long userId, Long roomId) {

        boolean exists = favoriteRepository.existsByUserIdAndRoomId(userId, roomId);
        if (!exists) {

            // ID 기반 참조 엔티티 얻기 (DB 조회 없이 프록시 생성)
            User user = userRepository.getReferenceById(userId);
            Room room = roomRepository.getReferenceById(roomId);

            Favorite favorite = new Favorite();
            favorite.setUser(user);
            favorite.setRoom(room);

            favoriteRepository.save(favorite);
        }
    }

    // 즐겨찾기 삭제
    @Transactional
    public void deleteFavorite(Long userId, Long roomId) {
        favoriteRepository.deleteByUserIdAndRoomId(userId, roomId);
    }

    // 즐겨찾기 단건 조회
    public Optional<Favorite> getFavorite(Long userId, Long roomId) {
        return favoriteRepository.findByUserIdAndRoomId(userId, roomId);
    }

    // 사용자별 즐겨찾기 목록 조회
    public List<Favorite> getFavoritesByUser(Long userId) {
        return favoriteRepository.findAllByUserId(userId);
    }
}
