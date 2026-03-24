package com.vishal.hms_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentNotificationDTO {
    private String type; // CREATED, UPDATED, CANCELLED, COMPLETED
    private Long appointmentId;
    private String patientName;
    private String doctorName;
    private String slotTime;
    private String status;
    private String message;
}
