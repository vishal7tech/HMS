package com.vishal.hms_backend.controller;

import com.vishal.hms_backend.dto.StaffRequestDTO;
import com.vishal.hms_backend.dto.StaffResponseDTO;
import com.vishal.hms_backend.service.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StaffController {

    private final StaffService staffService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StaffResponseDTO> createStaff(@Valid @RequestBody StaffRequestDTO dto) {
        return ResponseEntity.ok(staffService.createStaff(dto));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<StaffResponseDTO>> getAllStaff() {
        return ResponseEntity.ok(staffService.getAllStaff());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StaffResponseDTO> getStaffById(@PathVariable Long id) {
        return ResponseEntity.ok(staffService.getStaffById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StaffResponseDTO> updateStaff(@PathVariable Long id,
            @Valid @RequestBody StaffRequestDTO dto) {
        return ResponseEntity.ok(staffService.updateStaff(id, dto));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StaffResponseDTO> updateStaffStatus(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Object> statusUpdate) {
        
        Boolean enabled = (Boolean) statusUpdate.get("enabled");
        if (enabled == null) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            StaffResponseDTO updated = staffService.updateStaffStatus(id, enabled);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteStaff(@PathVariable Long id) {
        staffService.deleteStaff(id);
        return ResponseEntity.noContent().build();
    }
}
