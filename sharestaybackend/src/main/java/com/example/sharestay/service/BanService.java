package com.example.sharestay.service;

import com.example.sharestay.dto.BanHistoryResponse;
import com.example.sharestay.dto.BanRequest;
import com.example.sharestay.dto.BanResponse;
import com.example.sharestay.entity.Ban;
import com.example.sharestay.entity.BanHistory;
import com.example.sharestay.entity.User;
import com.example.sharestay.repository.BanHistoryRepository;
import com.example.sharestay.repository.BanRepository;
import com.example.sharestay.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BanService {

    private final BanRepository banRepository;
    private final BanHistoryRepository banHistoryRepository;
    private final UserRepository userRepository;

    @Transactional
    public BanResponse banUser(Long userId, BanRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("해당 사용자를 찾을 수 없습니다. ID: " + userId));

        ensureReasonPresent(request.getReason());

        Optional<Ban> activeBan = getActiveBanByUserId(userId);
        if (activeBan.isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 활성 정지 상태입니다. 해제 후 다시 등록하세요.");
        }

        // 기존 ban이 있으면 동일 ban_id를 재활성화, 없으면 새로 생성
        Optional<Ban> existing = findLatestBanByUserId(userId);
        Ban target;
        String action;
        if (existing.isPresent()) {
            target = existing.get();
            target.activate(request.getReason(), request.getExpireAt(), request.getMemo());
            action = "REBAN";
        } else {
            target = Ban.createBan(user, request.getReason(), request.getExpireAt(), request.getMemo());
            action = "CREATE";
        }

        Ban savedBan = banRepository.save(target);
        logHistory(savedBan, user, action, request);
        return BanResponse.from(savedBan);
    }

    @Transactional
    public void unbanUser(Long userId) {
        Ban activeBan = getActiveBanByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("해당 사용자에 활성 정지 기록이 없습니다. ID: " + userId));
        activeBan.deactivate();
        banRepository.save(activeBan);
        logHistory(activeBan, activeBan.getUser(), "UNBAN", activeBan.getReason(), activeBan.getEndDate(), activeBan.getMemo());
    }

    /**
     * 개별 정지 ID로 비활성화합니다.
     */
    @Transactional
    public void unbanByBanId(Long banId) {
        Ban ban = banRepository.findById(banId)
                .orElseThrow(() -> new EntityNotFoundException("해당 정지 ID를 찾을 수 없습니다. ID: " + banId));
        if (ban.isActive()) {
            ban.deactivate();
            banRepository.save(ban);
            logHistory(ban, ban.getUser(), "UNBAN", ban.getReason(), ban.getEndDate(), ban.getMemo());
        }
    }

    @Transactional
    public BanResponse updateBan(Long banId, BanRequest request) {
        Ban ban = banRepository.findById(banId)
                .orElseThrow(() -> new EntityNotFoundException("해당 정지 ID를 찾을 수 없습니다. ID: " + banId));
        ensureReasonPresent(request.getReason());

        Boolean targetActive = request.getActive();
        String action = "UPDATE";

        if (targetActive != null) {
            if (targetActive && !ban.isActive()) {
                ban.activate(request.getReason(), request.getExpireAt(), request.getMemo());
                action = "REBAN";
            } else if (!targetActive && ban.isActive()) {
                ban.deactivate();
                ban.update(request.getReason(), request.getExpireAt() != null ? request.getExpireAt() : ban.getEndDate(), request.getMemo());
                action = "UNBAN";
            }
        } else {
            ban.update(request.getReason(), request.getExpireAt(), request.getMemo());
        }

        Ban saved = banRepository.save(ban);
        logHistory(saved, ban.getUser(), action, request);
        return BanResponse.from(saved);
    }

    @Transactional
    public List<BanResponse> getBanHistory(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new EntityNotFoundException("해당 사용자를 찾을 수 없습니다. ID: " + userId);
        }
        return banRepository.findByUserId(userId).stream()
                .map(this::expireIfNeeded)
                .map(BanResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<BanResponse> getAllBans() {
        return banRepository.findAll().stream()
                .map(this::expireIfNeeded)
                .map(BanResponse::from)
                .collect(Collectors.toList());
    }

    public Optional<Ban> getActiveBanByUserId(Long userId) {
        Optional<Ban> activeBanOpt = banRepository.findActiveBanByUserId(userId);
        if (activeBanOpt.isEmpty()) return Optional.empty();

        Ban activeBan = activeBanOpt.get();
        Ban checked = expireIfNeeded(activeBan);
        return checked.isActive() ? Optional.of(checked) : Optional.empty();
    }

    public List<BanHistoryResponse> getBanHistoryLog(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new EntityNotFoundException("해당 사용자를 찾을 수 없습니다. ID: " + userId);
        }
        return banHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(BanHistoryResponse::from)
                .collect(Collectors.toList());
    }

    private Optional<Ban> findLatestBanByUserId(Long userId) {
        return banRepository.findByUserId(userId).stream()
                .max(Comparator.comparing(Ban::getId));
    }

    private void logHistory(Ban ban, User user, String action, BanRequest request) {
        logHistory(ban, user, action, request.getReason(), request.getExpireAt(), request.getMemo());
    }

    private void logHistory(Ban ban, User user, String action, String reason, LocalDateTime endDate, String memo) {
        BanHistory history = BanHistory.log(ban, user, action, reason, endDate, memo);
        banHistoryRepository.save(history);
    }

    private void ensureReasonPresent(String reason) {
        if (reason == null || reason.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "정지 사유는 필수입니다.");
        }
    }

    /**
     * 만료된 정지는 자동 해제하고 저장까지 처리한다.
     */
    private Ban expireIfNeeded(Ban ban) {
        if (ban.isActive()) {
            LocalDateTime endDate = ban.getEndDate();
            if (endDate != null && endDate.isBefore(LocalDateTime.now())) {
                ban.deactivate();
                banRepository.save(ban);
                logHistory(ban, ban.getUser(), "AUTO_EXPIRE", ban.getReason(), ban.getEndDate(), ban.getMemo());
            }
        }
        return ban;
    }
}
