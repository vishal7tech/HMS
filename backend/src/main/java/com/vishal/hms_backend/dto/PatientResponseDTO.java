package com.vishal.hms_backend.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientResponseDTO {
    private Long id;
    private Long userId;
    private String username;
    private String name;
    private String email;
    private String contactNumber;
    private String address;
    private String emergencyContact;
    private String bloodGroup;
    private String allergies;
    private LocalDate dateOfBirth;
    private String gender;
    private String medicalHistory;
    private Boolean enabled;
}
