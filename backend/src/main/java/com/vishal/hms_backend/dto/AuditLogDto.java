package com.vishal.hms_backend.dto;

import com.vishal.hms_backend.entity.AuditLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDto {
    private Long id;
    private LocalDateTime changedAt;
    private String action;
    private String entityType;
    private String entityName;
    private Long entityId;
    private String email;
    private String ipAddress;
    private String userAgent;
    private String oldValues;
    private String newValues;
    private Long changedBy;

    // Static method to convert from entity to DTO
    public static AuditLogDto fromEntity(AuditLog auditLog) {
        return AuditLogDto.builder()
                .id(auditLog.getId())
                .changedAt(auditLog.getChangedAt())
                .action(auditLog.getAction() != null ? auditLog.getAction().name() : null)
                .entityType(auditLog.getEntityType())
                .entityName(auditLog.getEntityName())
                .entityId(auditLog.getEntityId())
                .email(auditLog.getEmail())
                .changedBy(auditLog.getChangedBy())
                .ipAddress(auditLog.getIpAddress())
                .userAgent(auditLog.getUserAgent())
                .oldValues(auditLog.getOldValues())
                .newValues(auditLog.getNewValues())
                .build();
    }
}
