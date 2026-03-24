package com.vishal.hms_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is mandatory")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @Min(value = 0, message = "Age cannot be negative")
    @Max(value = 120, message = "Age seems unrealistic")
    private Integer age;

    @Email(message = "Please provide a valid email address")
    @Column(unique = true)
    private String email;

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number format")
    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "medical_history", columnDefinition = "TEXT")
    private String medicalHistory;

    private String address;

    private String gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
}
