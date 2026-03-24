package com.vishal.hms_backend.dto;

import com.vishal.hms_backend.entity.PaymentMethod;
import com.vishal.hms_backend.entity.PaymentStatus;
import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponseDTO {
    private Long id;
    private Long invoiceId;
    private BigDecimal amountPaid;
    private PaymentMethod method;
    private String transactionId;
    private PaymentStatus status;
    private String invoiceNumber;
    private String patientName;
    private Long patientId;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime completedAt;
}
