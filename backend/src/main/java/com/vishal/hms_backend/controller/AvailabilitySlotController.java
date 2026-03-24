package com.vishal.hms_backend.controller;

import com.vishal.hms_backend.dto.AvailabilitySlotRequestDTO;
import com.vishal.hms_backend.dto.AvailabilitySlotResponseDTO;
import com.vishal.hms_backend.service.AvailabilitySlotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor
public class AvailabilitySlotController {

    private final AvailabilitySlotService availabilitySlotService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR')")
    public ResponseEntity<AvailabilitySlotResponseDTO> createSlot(
            @Valid @RequestBody AvailabilitySlotRequestDTO requestDTO) {
        return new ResponseEntity<>(availabilitySlotService.createSlot(requestDTO), HttpStatus.CREATED);
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<List<AvailabilitySlotResponseDTO>> getDoctorSlots(
            @PathVariable Long doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        if (date != null) {
            return ResponseEntity.ok(availabilitySlotService.getSlotsByDoctorAndDate(doctorId, date));
        }
        return ResponseEntity.ok(availabilitySlotService.getAllSlotsByDoctor(doctorId));
    }

    @PutMapping("/{slotId}/toggle")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR')")
    public ResponseEntity<AvailabilitySlotResponseDTO> toggleAvailability(@PathVariable Long slotId) {
        return ResponseEntity.ok(availabilitySlotService.toggleAvailability(slotId));
    }

    @DeleteMapping("/{slotId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR')")
    public ResponseEntity<Void> deleteSlot(@PathVariable Long slotId) {
        availabilitySlotService.deleteSlot(slotId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'PATIENT')")
    public ResponseEntity<List<AvailabilitySlotResponseDTO>> getAvailableSlots() {
        return ResponseEntity.ok(availabilitySlotService.getAvailableSlots());
    }
}
