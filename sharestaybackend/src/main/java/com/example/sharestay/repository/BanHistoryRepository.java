package com.example.sharestay.repository;

import com.example.sharestay.entity.BanHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BanHistoryRepository extends JpaRepository<BanHistory, Long> {
    List<BanHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
}
