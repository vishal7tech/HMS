package com.vishal.hms_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "doctors")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank
    private String specialization; // e.g. "Cardiology", "Pediatrics"

    @Email
    @Column(unique = true)
    private String email;

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$")
    private String phone;

    private String qualification;

    private String availability; // e.g. "Mon-Fri 09:00-17:00"

    private java.time.LocalTime shiftStart;

    private java.time.LocalTime shiftEnd;
}
