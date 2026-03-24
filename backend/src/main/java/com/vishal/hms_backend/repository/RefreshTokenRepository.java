package com.vishal.hms_backend.repository;

import com.vishal.hms_backend.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    @Query("SELECT COUNT(r) FROM RefreshToken r WHERE r.userId = :userId AND r.revoked = false AND r.expiryDate > :now")
    int countValidTokensByUserId(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    default int countValidTokensByUserId(Long userId) {
        return countValidTokensByUserId(userId, LocalDateTime.now());
    }

    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true, r.revokedAt = :now WHERE r.userId = :userId AND r.revoked = false")
    void revokeAllUserTokens(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    default void revokeAllUserTokens(Long userId) {
        revokeAllUserTokens(userId, LocalDateTime.now());
    }

    @Modifying
    @Query("DELETE FROM RefreshToken r WHERE r.expiryDate < :now")
    int deleteExpiredTokens(@Param("now") LocalDateTime now);

    default int deleteExpiredTokens() {
        return deleteExpiredTokens(LocalDateTime.now());
    }

    @Query("SELECT r FROM RefreshToken r WHERE r.userId = :userId AND r.revoked = false AND r.expiryDate > :now ORDER BY r.createdAt DESC")
    java.util.List<RefreshToken> findValidTokensByUserId(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    default java.util.List<RefreshToken> findValidTokensByUserId(Long userId) {
        return findValidTokensByUserId(userId, LocalDateTime.now());
    }
}
