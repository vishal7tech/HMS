package com.vishal.hms_backend.repository;

import com.vishal.hms_backend.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findAllByOrderByChangedAtDesc(Pageable pageable);

    Page<AuditLog> findByEntityTypeAndEntityIdOrderByChangedAtDesc(String entityType, Long entityId, Pageable pageable);

    Page<AuditLog> findByChangedByOrderByChangedAtDesc(Long changedBy, Pageable pageable);

    Page<AuditLog> findByChangedAtBetweenOrderByChangedAtDesc(LocalDateTime start, LocalDateTime end,
            Pageable pageable);

    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.changedAt >= :since")
    long countAuditLogsSince(@Param("since") LocalDateTime since);

    @Query("SELECT a.entityType, COUNT(a) FROM AuditLog a WHERE a.changedAt >= :since GROUP BY a.entityType")
    List<Object[]> getAuditSummaryByEntityTypeSince(@Param("since") LocalDateTime since);

    @Query("SELECT a.changedBy, COUNT(a) FROM AuditLog a WHERE a.changedAt >= :since GROUP BY a.changedBy ORDER BY COUNT(a) DESC")
    List<Object[]> getTopUsersByActivitySince(@Param("since") LocalDateTime since, Pageable pageable);
}
