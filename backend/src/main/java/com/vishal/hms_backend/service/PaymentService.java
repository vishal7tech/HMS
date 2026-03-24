package com.vishal.hms_backend.service;

import com.vishal.hms_backend.dto.PaymentRequestDTO;
import com.vishal.hms_backend.dto.PaymentResponseDTO;
import com.vishal.hms_backend.entity.Invoice;
import com.vishal.hms_backend.entity.Payment;
import com.vishal.hms_backend.entity.PaymentStatus;
import com.vishal.hms_backend.repository.InvoiceRepository;
import com.vishal.hms_backend.repository.PaymentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final AuditService auditService;

    @Transactional
    public PaymentResponseDTO processPayment(PaymentRequestDTO dto) {
        Invoice invoice = invoiceRepository.findById(dto.getInvoiceId())
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found"));

        Payment payment = Payment.builder()
                .invoice(invoice)
                .amountPaid(dto.getAmountPaid())
                .method(dto.getMethod())
                .transactionId(dto.getTransactionId())
                .build();

        // Calculate total previously paid
        List<Payment> previousPayments = paymentRepository.findByInvoiceId(invoice.getId());
        BigDecimal totalPaid = previousPayments.stream()
                .map(Payment::getAmountPaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .add(dto.getAmountPaid());

        if (totalPaid.compareTo(invoice.getAmount()) >= 0) {
            payment.setStatus(PaymentStatus.PAID);
            invoice.setStatus(PaymentStatus.PAID);
        } else {
            payment.setStatus(PaymentStatus.PARTIAL);
            invoice.setStatus(PaymentStatus.PARTIAL);
        }

        Invoice oldInvoice = invoiceRepository.findById(invoice.getId()).orElse(null);
        invoiceRepository.save(invoice);
        try {
            auditService.logUpdate("Invoice", invoice.getId(), oldInvoice, invoice, null, null);
        } catch (Exception e) {
        }
        Payment saved = paymentRepository.save(payment);

        try {
            auditService.logCreate("Payment", saved.getId(), saved, null, null);
        } catch (Exception e) {
        }

        log.info("Payment of {} processed for Invoice {}. Status: {}", dto.getAmountPaid(), invoice.getId(),
                payment.getStatus());

        return toResponseDto(saved);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponseDTO> getPaymentsForInvoice(Long invoiceId) {
        return paymentRepository.findByInvoiceId(invoiceId).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentResponseDTO> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PaymentResponseDTO updatePaymentStatus(Long id, PaymentStatus status) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Payment not found"));
        
        Payment saved = paymentRepository.save(payment);
        try {
            auditService.logUpdate("Payment", id, payment, saved, null, null);
        } catch (Exception e) {}
        
        return toResponseDto(saved);
    }

    @Transactional
    public void deletePayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Payment not found"));
        
        paymentRepository.delete(payment);
        try {
            auditService.logDelete("Payment", id, payment, null, null);
        } catch (Exception e) {}
    }

    private PaymentResponseDTO toResponseDto(Payment payment) {
        String patName = payment.getInvoice() != null && payment.getInvoice().getPatient() != null && payment.getInvoice().getPatient().getUser() != null ?
                payment.getInvoice().getPatient().getUser().getName() : "Unknown";
        Long patId = payment.getInvoice() != null && payment.getInvoice().getPatient() != null ?
                payment.getInvoice().getPatient().getId() : null;

        return PaymentResponseDTO.builder()
                .id(payment.getId())
                .invoiceId(payment.getInvoice().getId())
                .amountPaid(payment.getAmountPaid())
                .method(payment.getMethod())
                .transactionId(payment.getTransactionId())
                .status(payment.getStatus())
                .invoiceNumber(payment.getInvoice() != null ? payment.getInvoice().getInvoiceNumber() : "N/A")
                .patientName(patName)
                .patientId(patId)
                .createdAt(payment.getCreatedAt())
                .completedAt(payment.getUpdatedAt()) // Use updatedAt as completedAt proxy
                .build();
    }
}
