package com.vishal.hms_backend.dto;

import com.vishal.hms_backend.entity.PaymentStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillingResponseDTO {
    private Long id;
    private Long appointmentId;
    private String patientName;
    private BigDecimal amount;
    private PaymentStatus paymentStatus;
    private String paymentMethod;
    private LocalDateTime issuedAt;
}
