package com.vishal.hms_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillingDashboardDTO {
    private BillingStatsDTO stats;
    private List<RecentTransactionDTO> recentTransactions;
}
