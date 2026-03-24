package com.vishal.hms_backend.controller;

import com.vishal.hms_backend.dto.BillingStatsDTO;
import com.vishal.hms_backend.entity.Appointment;
import com.vishal.hms_backend.entity.AppointmentStatus;
import com.vishal.hms_backend.service.BillingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
@Slf4j
public class BillingController {

    private final BillingService billingService;

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'BILLING')")
    public ResponseEntity<BillingStatsDTO> getBillingStats() {
        log.info("Fetching billing statistics");
        BillingStatsDTO stats = billingService.getBillingStats();
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/generate-from-completed")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'BILLING')")
    public ResponseEntity<Map<String, Integer>> generateBillsFromCompletedAppointments() {
        log.info("Generating bills from completed appointments");
        int generatedCount = billingService.generateBillsFromCompletedAppointments();
        return ResponseEntity.ok(Map.of("count", generatedCount));
    }

    @GetMapping("/completed-appointments")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'BILLING')")
    public ResponseEntity<List<Appointment>> getCompletedAppointments() {
        log.info("Fetching completed appointments for billing");
        List<Appointment> appointments = billingService.getCompletedAppointmentsWithoutInvoices();
        return ResponseEntity.ok(appointments);
    }

    @PostMapping("/generate/{appointmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'BILLING')")
    public ResponseEntity<?> generateBillForAppointment(@PathVariable Long appointmentId) {
        log.info("Generating bill for appointment: {}", appointmentId);
        try {
            return ResponseEntity.ok(billingService.generateInvoiceForAppointment(appointmentId));
        } catch (Exception e) {
            log.error("Failed to generate bill for appointment {}", appointmentId, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
