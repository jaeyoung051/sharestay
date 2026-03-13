package com.example.sharestay.repository;

import java.util.Optional;

import com.example.sharestay.entity.Host;
import com.example.sharestay.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HostRepository extends JpaRepository<Host, Long> {
    Optional<Host> findByUser(User user);
}
