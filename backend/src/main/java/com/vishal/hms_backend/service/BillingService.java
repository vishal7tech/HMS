package com.vishal.hms_backend.service;

import com.vishal.hms_backend.dto.BillingStatsDTO;
import com.vishal.hms_backend.dto.InvoiceResponseDTO;
import com.vishal.hms_backend.entity.Appointment;
import com.vishal.hms_backend.entity.AppointmentStatus;
import com.vishal.hms_backend.entity.Invoice;
import com.vishal.hms_backend.entity.PaymentStatus;
import com.vishal.hms_backend.repository.AppointmentRepository;
import com.vishal.hms_backend.repository.InvoiceRepository;
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
    private final InvoiceService invoiceService;

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
            List<Invoice> paidInvoices = invoiceRepository.findByStatusAndCreatedAtAfter(PaymentStatus.PAID, monthStart);
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

            return BillingStatsDTO.builder()
                    .todayBilling(todayBilling)
                    .pendingCount(pendingCount)
                    .paidAmount(paidAmount)
                    .overdueCount(overdueCount)
                    .totalRevenue(totalRevenue)
                    .pendingAmount(pendingAmount)
                    .overdueAmount(overdueAmount)
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
                    .build();
        }
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
}
