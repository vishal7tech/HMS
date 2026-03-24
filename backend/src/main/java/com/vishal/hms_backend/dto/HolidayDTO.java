package com.vishal.hms_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HolidayDTO {
    private Long id;
    private String name;
    private LocalDate date;
    private String description;
    private Boolean isRecurring;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
