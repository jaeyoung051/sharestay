package com.example.sharestay.controller;

import com.example.sharestay.dto.FavoriteDto;
import com.example.sharestay.entity.Favorite;
import com.example.sharestay.entity.Room;
import com.example.sharestay.entity.User;
import com.example.sharestay.repository.RoomRepository;
import com.example.sharestay.repository.UserRepository;
import com.example.sharestay.service.FavoriteService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/favorites")
@AllArgsConstructor
public class FavoriteController {
    private final FavoriteService favoriteService;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;


//    @PostMapping("/toggle")
//    public ResponseEntity<String> toggleFavorite(@RequestParam Long userId, @RequestParam Long roomId) {
//        User user = userRepository.findById(userId).orElseThrow();
//        Room room = roomRepository.findById(roomId).orElseThrow();
//
//        Optional<Favorite> favoriteOpt = favoriteService.getFavorite(user, room);
//
//        if (favoriteOpt.isPresent()) {
//            favoriteService.deleteFavorite(user, room);
//            return ResponseEntity.ok("즐겨찾기에서 삭제되었습니다.");
//        } else {
//            favoriteService.addFavorite(user, room);
//            return ResponseEntity.ok("즐겨찾기에 추가되었습니다.");
//        }
//    }

    @PostMapping("/toggle")
    public ResponseEntity<String> toggleFavorite(
            @RequestParam Long userId,
            @RequestParam Long roomId) {

        Optional<Favorite> favorite = favoriteService.getFavorite(userId, roomId);

        if (favorite.isPresent()) {
            favoriteService.deleteFavorite(userId, roomId);
            return ResponseEntity.ok("즐겨찾기에서 삭제되었습니다.");
        } else {
            favoriteService.addFavorite(userId, roomId);
            return ResponseEntity.ok("즐겨찾기에 추가되었습니다.");
        }
    }


//    @GetMapping("/list")
//    public ResponseEntity<List<FavoriteDto>> getFavorites(@RequestParam Long userId) {
//        User user = userRepository.findById(userId).orElseThrow();
//        List<FavoriteDto> rooms = favoriteService.getFavoritesByUser(user)
//                                                    .stream()
//                                                    .map(FavoriteDto::new)
//                                                    .toList();;
//        return ResponseEntity.ok(rooms);
//    }
@GetMapping("/list")
public ResponseEntity<List<FavoriteDto>> getFavorites(@RequestParam Long userId) {
    List<FavoriteDto> list = favoriteService.getFavoritesByUser(userId)
            .stream()
            .map(FavoriteDto::new)
            .toList();
    return ResponseEntity.ok(list);
}

}
