package com.vishal.hms_backend.controller;

import com.vishal.hms_backend.dto.PatientRequestDTO;
import com.vishal.hms_backend.dto.PatientResponseDTO;
import com.vishal.hms_backend.service.PatientService;
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
import java.util.Map;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;
    private final AuditService auditService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR')")
    public ResponseEntity<List<PatientResponseDTO>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<PatientResponseDTO> getPatient(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PatientResponseDTO> getMyProfile(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ResponseEntity.ok(patientService.getPatientByUserId(user.getId()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<PatientResponseDTO> createPatient(
            @Valid @RequestBody PatientRequestDTO dto,
            HttpServletRequest request) {
        try {
            User currentUser = (User) org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication().getPrincipal();
            
            PatientResponseDTO created = patientService.createPatient(dto);
            
            // Log the creation
            auditService.logCreate("PATIENT", created.getId(), dto, currentUser.getId(), request);
            
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'PATIENT')")
    public ResponseEntity<PatientResponseDTO> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody PatientRequestDTO dto,
            HttpServletRequest request) {
        try {
            User currentUser = (User) org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication().getPrincipal();
            
            // Get old patient data for audit
            var oldPatient = patientService.getPatientById(id);
            
            PatientResponseDTO updated = patientService.updatePatient(id, dto);
            
            // Log the update
            auditService.logUpdate("PATIENT", id, oldPatient, dto, currentUser.getId(), request);
            
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id, HttpServletRequest request) {
        try {
            User currentUser = (User) org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication().getPrincipal();
            
            // Get patient data for audit before deletion
            var patientToDelete = patientService.getPatientById(id);
            
            patientService.deletePatient(id);
            
            // Log the deletion
            auditService.logDelete("PATIENT", id, patientToDelete, currentUser.getId(), request);
            
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> togglePatientStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        patientService.togglePatientStatus(id, request.get("status"));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Map<String, Object>> getPatientDashboard(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ResponseEntity.ok(patientService.getPatientDashboard(user.getId()));
    }
}
