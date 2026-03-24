package com.vishal.hms_backend.dto;

import com.vishal.hms_backend.entity.PaymentStatus;
import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillingRequestDTO {
    private Long appointmentId;
    private Long patientId;
    private BigDecimal amount;
    private PaymentStatus paymentStatus;
    private String paymentMethod;
}
