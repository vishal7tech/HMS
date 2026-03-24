package com.vishal.hms_backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private long totalPatients;
    private long totalDoctors;
    private long totalStaff;
    private long todayAppointments;
    private long totalAppointments;
    private java.math.BigDecimal monthlyRevenue;
    private java.math.BigDecimal outstandingPayments;
    private long completedAppointments;
    private long cancelledAppointments;
    private long pendingInvoicesCount;
}
