package com.vishal.hms_backend.service;

import com.vishal.hms_backend.entity.AuditLog;
import com.vishal.hms_backend.repository.AuditLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void logCreate(String entityType, Long entityId, Object newEntity, Long userId, HttpServletRequest request) {
        try {
            String newValues = objectMapper.writeValueAsString(newEntity);
            
            AuditLog auditLog = AuditLog.builder()
                    .entityType(entityType)
                    .entityId(entityId)
                    .action(AuditLog.AuditAction.INSERT)
                    .newValues(newValues)
                    .changedBy(userId)
                    .ipAddress(getClientIpAddress(request))
                    .userAgent(request.getHeader("User-Agent"))
                    .build();
                    
            auditLogRepository.save(auditLog);
            log.debug("Logged creation of {} with ID {} by user {}", entityType, entityId, userId);
        } catch (Exception e) {
            log.error("Failed to log creation audit", e);
        }
    }

    @Transactional
    public void logUpdate(String entityType, Long entityId, Object oldEntity, Object newEntity, Long userId, HttpServletRequest request) {
        try {
            String oldValues = objectMapper.writeValueAsString(oldEntity);
            String newValues = objectMapper.writeValueAsString(newEntity);
            
            AuditLog auditLog = AuditLog.builder()
                    .entityType(entityType)
                    .entityId(entityId)
                    .action(AuditLog.AuditAction.UPDATE)
                    .oldValues(oldValues)
                    .newValues(newValues)
                    .changedBy(userId)
                    .ipAddress(getClientIpAddress(request))
                    .userAgent(request.getHeader("User-Agent"))
                    .build();
                    
            auditLogRepository.save(auditLog);
            log.debug("Logged update of {} with ID {} by user {}", entityType, entityId, userId);
        } catch (Exception e) {
            log.error("Failed to log update audit", e);
        }
    }

    @Transactional
    public void logDelete(String entityType, Long entityId, Object oldEntity, Long userId, HttpServletRequest request) {
        try {
            String oldValues = objectMapper.writeValueAsString(oldEntity);
            
            AuditLog auditLog = AuditLog.builder()
                    .entityType(entityType)
                    .entityId(entityId)
                    .action(AuditLog.AuditAction.DELETE)
                    .oldValues(oldValues)
                    .changedBy(userId)
                    .ipAddress(getClientIpAddress(request))
                    .userAgent(request.getHeader("User-Agent"))
                    .build();
                    
            auditLogRepository.save(auditLog);
            log.debug("Logged deletion of {} with ID {} by user {}", entityType, entityId, userId);
        } catch (Exception e) {
            log.error("Failed to log deletion audit", e);
        }
    }

    @Transactional
    public void logLogin(Long userId, HttpServletRequest request) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .entityType("USER")
                    .entityId(userId)
                    .action(AuditLog.AuditAction.LOGIN)
                    .changedBy(userId)
                    .ipAddress(getClientIpAddress(request))
                    .userAgent(request.getHeader("User-Agent"))
                    .build();
                    
            auditLogRepository.save(auditLog);
            log.debug("Logged login for user {}", userId);
        } catch (Exception e) {
            log.error("Failed to log login audit", e);
        }
    }

    @Transactional
    public void logPasswordChange(Long userId, HttpServletRequest request) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .entityType("USER")
                    .entityId(userId)
                    .action(AuditLog.AuditAction.PASSWORD_CHANGE)
                    .changedBy(userId)
                    .ipAddress(getClientIpAddress(request))
                    .userAgent(request.getHeader("User-Agent"))
                    .build();
                    
            auditLogRepository.save(auditLog);
            log.debug("Logged password change for user {}", userId);
        } catch (Exception e) {
            log.error("Failed to log password change audit", e);
        }
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByChangedAtDesc(pageable);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogsByEntity(String entityType, Long entityId, Pageable pageable) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByChangedAtDesc(entityType, entityId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogsByUser(Long userId, Pageable pageable) {
        return auditLogRepository.findByChangedByOrderByChangedAtDesc(userId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogsByDateRange(LocalDateTime start, LocalDateTime end, Pageable pageable) {
        return auditLogRepository.findByChangedAtBetweenOrderByChangedAtDesc(start, end, pageable);
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}
