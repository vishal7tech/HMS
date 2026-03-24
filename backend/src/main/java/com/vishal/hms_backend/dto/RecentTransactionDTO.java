package com.vishal.hms_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentTransactionDTO {
    private Long id;
    private String invoiceNumber;
    private String patientName;
    private BigDecimal amount;
    private String status;
    private LocalDateTime createdAt;
    private String paymentMethod;
}
