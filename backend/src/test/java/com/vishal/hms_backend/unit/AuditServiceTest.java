package com.vishal.hms_backend.unit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vishal.hms_backend.entity.AuditLog;
import com.vishal.hms_backend.repository.AuditLogRepository;
import com.vishal.hms_backend.service.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
class AuditServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private AuditService auditService;

    private final Long USER_ID = 1L;
    private final String ENTITY_TYPE = "PATIENT";
    private final Long ENTITY_ID = 100L;

    @BeforeEach
    void setUp() {
        when(request.getHeader("User-Agent")).thenReturn("Mozilla/5.0 Test Browser");
        when(request.getHeader("X-Forwarded-For")).thenReturn("192.168.1.1");
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");
    }

    @Test
    void shouldLogCreateOperation() throws Exception {
        // Given
        Object newEntity = createTestPatient("John Doe");
        String newEntityJson = "{\"name\":\"John Doe\",\"email\":\"john@example.com\"}";
        when(objectMapper.writeValueAsString(newEntity)).thenReturn(newEntityJson);

        // When
        auditService.logCreate(ENTITY_TYPE, ENTITY_ID, newEntity, USER_ID, request);

        // Then
        verify(auditLogRepository).save(argThat(log -> log.getEntityType().equals(ENTITY_TYPE) &&
                log.getEntityId().equals(ENTITY_ID) &&
                log.getAction().equals(AuditLog.AuditAction.INSERT) &&
                log.getNewValues().equals(newEntityJson) &&
                log.getChangedBy().equals(USER_ID) &&
                log.getIpAddress().equals("192.168.1.1")));
    }

    @Test
    void shouldLogUpdateOperation() throws Exception {
        // Given
        Object oldEntity = createTestPatient("John Doe");
        Object newEntity = createTestPatient("John Smith");
        String oldEntityJson = "{\"name\":\"John Doe\"}";
        String newEntityJson = "{\"name\":\"John Smith\"}";
        when(objectMapper.writeValueAsString(oldEntity)).thenReturn(oldEntityJson);
        when(objectMapper.writeValueAsString(newEntity)).thenReturn(newEntityJson);

        // When
        auditService.logUpdate(ENTITY_TYPE, ENTITY_ID, oldEntity, newEntity, USER_ID, request);

        // Then
        verify(auditLogRepository).save(argThat(log -> log.getEntityType().equals(ENTITY_TYPE) &&
                log.getEntityId().equals(ENTITY_ID) &&
                log.getAction().equals(AuditLog.AuditAction.UPDATE) &&
                log.getOldValues().equals(oldEntityJson) &&
                log.getNewValues().equals(newEntityJson) &&
                log.getChangedBy().equals(USER_ID)));
    }

    @Test
    void shouldLogDeleteOperation() throws Exception {
        // Given
        Object oldEntity = createTestPatient("John Doe");
        String oldEntityJson = "{\"name\":\"John Doe\"}";
        when(objectMapper.writeValueAsString(oldEntity)).thenReturn(oldEntityJson);

        // When
        auditService.logDelete(ENTITY_TYPE, ENTITY_ID, oldEntity, USER_ID, request);

        // Then
        verify(auditLogRepository).save(argThat(log -> log.getEntityType().equals(ENTITY_TYPE) &&
                log.getEntityId().equals(ENTITY_ID) &&
                log.getAction().equals(AuditLog.AuditAction.DELETE) &&
                log.getOldValues().equals(oldEntityJson) &&
                log.getNewValues() == null &&
                log.getChangedBy().equals(USER_ID)));
    }

    @Test
    void shouldLogLoginOperation() {
        // When
        auditService.logLogin(USER_ID, request);

        // Then
        verify(auditLogRepository).save(argThat(log -> log.getEntityType().equals("USER") &&
                log.getEntityId().equals(USER_ID) &&
                log.getAction().equals(AuditLog.AuditAction.LOGIN) &&
                log.getChangedBy().equals(USER_ID) &&
                log.getIpAddress().equals("192.168.1.1")));
    }

    @Test
    void shouldLogPasswordChangeOperation() {
        // When
        auditService.logPasswordChange(USER_ID, request);

        // Then
        verify(auditLogRepository).save(argThat(log -> log.getEntityType().equals("USER") &&
                log.getEntityId().equals(USER_ID) &&
                log.getAction().equals(AuditLog.AuditAction.PASSWORD_CHANGE) &&
                log.getChangedBy().equals(USER_ID)));
    }

    @Test
    void shouldGetAuditLogs() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        List<AuditLog> auditLogs = createTestAuditLogs();
        Page<AuditLog> expectedPage = new PageImpl<>(auditLogs, pageable, auditLogs.size());
        when(auditLogRepository.findAllByOrderByChangedAtDesc(pageable)).thenReturn(expectedPage);

        // When
        Page<AuditLog> result = auditService.getAuditLogs(pageable);

        // Then
        assertThat(result).isEqualTo(expectedPage);
        verify(auditLogRepository).findAllByOrderByChangedAtDesc(pageable);
    }

    @Test
    void shouldGetAuditLogsByEntity() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        List<AuditLog> auditLogs = createTestAuditLogs();
        Page<AuditLog> expectedPage = new PageImpl<>(auditLogs, pageable, auditLogs.size());
        when(auditLogRepository.findByEntityTypeAndEntityIdOrderByChangedAtDesc(ENTITY_TYPE, ENTITY_ID, pageable))
                .thenReturn(expectedPage);

        // When
        Page<AuditLog> result = auditService.getAuditLogsByEntity(ENTITY_TYPE, ENTITY_ID, pageable);

        // Then
        assertThat(result).isEqualTo(expectedPage);
        verify(auditLogRepository).findByEntityTypeAndEntityIdOrderByChangedAtDesc(ENTITY_TYPE, ENTITY_ID, pageable);
    }

    @Test
    void shouldGetAuditLogsByUser() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        List<AuditLog> auditLogs = createTestAuditLogs();
        Page<AuditLog> expectedPage = new PageImpl<>(auditLogs, pageable, auditLogs.size());
        when(auditLogRepository.findByChangedByOrderByChangedAtDesc(USER_ID, pageable))
                .thenReturn(expectedPage);

        // When
        Page<AuditLog> result = auditService.getAuditLogsByUser(USER_ID, pageable);

        // Then
        assertThat(result).isEqualTo(expectedPage);
        verify(auditLogRepository).findByChangedByOrderByChangedAtDesc(USER_ID, pageable);
    }

    @Test
    void shouldGetAuditLogsByDateRange() {
        // Given
        LocalDateTime start = LocalDateTime.now().minusDays(7);
        LocalDateTime end = LocalDateTime.now();
        Pageable pageable = PageRequest.of(0, 10);
        List<AuditLog> auditLogs = createTestAuditLogs();
        Page<AuditLog> expectedPage = new PageImpl<>(auditLogs, pageable, auditLogs.size());
        when(auditLogRepository.findByChangedAtBetweenOrderByChangedAtDesc(start, end, pageable))
                .thenReturn(expectedPage);

        // When
        Page<AuditLog> result = auditService.getAuditLogsByDateRange(start, end, pageable);

        // Then
        assertThat(result).isEqualTo(expectedPage);
        verify(auditLogRepository).findByChangedAtBetweenOrderByChangedAtDesc(start, end, pageable);
    }

    @Test
    void shouldExtractIpAddressCorrectly() {
        // Given
        when(request.getHeader("X-Forwarded-For")).thenReturn("203.0.113.1, 192.168.1.1");
        when(request.getHeader("X-Real-IP")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");

        // When
        auditService.logLogin(USER_ID, request);

        // Then
        verify(auditLogRepository).save(argThat(log -> log.getIpAddress().equals("203.0.113.1") // First IP in
                                                                                                // X-Forwarded-For
        ));
    }

    @Test
    void shouldHandleJsonProcessingExceptionGracefully() throws Exception {
        // Given
        Object entity = createTestPatient("John Doe");
        when(objectMapper.writeValueAsString(entity)).thenThrow(new RuntimeException("JSON error"));

        // When
        auditService.logCreate(ENTITY_TYPE, ENTITY_ID, entity, USER_ID, request);

        // Then - should not throw exception
        verify(auditLogRepository, never()).save(any());
    }

    private Object createTestPatient(String name) {
        return new Object() {
            public String getName() {
                return name;
            }

            public String getEmail() {
                return name.toLowerCase().replace(" ", ".") + "@example.com";
            }
        };
    }

    private List<AuditLog> createTestAuditLogs() {
        return Arrays.asList(
                AuditLog.builder()
                        .entityType(ENTITY_TYPE)
                        .entityId(ENTITY_ID)
                        .action(AuditLog.AuditAction.INSERT)
                        .changedBy(USER_ID)
                        .changedAt(LocalDateTime.now())
                        .build(),
                AuditLog.builder()
                        .entityType(ENTITY_TYPE)
                        .entityId(ENTITY_ID)
                        .action(AuditLog.AuditAction.UPDATE)
                        .changedBy(USER_ID)
                        .changedAt(LocalDateTime.now().minusMinutes(5))
                        .build());
    }
}
