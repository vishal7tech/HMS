package com.vishal.hms_backend.service;

import com.vishal.hms_backend.entity.AuditLog;
import com.vishal.hms_backend.entity.User;
import com.vishal.hms_backend.repository.AuditLogRepository;
import com.vishal.hms_backend.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void logCreate(String entityType, Long entityId, Object newEntity, Long userId, HttpServletRequest request) {
        try {
            String newValues = objectMapper.writeValueAsString(newEntity);
            
            // Try to extract entity name and email based on entity type
            String entityName = extractEntityName(entityType, newEntity);
            String email = extractEntityEmail(entityType, newEntity);
            
            AuditLog auditLog = AuditLog.builder()
                    .entityType(entityType)
                    .entityId(entityId)
                    .entityName(entityName)
                    .email(email)
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
            
            // Try to extract entity name and email based on entity type
            String entityName = extractEntityName(entityType, newEntity);
            String email = extractEntityEmail(entityType, newEntity);
            
            AuditLog auditLog = AuditLog.builder()
                    .entityType(entityType)
                    .entityId(entityId)
                    .entityName(entityName)
                    .email(email)
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
            
            // Try to extract entity name and email from old entity before deletion
            String entityName = extractEntityName(entityType, oldEntity);
            String email = extractEntityEmail(entityType, oldEntity);
            
            AuditLog auditLog = AuditLog.builder()
                    .entityType(entityType)
                    .entityId(entityId)
                    .entityName(entityName)
                    .email(email)
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

    // Helper methods to extract entity name and email
    private String extractEntityName(String entityType, Object entity) {
        try {
            switch (entityType) {
                case "PATIENT":
                    if (entity instanceof Map) {
                        Map<?, ?> entityMap = (Map<?, ?>) entity;
                        return (String) entityMap.get("firstName") + " " + entityMap.get("lastName");
                    }
                    break;
                case "DOCTOR":
                    if (entity instanceof Map) {
                        Map<?, ?> entityMap = (Map<?, ?>) entity;
                        return (String) entityMap.get("firstName") + " " + entityMap.get("lastName");
                    }
                    break;
                case "USER":
                    if (entity instanceof Map) {
                        Map<?, ?> entityMap = (Map<?, ?>) entity;
                        return (String) entityMap.get("name");
                    }
                    break;
                case "APPOINTMENT":
                    if (entity instanceof Map) {
                        Map<?, ?> entityMap = (Map<?, ?>) entity;
                        return "Appointment #" + entityMap.get("id");
                    }
                    break;
                case "BILLING":
                case "INVOICE":
                    if (entity instanceof Map) {
                        Map<?, ?> entityMap = (Map<?, ?>) entity;
                        return "Invoice #" + entityMap.get("id");
                    }
                    break;
            }
        } catch (Exception e) {
            log.debug("Could not extract entity name for {}: {}", entityType, e.getMessage());
        }
        return null;
    }

    private String extractEntityEmail(String entityType, Object entity) {
        try {
            if (entity instanceof Map) {
                Map<?, ?> entityMap = (Map<?, ?>) entity;
                Object email = entityMap.get("email");
                if (email != null) {
                    return email.toString();
                }
            }
        } catch (Exception e) {
            log.debug("Could not extract entity email for {}: {}", entityType, e.getMessage());
        }
        return null;
    }

    @Transactional
    public void logLogin(Long userId, HttpServletRequest request) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            String userName = userOpt.map(User::getName).orElse("Unknown User");
            String userEmail = userOpt.map(User::getEmail).orElse("unknown@hms.com");
            String userRole = userOpt.map(user -> user.getRole().name()).orElse("USER");
            
            AuditLog auditLog = AuditLog.builder()
                    .entityType(userRole)
                    .entityId(userId)
                    .entityName(userName)
                    .email(userEmail)
                    .action(AuditLog.AuditAction.LOGIN)
                    .changedBy(userId)
                    .ipAddress(getClientIpAddress(request))
                    .userAgent(request.getHeader("User-Agent"))
                    .build();
                    
            auditLogRepository.save(auditLog);
            log.debug("Logged login for user {} with role {}", userId, userRole);
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

    @Transactional
    public void logLogout(Long userId, HttpServletRequest request) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            String userName = userOpt.map(User::getName).orElse("Unknown User");
            String userEmail = userOpt.map(User::getEmail).orElse("unknown@hms.com");
            String userRole = userOpt.map(user -> user.getRole().name()).orElse("USER");
            
            AuditLog auditLog = AuditLog.builder()
                    .entityType(userRole)
                    .entityId(userId)
                    .entityName(userName)
                    .email(userEmail)
                    .action(AuditLog.AuditAction.LOGOUT)
                    .changedBy(userId)
                    .ipAddress(getClientIpAddress(request))
                    .userAgent(request.getHeader("User-Agent"))
                    .build();
                    
            auditLogRepository.save(auditLog);
            log.debug("Logged logout for user {} with role {}", userId, userRole);
        } catch (Exception e) {
            log.error("Failed to log logout audit", e);
        }
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByChangedAtDesc(pageable);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogsByEntityType(String entityType, Pageable pageable) {
        return auditLogRepository.findByEntityTypeOrderByChangedAtDesc(entityType, pageable);
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

    @Transactional(readOnly = true)
    public Map<String, Long> getDailyAuditSummary() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.plusDays(1).atStartOfDay();
        
        List<Object[]> results = auditLogRepository.getAuditSummaryByEntityTypeSince(startOfDay);
        
        return results.stream()
                .collect(Collectors.toMap(
                        result -> ((AuditLog.AuditAction) result[0]).name(),
                        result -> (Long) result[1]
                ));
    }
}
