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
    private long completedAppointments;
    private long cancelledAppointments;
    private long pendingBills;
    private long paidBills;
}
