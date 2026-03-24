package com.vishal.hms_backend.controller;

import com.vishal.hms_backend.dto.AppointmentRequestDTO;
import com.vishal.hms_backend.dto.AppointmentResponseDTO;
import com.vishal.hms_backend.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<AppointmentResponseDTO> bookAppointment(@Valid @RequestBody AppointmentRequestDTO dto) {
        AppointmentResponseDTO booked = appointmentService.bookAppointment(dto);
        return new ResponseEntity<>(booked, HttpStatus.CREATED);
    }
}
