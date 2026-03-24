package com.vishal.hms_backend.service;

import com.vishal.hms_backend.dto.DashboardStats;
import com.vishal.hms_backend.repository.AppointmentRepository;
import com.vishal.hms_backend.repository.DoctorRepository;
import com.vishal.hms_backend.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AppointmentRepository appointmentRepo;
    private final PatientRepository patientRepo;
    private final DoctorRepository doctorRepo;
    private final com.vishal.hms_backend.repository.BillingRepository billingRepo;

    public DashboardStats getStats(LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();

        long totalPatients = patientRepo.count();
        long totalDoctors = doctorRepo.count();

        long appointmentsToday = appointmentRepo.countByDateTimeBetween(
                LocalDate.now().atStartOfDay(),
                LocalDate.now().plusDays(1).atStartOfDay());

        long appointmentsPeriod = appointmentRepo.countByDateTimeBetween(start, end);

        java.math.BigDecimal totalRevenue = billingRepo.calculateTotalRevenue();
        if (totalRevenue == null) {
            totalRevenue = java.math.BigDecimal.ZERO;
        }

        return DashboardStats.builder()
                .totalPatients(totalPatients)
                .totalDoctors(totalDoctors)
                .appointmentsToday(appointmentsToday)
                .appointmentsInPeriod(appointmentsPeriod)
                .totalRevenue(totalRevenue)
                .build();
    }
}
