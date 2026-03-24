package com.vishal.hms_backend.service;

import com.vishal.hms_backend.dto.StaffRequestDTO;
import com.vishal.hms_backend.dto.StaffResponseDTO;
import com.vishal.hms_backend.entity.Role;
import com.vishal.hms_backend.entity.User;
import com.vishal.hms_backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StaffService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Transactional
    public StaffResponseDTO createStaff(StaffRequestDTO dto) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .username(dto.getUsername())
                .password(passwordEncoder.encode(dto.getPassword()))
                .email(dto.getEmail())
                .name(dto.getName())
                .role(dto.getRole())
                .enabled(true)
                .build();

        User saved = userRepository.save(user);
        log.info("Staff created: {} with role {}", saved.getUsername(), saved.getRole());

        try {
            auditService.logCreate("Staff", saved.getId(), saved, null, null);
        } catch (Exception e) {
        }

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<StaffResponseDTO> getAllStaff() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN || u.getRole() == Role.RECEPTIONIST || u.getRole() == Role.BILLING || u.getRole() == Role.DOCTOR)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StaffResponseDTO getStaffById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Staff member not found"));
        return mapToResponse(user);
    }

    @Transactional
    public StaffResponseDTO updateStaff(Long id, StaffRequestDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Staff member not found"));

        user.setEmail(dto.getEmail());
        user.setName(dto.getName());
        user.setRole(dto.getRole());

        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        User saved = userRepository.save(user);
        log.info("Staff updated: {}", saved.getUsername());

        try {
            auditService.logUpdate("Staff", id, saved, saved, null, null);
        } catch (Exception e) {
        }

        return mapToResponse(saved);
    }

    @Transactional
    public StaffResponseDTO updateStaffStatus(Long id, Boolean enabled) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Staff member not found"));

        User oldState = userRepository.findById(id).orElse(null);
        user.setEnabled(enabled);
        User saved = userRepository.save(user);
        log.info("Staff status updated: {} -> {}", saved.getUsername(), enabled ? "ACTIVE" : "INACTIVE");

        try {
            auditService.logUpdate("Staff", id, oldState, saved, null, null);
        } catch (Exception e) {
        }

        return mapToResponse(saved);
    }

    @Transactional
    public void deleteStaff(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Staff member not found"));
        userRepository.delete(user);
        log.info("Staff deleted: {}", user.getUsername());

        try {
            auditService.logDelete("Staff", id, user, null, null);
        } catch (Exception e) {
        }
    }

    private StaffResponseDTO mapToResponse(User user) {
        return StaffResponseDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .enabled(user.getEnabled())
                .createdAt(user.getCreatedAt())
                .lastLogin(user.getLastLogin())
                .build();
    }
}
