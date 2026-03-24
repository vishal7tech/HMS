package com.vishal.hms_backend.service;

import com.vishal.hms_backend.dto.DashboardStats;
import com.vishal.hms_backend.dto.ChartDataDTO;
import com.vishal.hms_backend.dto.AppointmentStatsDTO;
import com.vishal.hms_backend.dto.RevenueDTO;
import com.vishal.hms_backend.entity.Appointment;
import com.vishal.hms_backend.entity.AppointmentStatus;
import com.vishal.hms_backend.entity.PaymentStatus;
import com.vishal.hms_backend.repository.AppointmentRepository;
import com.vishal.hms_backend.repository.InvoiceRepository;
import com.vishal.hms_backend.repository.PaymentRepository;
import com.vishal.hms_backend.repository.DoctorProfileRepository;
import com.vishal.hms_backend.repository.PatientProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final AppointmentRepository appointmentRepo;
    private final PatientProfileRepository patientRepo;
    private final DoctorProfileRepository doctorRepo;
    private final InvoiceRepository invoiceRepo;
    private final PaymentRepository paymentRepo;
    private final com.vishal.hms_backend.repository.UserRepository userRepo;

    public DashboardStats getStats(LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();

        long totalPatients = patientRepo.count();
        long totalDoctors = doctorRepo.count();

        long appointmentsToday = appointmentRepo.countBySlotTimeBetween(
                LocalDate.now().atStartOfDay(),
                LocalDate.now().plusDays(1).atStartOfDay());

        long totalAppointments = appointmentRepo.countBySlotTimeBetween(start, end);

        BigDecimal monthlyRevenue = paymentRepo.calculateTotalRevenue();
        if (monthlyRevenue == null) {
            monthlyRevenue = BigDecimal.ZERO;
        }

        BigDecimal outstandingPayments = invoiceRepo.calculateTotalOutstanding();
        if (outstandingPayments == null) {
            outstandingPayments = BigDecimal.ZERO;
        }

        // Total staff (ADMIN + RECEPTIONIST)
        long totalStaff = userRepo.countByRole(com.vishal.hms_backend.entity.Role.ADMIN) +
                userRepo.countByRole(com.vishal.hms_backend.entity.Role.RECEPTIONIST);

        long completedAppointments = appointmentRepo.countByStatus(AppointmentStatus.COMPLETED);
        long cancelledAppointments = appointmentRepo.countByStatus(AppointmentStatus.CANCELLED);
        long pendingInvoicesCount = invoiceRepo.countByStatus(PaymentStatus.PENDING);

        return DashboardStats.builder()
                .totalPatients(totalPatients)
                .totalDoctors(totalDoctors)
                .totalStaff(totalStaff)
                .todayAppointments(appointmentsToday)
                .totalAppointments(totalAppointments)
                .monthlyRevenue(monthlyRevenue)
                .outstandingPayments(outstandingPayments)
                .completedAppointments(completedAppointments)
                .cancelledAppointments(cancelledAppointments)
                .pendingInvoicesCount(pendingInvoicesCount)
                .build();
    }

    public List<ChartDataDTO> getChartData(LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();

        List<Appointment> appointments = appointmentRepo.findBySlotTimeBetween(start, end);

        // Group by Date String
        Map<String, List<Appointment>> appointmentsByDate = appointments.stream()
                .collect(Collectors.groupingBy(a -> a.getSlotTime().format(DateTimeFormatter.ofPattern("MMM dd"))));

        List<ChartDataDTO> chartData = new ArrayList<>();

        // Generate data for each date
        LocalDate current = from;
        while (!current.isAfter(to)) {
            String dateKey = current.format(DateTimeFormatter.ofPattern("MMM dd"));
            List<Appointment> dailyAppointments = appointmentsByDate.getOrDefault(dateKey, new ArrayList<>());

            long appointmentCount = dailyAppointments.size();
            BigDecimal dailyRevenue = BigDecimal.ZERO;

            for (Appointment app : dailyAppointments) {
                // To keep it performant and simple instead of nested DB queries,
                // we lookup successful invoices for these appointments.
                java.util.Optional<com.vishal.hms_backend.entity.Invoice> invoiceOpt = invoiceRepo
                        .findByAppointmentId(app.getId());
                if (invoiceOpt.isPresent()) {
                    com.vishal.hms_backend.entity.Invoice inv = invoiceOpt.get();
                    if (inv.getStatus() == PaymentStatus.PAID) {
                        dailyRevenue = dailyRevenue.add(inv.getAmount());
                    }
                }
            }

            chartData.add(ChartDataDTO.builder()
                    .name(dateKey)
                    .appointments(appointmentCount)
                    .revenue(dailyRevenue)
                    .build());

            current = current.plusDays(1);
        }

        return chartData;
    }

    public List<AppointmentStatsDTO> getAppointmentStats(LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();

        List<Appointment> appointments = appointmentRepo.findBySlotTimeBetween(start, end);
        Map<String, List<Appointment>> byDate = appointments.stream()
                .collect(Collectors.groupingBy(a -> a.getSlotTime().format(DateTimeFormatter.ofPattern("MMM dd"))));

        List<AppointmentStatsDTO> result = new ArrayList<>();
        LocalDate current = from;
        while (!current.isAfter(to)) {
            String key = current.format(DateTimeFormatter.ofPattern("MMM dd"));
            List<Appointment> day = byDate.getOrDefault(key, new ArrayList<>());
            long total = day.size();
            long completed = day.stream().filter(a -> a.getStatus() == AppointmentStatus.COMPLETED).count();
            long cancelled = day.stream()
                    .filter(a -> a.getStatus() == AppointmentStatus.CANCELLED || a.getStatus() == AppointmentStatus.NO_SHOW)
                    .count();
            result.add(AppointmentStatsDTO.builder()
                    .name(key)
                    .appointments(total)
                    .completed(completed)
                    .cancelled(cancelled)
                    .build());
            current = current.plusDays(1);
        }
        return result;
    }

    public List<RevenueDTO> getRevenueSeries(LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();

        List<com.vishal.hms_backend.entity.Invoice> invoices = invoiceRepo.findByCreatedAtBetween(start, end);
        Map<String, java.math.BigDecimal> revenueByDate = invoices.stream()
                .filter(inv -> inv.getStatus() == PaymentStatus.PAID)
                .collect(Collectors.groupingBy(inv -> inv.getCreatedAt().toLocalDate().format(DateTimeFormatter.ofPattern("MMM dd")),
                        Collectors.mapping(com.vishal.hms_backend.entity.Invoice::getAmount,
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))));

        List<RevenueDTO> series = new ArrayList<>();
        LocalDate current = from;
        while (!current.isAfter(to)) {
            String label = current.format(DateTimeFormatter.ofPattern("MMM dd"));
            BigDecimal amount = revenueByDate.getOrDefault(label, BigDecimal.ZERO);
            series.add(RevenueDTO.builder().month(label).revenue(amount).build());
            current = current.plusDays(1);
        }
        return series;
    }
}
