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
public class DepartmentDTO {
    private Long id;
    private String name;
    private String description;
    private String headOfDepartment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
