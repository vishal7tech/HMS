package com.vishal.hms_backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentRequestDTO {

    private Long patientId;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @NotNull(message = "Appointment date and time is required")
    @FutureOrPresent(message = "Appointment must be in the future or present")
    @JsonProperty("slotTime")
    private LocalDateTime slotTime;

    private String reason;
    private String notes;
}
