package com.vishal.hms_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "availability_slots")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilitySlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private DoctorProfile doctor;

    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;

    @Builder.Default
    private Boolean isAvailable = true;

    private String recurrence; // "NONE", "WEEKLY", "DAILY"
}
