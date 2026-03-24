package com.vishal.hms_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentStatsDTO {
    private Long todayPayments;
    private Long pendingPayments;
    private Long completedPayments;
    private Long failedPayments;
    private BigDecimal totalAmount;
    private BigDecimal pendingAmount;
    private BigDecimal completedAmount;
    private BigDecimal refundedAmount;
}
