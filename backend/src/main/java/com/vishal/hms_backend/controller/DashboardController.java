package com.vishal.hms_backend.controller;

import com.vishal.hms_backend.dto.DashboardStats;
import com.vishal.hms_backend.dto.ChartDataDTO;
import com.vishal.hms_backend.dto.AppointmentStatsDTO;
import com.vishal.hms_backend.dto.RevenueDTO;
import com.vishal.hms_backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/dashboard")
@PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'BILLING')")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getStats(
            @RequestParam(required = false) String filter,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        if (filter != null && !filter.isBlank()) {
            LocalDate[] range = resolveFilter(filter);
            from = range[0];
            to = range[1];
        } else {
            if (from == null) from = LocalDate.now().minusDays(30);
            if (to == null) to = LocalDate.now();
        }

        return ResponseEntity.ok(dashboardService.getStats(from, to));
    }

    @GetMapping("/chart-data")
    public ResponseEntity<java.util.List<ChartDataDTO>> getChartData(
            @RequestParam(required = false) String filter,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        if (filter != null && !filter.isBlank()) {
            LocalDate[] range = resolveFilter(filter);
            from = range[0];
            to = range[1];
        } else {
            if (from == null) from = LocalDate.now().minusDays(30);
            if (to == null) to = LocalDate.now();
        }

        return ResponseEntity.ok(dashboardService.getChartData(from, to));
    }

    @GetMapping("/appointments/stats")
    public ResponseEntity<java.util.List<AppointmentStatsDTO>> getAppointmentStats(
            @RequestParam(required = false) String filter,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        if (filter != null && !filter.isBlank()) {
            LocalDate[] range = resolveFilter(filter);
            from = range[0];
            to = range[1];
        } else {
            if (from == null) from = LocalDate.now().minusDays(30);
            if (to == null) to = LocalDate.now();
        }
        return ResponseEntity.ok(dashboardService.getAppointmentStats(from, to));
    }

    @GetMapping("/revenue")
    public ResponseEntity<java.util.List<RevenueDTO>> getRevenue(
            @RequestParam(required = false) String filter,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        if (filter != null && !filter.isBlank()) {
            LocalDate[] range = resolveFilter(filter);
            from = range[0];
            to = range[1];
        } else {
            if (from == null) from = LocalDate.now().minusDays(30);
            if (to == null) to = LocalDate.now();
        }
        return ResponseEntity.ok(dashboardService.getRevenueSeries(from, to));
    }

    private LocalDate[] resolveFilter(String filter) {
        LocalDate today = LocalDate.now();
        return switch (filter) {
            case "today" -> new LocalDate[]{today, today};
            case "7d" -> new LocalDate[]{today.minusDays(6), today};
            case "30d" -> new LocalDate[]{today.minusDays(29), today};
            default -> new LocalDate[]{today.minusDays(30), today};
        };
    }
}
