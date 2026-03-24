package com.vishal.hms_backend.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorResponseDTO {
    private Long id;
    private Long userId;
    private String username;
    private String name;
    private List<String> specialization;
    private String email;
    private String contactNumber;
    private String qualifications;
    private Boolean enabled; // Add user enabled status
}
