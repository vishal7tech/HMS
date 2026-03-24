package com.vishal.hms_backend.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientResponseDTO {
    private Long id;
    private String name;
    private Integer age;
    private String email;
    private String phoneNumber;
    private String medicalHistory;
    private String address;
    private String gender;
    private LocalDate dateOfBirth;
}
