package com.example.sharestay.repository;

import com.example.sharestay.entity.Favorite;
import com.example.sharestay.entity.Room;
import com.example.sharestay.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    boolean existsByUserIdAndRoomId(Long userId, Long roomId);

    Optional<Favorite> findByUserIdAndRoomId(Long userId, Long roomId);

    List<Favorite> findAllByUserId(Long userId);

    void deleteByUserIdAndRoomId(Long userId, Long roomId);

    // 방 삭제 시 사용 - roomId 전체 삭제
    void deleteAllByRoomId(Long roomId);

}


