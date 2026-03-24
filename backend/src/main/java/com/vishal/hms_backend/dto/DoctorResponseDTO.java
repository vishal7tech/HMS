package com.vishal.hms_backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorResponseDTO {
    private Long id;
    private String name;
    private String specialization;
    private String email;
    private String phone;
    private String qualification;
    private String availability;
    private java.time.LocalTime shiftStart;
    private java.time.LocalTime shiftEnd;
}
