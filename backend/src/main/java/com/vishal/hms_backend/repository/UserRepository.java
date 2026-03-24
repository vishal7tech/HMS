package com.vishal.hms_backend.repository;

import com.vishal.hms_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Optional<User> findByUsernameOrEmail(String username, String email);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    Optional<User> findByPasswordResetToken(String passwordResetToken);

    @Modifying
    @Query("UPDATE User u SET u.passwordResetToken = null, u.passwordResetExpiry = null WHERE u.passwordResetExpiry < :now")
    void clearExpiredPasswordResetTokens(@Param("now") LocalDateTime now);

    long countByRole(com.vishal.hms_backend.entity.Role role);
}
