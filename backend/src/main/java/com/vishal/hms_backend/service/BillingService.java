package com.vishal.hms_backend.service;

import com.vishal.hms_backend.dto.BillingStatsDTO;
import com.vishal.hms_backend.dto.InvoiceResponseDTO;
import com.vishal.hms_backend.entity.Appointment;
import com.vishal.hms_backend.entity.AppointmentStatus;
import com.vishal.hms_backend.entity.Invoice;
import com.vishal.hms_backend.entity.PaymentStatus;
import com.vishal.hms_backend.dto.BillingDashboardDTO;
import com.vishal.hms_backend.dto.RecentTransactionDTO;
import com.vishal.hms_backend.repository.AppointmentRepository;
import com.vishal.hms_backend.repository.InvoiceRepository;
import com.vishal.hms_backend.repository.PatientProfileRepository;
import com.vishal.hms_backend.repository.PaymentRepository;
import com.vishal.hms_backend.dto.PaymentStatsDTO;
import com.vishal.hms_backend.entity.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BillingService {

    private final InvoiceRepository invoiceRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final InvoiceService invoiceService;
    private final PaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public BillingStatsDTO getBillingStats() {
        try {
            // Get today's billing (from midnight today to now)
            LocalDateTime todayStart = LocalDate.now().atStartOfDay();
            LocalDateTime todayEnd = LocalDate.now().atTime(LocalTime.MAX);

            List<Invoice> todayInvoices = invoiceRepository.findByCreatedAtBetween(todayStart, todayEnd);
            BigDecimal todayBilling = todayInvoices.stream()
                    .map(Invoice::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Get pending invoices
            List<Invoice> pendingInvoices = invoiceRepository.findByStatus(PaymentStatus.PENDING);
            long pendingCount = pendingInvoices.size();
            BigDecimal pendingAmount = pendingInvoices.stream()
                    .map(Invoice::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Get paid invoices (this month)
            LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();
            List<Invoice> paidInvoices = invoiceRepository.findByStatusAndCreatedAtAfter(PaymentStatus.PAID,
                    monthStart);
            BigDecimal paidAmount = paidInvoices.stream()
                    .map(Invoice::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Get overdue invoices (pending invoices with due date before today)
            LocalDate today = LocalDate.now();
            List<Invoice> overdueInvoices = pendingInvoices.stream()
                    .filter(invoice -> invoice.getDueDate() != null && invoice.getDueDate().isBefore(today))
                    .collect(Collectors.toList());
            long overdueCount = overdueInvoices.size();
            BigDecimal overdueAmount = overdueInvoices.stream()
                    .map(Invoice::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Total revenue (all paid invoices)
            List<Invoice> allPaidInvoices = invoiceRepository.findByStatus(PaymentStatus.PAID);
            BigDecimal totalRevenue = allPaidInvoices.stream()
                    .map(Invoice::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Patient count
            long patientCount = patientProfileRepository.count();

            // Invoice count this month
            long invoiceCount = invoiceRepository.countByCreatedAtAfter(monthStart);

            // Monthly growth (growth from yesterday's billing)
            LocalDateTime yesterdayStart = LocalDate.now().minusDays(1).atStartOfDay();
            LocalDateTime yesterdayEnd = LocalDate.now().minusDays(1).atTime(LocalTime.MAX);
            List<Invoice> yesterdayInvoices = invoiceRepository.findByCreatedAtBetween(yesterdayStart, yesterdayEnd);
            BigDecimal yesterdayBilling = yesterdayInvoices.stream()
                    .map(Invoice::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            double monthlyGrowth = 0.0;
            if (yesterdayBilling.compareTo(BigDecimal.ZERO) > 0) {
                monthlyGrowth = todayBilling.subtract(yesterdayBilling)
                        .divide(yesterdayBilling, 4, java.math.RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100")).doubleValue();
            } else if (todayBilling.compareTo(BigDecimal.ZERO) > 0) {
                monthlyGrowth = 100.0;
            }

            return BillingStatsDTO.builder()
                    .todayBilling(todayBilling)
                    .pendingCount(pendingCount)
                    .paidAmount(paidAmount)
                    .overdueCount(overdueCount)
                    .totalRevenue(totalRevenue)
                    .pendingAmount(pendingAmount)
                    .overdueAmount(overdueAmount)
                    .patientCount(patientCount)
                    .invoiceCount(invoiceCount)
                    .monthlyGrowth(monthlyGrowth)
                    .build();

        } catch (Exception e) {
            log.error("Error calculating billing stats", e);
            // Return empty stats on error
            return BillingStatsDTO.builder()
                    .todayBilling(BigDecimal.ZERO)
                    .pendingCount(0L)
                    .paidAmount(BigDecimal.ZERO)
                    .overdueCount(0L)
                    .totalRevenue(BigDecimal.ZERO)
                    .pendingAmount(BigDecimal.ZERO)
                    .overdueAmount(BigDecimal.ZERO)
                    .patientCount(0L)
                    .invoiceCount(0L)
                    .monthlyGrowth(0.0)
                    .build();
        }
    }

    @Transactional(readOnly = true)
    public BillingDashboardDTO getDashboardData() {
        BillingStatsDTO stats = getBillingStats();
        
        List<Invoice> top10 = invoiceRepository.findTop10ByOrderByCreatedAtDesc();
        List<RecentTransactionDTO> transactions = top10.stream().map(invoice -> {
            String patientName = "Unknown";
            if (invoice.getPatient() != null && invoice.getPatient().getUser() != null) {
                patientName = invoice.getPatient().getUser().getName();
            }
            
            return RecentTransactionDTO.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .patientName(patientName)
                .amount(invoice.getAmount())
                .status(invoice.getStatus().name())
                .createdAt(invoice.getCreatedAt())
                .paymentMethod(invoice.getPaymentMethod() != null ? invoice.getPaymentMethod() : "N/A")
                .build();
        }).collect(Collectors.toList());

        return BillingDashboardDTO.builder()
            .stats(stats)
            .recentTransactions(transactions)
            .build();
    }

    @Transactional
    public int generateBillsFromCompletedAppointments() {
        try {
            // Get completed appointments that don't have invoices yet
            List<Appointment> completedAppointments = getCompletedAppointmentsWithoutInvoices();

            int generatedCount = 0;
            for (Appointment appointment : completedAppointments) {
                try {
                    invoiceService.generateInvoiceForAppointment(appointment.getId());
                    generatedCount++;
                    log.info("Generated invoice for appointment {}", appointment.getId());
                } catch (Exception e) {
                    log.error("Failed to generate invoice for appointment {}", appointment.getId(), e);
                }
            }

            log.info("Generated {} bills from completed appointments", generatedCount);
            return generatedCount;

        } catch (Exception e) {
            log.error("Error generating bills from completed appointments", e);
            return 0;
        }
    }

    @Transactional(readOnly = true)
    public List<Appointment> getCompletedAppointmentsWithoutInvoices() {
        // Get appointments that are completed but don't have invoices
        List<Appointment> completedAppointments = appointmentRepository.findByStatus(AppointmentStatus.COMPLETED);

        return completedAppointments.stream()
                .filter(appointment -> !invoiceRepository.existsByAppointmentId(appointment.getId()))
                .collect(Collectors.toList());
    }

    @Transactional
    public InvoiceResponseDTO generateInvoiceForAppointment(Long appointmentId) {
        return invoiceService.generateInvoiceForAppointment(appointmentId);
    }
    @Transactional(readOnly = true)
    public PaymentStatsDTO getPaymentStats() {
        try {
            LocalDateTime todayStart = LocalDate.now().atStartOfDay();
            LocalDateTime todayEnd = LocalDate.now().atTime(LocalTime.MAX);

            List<Payment> todayPayments = paymentRepository.findByCreatedAtBetween(todayStart, todayEnd);
            long todayCount = todayPayments.size();
            BigDecimal totalAmount = todayPayments.stream()
                    .map(p -> p.getAmountPaid() != null ? p.getAmountPaid() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            long pendingCount = paymentRepository.countByStatus(PaymentStatus.PENDING);
            BigDecimal pendingAmount = paymentRepository.calculateTotalAmountByStatus(PaymentStatus.PENDING);
            if (pendingAmount == null) pendingAmount = BigDecimal.ZERO;

            long completedCount = paymentRepository.countByStatus(PaymentStatus.PAID);
            BigDecimal completedAmount = paymentRepository.calculateTotalAmountByStatus(PaymentStatus.PAID);
            if (completedAmount == null) completedAmount = BigDecimal.ZERO;

            long refundedCount = paymentRepository.countByStatus(PaymentStatus.REFUNDED);
            BigDecimal refundedAmount = paymentRepository.calculateTotalAmountByStatus(PaymentStatus.REFUNDED);
            if (refundedAmount == null) refundedAmount = BigDecimal.ZERO;

            return PaymentStatsDTO.builder()
                    .todayPayments(todayCount)
                    .pendingPayments(pendingCount)
                    .completedPayments(completedCount)
                    .failedPayments(refundedCount) // Use refunded as failed for now
                    .totalAmount(totalAmount)
                    .pendingAmount(pendingAmount)
                    .completedAmount(completedAmount)
                    .refundedAmount(refundedAmount)
                    .build();

        } catch (Exception e) {
            log.error("Error calculating payment stats", e);
            return PaymentStatsDTO.builder()
                    .todayPayments(0L)
                    .pendingPayments(0L)
                    .completedPayments(0L)
                    .failedPayments(0L)
                    .totalAmount(BigDecimal.ZERO)
                    .pendingAmount(BigDecimal.ZERO)
                    .completedAmount(BigDecimal.ZERO)
                    .refundedAmount(BigDecimal.ZERO)
                    .build();
        }
    }

    public byte[] exportBillingReport(String type, int days) {
        StringBuilder csv = new StringBuilder("Date,Type,Amount,Status\n");
        csv.append(LocalDate.now().toString()).append(",").append(type).append(",0,N/A");
        return csv.toString().getBytes();
    }
}
