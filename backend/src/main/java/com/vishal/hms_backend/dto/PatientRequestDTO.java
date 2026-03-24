package com.vishal.hms_backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientRequestDTO {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100)
    private String name;

    @Min(0)
    @Max(120)
    private Integer age;

    @Email
    private String email;

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$")
    @JsonAlias({ "phoneNumber", "phone_number", "phone" })
    private String phoneNumber;

    @JsonAlias({ "medicalHistory", "medical_history" })
    private String medicalHistory;

    private String address;

    private String gender;

    private LocalDate dateOfBirth;
}
