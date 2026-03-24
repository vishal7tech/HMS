package com.vishal.hms_backend.controller;

import com.vishal.hms_backend.dto.DoctorRequestDTO;
import com.vishal.hms_backend.dto.DoctorResponseDTO;
import com.vishal.hms_backend.service.DoctorService;
import com.vishal.hms_backend.service.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;
import com.vishal.hms_backend.entity.User;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;
    private final AuditService auditService;

    @GetMapping
    public ResponseEntity<List<DoctorResponseDTO>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<DoctorResponseDTO> createDoctor(
            @Valid @RequestBody DoctorRequestDTO dto,
            HttpServletRequest request) {
        try {
            User currentUser = (User) org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication().getPrincipal();
            
            DoctorResponseDTO created = doctorService.createDoctor(dto);
            
            // Log the creation
            auditService.logCreate("DOCTOR", created.getId(), dto, currentUser.getId(), request);
            
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDoctor(@PathVariable Long id, HttpServletRequest request) {
        try {
            User currentUser = (User) org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication().getPrincipal();
            
            // Get doctor data for audit before deletion
            var doctorToDelete = doctorService.getDoctorById(id);
            
            doctorService.deleteDoctor(id);
            
            // Log the deletion
            auditService.logDelete("DOCTOR", id, doctorToDelete, currentUser.getId(), request);
            
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<DoctorResponseDTO> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorResponseDTO> getMyProfile(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ResponseEntity.ok(doctorService.getDoctorByUserId(user.getId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR')")
    public ResponseEntity<DoctorResponseDTO> updateDoctor(
            @PathVariable Long id,
            @Valid @RequestBody DoctorRequestDTO dto) {
        return ResponseEntity.ok(doctorService.updateDoctor(id, dto));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DoctorResponseDTO> updateDoctorStatus(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> statusUpdate) {
        
        String statusStr = statusUpdate.get("status");
        if (statusStr == null || statusStr.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            boolean enabled = "ACTIVE".equalsIgnoreCase(statusStr);
            DoctorResponseDTO updated = doctorService.updateDoctorStatus(id, enabled);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}/appointments")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR')")
    public ResponseEntity<List<com.vishal.hms_backend.dto.AppointmentResponseDTO>> getAppointments(
            @PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getAppointmentsByDoctorId(id));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<java.util.Map<String, Object>> getDoctorDashboard(Authentication auth) {
        User user = (User) auth.getPrincipal();
        java.util.Map<String, Object> dashboard = doctorService.getDoctorDashboard(user.getId());
        return ResponseEntity.ok(dashboard);
    }
}
