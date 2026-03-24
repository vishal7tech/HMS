package com.vishal.hms_backend.controller;

import com.vishal.hms_backend.dto.RevenueDTO;
import com.vishal.hms_backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/revenue")
@PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'BILLING')")
@RequiredArgsConstructor
public class RevenueController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<List<RevenueDTO>> getRevenue(
            @RequestParam(required = false) String filter,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        if (filter != null && !filter.isBlank()) {
            LocalDate today = LocalDate.now();
            switch (filter) {
                case "today" -> {
                    from = today;
                    to = today;
                }
                case "7d" -> {
                    from = today.minusDays(6);
                    to = today;
                }
                case "30d" -> {
                    from = today.minusDays(29);
                    to = today;
                }
                default -> {
                    from = today.minusDays(30);
                    to = today;
                }
            }
        } else {
            if (from == null) from = LocalDate.now().minusDays(30);
            if (to == null) to = LocalDate.now();
        }
        return ResponseEntity.ok(dashboardService.getRevenueSeries(from, to));
    }
}
