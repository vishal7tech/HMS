package com.vishal.hms_backend.service;

import com.vishal.hms_backend.dto.DashboardStats;
import com.vishal.hms_backend.entity.AppointmentStatus;
import com.vishal.hms_backend.entity.PaymentStatus;
import com.vishal.hms_backend.repository.AppointmentRepository;
import com.vishal.hms_backend.repository.BillingRepository;
import com.vishal.hms_backend.repository.DoctorRepository;
import com.vishal.hms_backend.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
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

        BigDecimal totalRevenue = billingRepo.calculateTotalRevenue();
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        // Additional statistics
        long completedAppointments = appointmentRepo.countByStatus(AppointmentStatus.COMPLETED);
        long cancelledAppointments = appointmentRepo.countByStatus(AppointmentStatus.CANCELLED);
        long pendingBills = billingRepo.countByPaymentStatus(PaymentStatus.PENDING);
        long paidBills = billingRepo.countByPaymentStatus(PaymentStatus.PAID);

        return DashboardStats.builder()
                .totalPatients(totalPatients)
                .totalDoctors(totalDoctors)
                .appointmentsToday(appointmentsToday)
                .appointmentsInPeriod(appointmentsPeriod)
                .totalRevenue(totalRevenue)
                .completedAppointments(completedAppointments)
                .cancelledAppointments(cancelledAppointments)
                .pendingBills(pendingBills)
                .paidBills(paidBills)
                .build();
    }
}
