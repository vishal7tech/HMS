package com.vishal.hms_backend.controller;

import com.vishal.hms_backend.dto.BillingRequestDTO;
import com.vishal.hms_backend.dto.BillingResponseDTO;
import com.vishal.hms_backend.service.BillingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billings")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<BillingResponseDTO> createBilling(@Valid @RequestBody BillingRequestDTO dto) {
        BillingResponseDTO created = billingService.createBilling(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR')")
    public ResponseEntity<List<BillingResponseDTO>> getBillingsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(billingService.getBillingsByPatient(patientId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR')")
    public ResponseEntity<BillingResponseDTO> getBilling(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.getBillingById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBilling(@PathVariable Long id) {
        billingService.deleteBilling(id);
        return ResponseEntity.noContent().build();
    }
}
