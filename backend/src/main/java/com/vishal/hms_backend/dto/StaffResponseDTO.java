package com.vishal.hms_backend.dto;

import com.vishal.hms_backend.entity.Role;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffResponseDTO {
    private Long id;
    private String username;
    private String email;
    private String name;
    private Role role;
    private Boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
}
