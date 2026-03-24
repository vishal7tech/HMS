package com.vishal.hms_backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private long totalPatients;
    private long totalDoctors;
    private long appointmentsToday;
    private long appointmentsInPeriod;
    private java.math.BigDecimal totalRevenue;
    // more fields can be added: completed, revenue, top specializations, etc.
}
