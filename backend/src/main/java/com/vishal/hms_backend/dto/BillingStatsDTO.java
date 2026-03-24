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
public class BillingStatsDTO {
    private BigDecimal todayBilling;
    private Long pendingCount;
    private BigDecimal paidAmount;
    private Long overdueCount;
    private BigDecimal totalRevenue;
    private BigDecimal pendingAmount;
    private BigDecimal overdueAmount;
}
