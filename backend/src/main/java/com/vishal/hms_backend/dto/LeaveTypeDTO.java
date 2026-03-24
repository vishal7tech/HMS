package com.vishal.hms_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveTypeDTO {
    private Long id;
    private String name;
    private String description;
    private Integer maxDaysPerYear;
    private Boolean requiresApproval;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
