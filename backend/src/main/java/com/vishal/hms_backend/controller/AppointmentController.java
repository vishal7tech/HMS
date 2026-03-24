package com.vishal.hms_backend.controller;

import com.vishal.hms_backend.dto.AppointmentRequestDTO;
import com.vishal.hms_backend.dto.AppointmentResponseDTO;
import com.vishal.hms_backend.dto.AppointmentStatsDTO;
import com.vishal.hms_backend.service.AppointmentService;
import com.vishal.hms_backend.service.DashboardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final DashboardService dashboardService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR')")
    public ResponseEntity<List<AppointmentResponseDTO>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<AppointmentResponseDTO> bookAppointment(@Valid @RequestBody AppointmentRequestDTO dto) {
        AppointmentResponseDTO booked = appointmentService.bookAppointment(dto);
        return new ResponseEntity<>(booked, HttpStatus.CREATED);
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<List<AppointmentResponseDTO>> getPatientAppointments(@PathVariable Long patientId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByPatient(patientId));
    }

    @GetMapping("/patient/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<AppointmentResponseDTO>> getMyPatientAppointments(Principal principal) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByPatientUsername(principal.getName()));
    }

    @GetMapping("/doctor/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<AppointmentResponseDTO>> getMyDoctorAppointments(Principal principal) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByDoctorUsername(principal.getName()));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR')")
    public ResponseEntity<List<AppointmentResponseDTO>> getDoctorAppointments(@PathVariable Long doctorId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByDoctor(doctorId));
    }

    @PutMapping("/{id}/reschedule")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR')")
    public ResponseEntity<AppointmentResponseDTO> rescheduleAppointment(
            @PathVariable Long id,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime slotTime) {
        return ResponseEntity.ok(appointmentService.rescheduleAppointment(id, slotTime));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<Void> cancelAppointment(@PathVariable Long id) {
        appointmentService.cancelAppointment(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR')")
    public ResponseEntity<Void> completeAppointment(@PathVariable Long id) {
        appointmentService.completeAppointment(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<List<AppointmentStatsDTO>> getAppointmentStats(
            @RequestParam(required = false) String filter,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate to) {
        if (filter != null && !filter.isBlank()) {
            LocalDate today = LocalDate.now();
            switch (filter) {
                case "today" -> {
                    from = today;
                    to = today;
                }
                case "7d" -> {
                    from = today.minusDays(6);
                    to = today;
                }
                case "30d" -> {
                    from = today.minusDays(29);
                    to = today;
                }
                default -> {
                    from = today.minusDays(30);
                    to = today;
                }
            }
        } else {
            if (from == null) from = LocalDate.now().minusDays(30);
            if (to == null) to = LocalDate.now();
        }
        return ResponseEntity.ok(dashboardService.getAppointmentStats(from, to));
    }

    @GetMapping("/completed")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR')")
    public ResponseEntity<List<AppointmentResponseDTO>> getCompletedAppointments() {
        return ResponseEntity.ok(
                appointmentService.getAppointmentsByStatus(com.vishal.hms_backend.entity.AppointmentStatus.COMPLETED));
    }
}
