//package com.example.sharestay.service;
//
//import com.example.sharestay.entity.Room;
//import com.example.sharestay.repository.RoomRepository;
//import com.example.sharestay.entity.ShareLink;
//import com.example.sharestay.repository.ShareLinkRepository;
//import com.example.sharestay.dto.ShareLinkResponse;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//@Service
//@RequiredArgsConstructor
//public class ShareLinkService {
//    private final RoomRepository roomRepository;
//    // private final ShareLinkRepository shareLinkRepository; // ❌ 이거는 사실 안 써도 됨
//
//    // ✅ 이미 Room 저장 시점에 ShareLink가 자동 생성된다는 가정 하에
//    @Transactional(readOnly = true)
//    public ShareLinkResponse getShareLink(Long roomId) {
//        Room room = roomRepository.findById(roomId)
//                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
//
//        ShareLink shareLink = room.getShareLink();
//        if (shareLink == null) {   // 이러면 진짜로 뭔가 꼬인 상황
//            throw new IllegalArgumentException("공유 링크가 존재하지 않습니다.");
//        }
//
//        return ShareLinkResponse.builder()
//                .linkUrl(shareLink.getLinkUrl())
//                .build();
//    }
//}
