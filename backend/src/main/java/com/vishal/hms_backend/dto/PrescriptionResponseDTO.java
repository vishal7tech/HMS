package com.vishal.hms_backend.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PrescriptionResponseDTO {
    private Long id;
    private Long appointmentId;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private String diagnosis;
    private String medication;
    private String dosage;
    private String instructions;
    private LocalDateTime followUpDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
