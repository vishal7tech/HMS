package com.vishal.hms_backend.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientRequestDTO {
    private String username; // Optional, can be derived from email if absent
    private String password;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100)
    private String name;

    @Email
    @NotBlank
    private String email;

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$")
    private String contactNumber;

    private String address;
    private String emergencyContact;
    private String bloodGroup;
    private String allergies;
    private LocalDate dateOfBirth;
    private String gender;
    private String medicalHistory;
}
