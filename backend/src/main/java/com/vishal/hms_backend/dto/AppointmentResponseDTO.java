package com.vishal.hms_backend.dto;

import com.vishal.hms_backend.entity.AppointmentStatus;
import lombok.*;
import java.util.List;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponseDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private LocalDateTime slotTime;
    private LocalDateTime endTime;
    private AppointmentStatus status;
    private String reason;
    private String notes;
    private List<LocalDateTime> suggestedSlots;
}
