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
public class DesignationDTO {
    private Long id;
    private String name;
    private String type;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
