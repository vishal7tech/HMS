package com.vishal.hms_backend.service;

import com.vishal.hms_backend.dto.InvoiceRequestDTO;
import com.vishal.hms_backend.dto.InvoiceResponseDTO;
import com.vishal.hms_backend.entity.Appointment;
import com.vishal.hms_backend.entity.Invoice;
import com.vishal.hms_backend.entity.PaymentStatus;
import com.vishal.hms_backend.exception.ConflictException;
import com.vishal.hms_backend.repository.AppointmentRepository;
import com.vishal.hms_backend.repository.InvoiceItemRepository;
import com.vishal.hms_backend.repository.InvoiceRepository;
import com.vishal.hms_backend.repository.PatientProfileRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final PatientProfileRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final PdfGenerationService pdfGenerationService;
    private final AuditService auditService;
    
    private static final DateTimeFormatter INVOICE_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");
    
    private String generateInvoiceNumber() {
        String datePart = LocalDate.now().format(INVOICE_DATE_FORMAT);
        String randomPart = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "INV-" + datePart + "-" + randomPart;
    }

    @Transactional
    public InvoiceResponseDTO createInvoice(InvoiceRequestDTO dto) {
        Appointment appointment = appointmentRepository.findById(dto.getAppointmentId())
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));

        if (invoiceRepository.existsByAppointmentId(appointment.getId())) {
            throw new ConflictException("Invoice already exists for this appointment");
        }

        Invoice invoice = Invoice.builder()
                .patient(appointment.getPatient())
                .appointment(appointment)
                .amount(dto.getAmount())
                .tax(dto.getAmount().multiply(new BigDecimal("0.18")))
                .totalAmount(dto.getAmount().add(dto.getAmount().multiply(new BigDecimal("0.18"))))
                .status(PaymentStatus.PENDING)
                .invoiceNumber(generateInvoiceNumber())
                .dueDate(LocalDate.now().plusDays(7))
                .paymentMethod("CASH")
                .build();

        Invoice saved = invoiceRepository.save(invoice);
        try {
            auditService.logCreate("Invoice", saved.getId(), saved, null, null);
        } catch (Exception e) {
        }

        try {
            Invoice oldState = invoiceRepository.findById(saved.getId()).orElse(null);
            String pdfPath = pdfGenerationService.generateInvoicePdf(saved);
            saved.setPdfPath(pdfPath);
            saved = invoiceRepository.save(saved);
            try {
                auditService.logUpdate("Invoice", saved.getId(), oldState, saved, null, null);
            } catch (Exception ex) {
            }
        } catch (Exception e) {
            log.error("Failed to generate PDF for invoice", e);
        }

        return toResponseDto(saved);
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponseDTO> getInvoicesByPatient(Long patientId) {
        return invoiceRepository.findByPatientId(patientId).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InvoiceResponseDTO getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found"));
        return toResponseDto(invoice);
    }

    @Transactional
    public InvoiceResponseDTO generateInvoiceForAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));

        if (invoiceRepository.existsByAppointmentId(appointmentId)) {
            throw new ConflictException("Invoice already exists for this appointment");
        }

        BigDecimal amount = calculateConsultationFee(appointment.getDoctor().getSpecialization());
        BigDecimal tax = amount.multiply(new BigDecimal("0.18"));
        BigDecimal totalAmount = amount.add(tax);

        Invoice invoice = Invoice.builder()
                .patient(appointment.getPatient())
                .appointment(appointment)
                .amount(amount)
                .tax(tax)
                .totalAmount(totalAmount)
                .status(PaymentStatus.PENDING)
                .invoiceNumber(generateInvoiceNumber())
                .dueDate(LocalDate.now().plusDays(7))
                .paymentMethod("CASH")
                .build();

        Invoice saved = invoiceRepository.save(invoice);
        try {
            auditService.logCreate("Invoice", saved.getId(), saved, null, null);
        } catch (Exception e) {
        }

        try {
            Invoice oldState = invoiceRepository.findById(saved.getId()).orElse(null);
            String pdfPath = pdfGenerationService.generateInvoicePdf(saved);
            saved.setPdfPath(pdfPath);
            saved = invoiceRepository.save(saved);
            try {
                auditService.logUpdate("Invoice", saved.getId(), oldState, saved, null, null);
            } catch (Exception ex) {
            }
        } catch (Exception e) {
            log.error("Failed to generate PDF for invoice", e);
        }

        return toResponseDto(saved);
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponseDTO> getPendingInvoices() {
        return invoiceRepository.findByStatus(PaymentStatus.PENDING).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public InvoiceResponseDTO updatePaymentStatus(Long id, PaymentStatus status) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found"));
        
        PaymentStatus oldStatus = invoice.getStatus();
        invoice.setStatus(status);
        if (status == PaymentStatus.PAID) {
            invoice.setPaidAt(LocalDateTime.now());
        }
        
        Invoice saved = invoiceRepository.save(invoice);
        try {
            auditService.logUpdate("Invoice", id, invoice, saved, null, null);
        } catch (Exception e) {}
        
        return toResponseDto(saved);
    }

    @Transactional
    public void deleteInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found"));
        invoiceRepository.delete(invoice);
        try {
            auditService.logDelete("Invoice", id, invoice, null, null);
        } catch (Exception e) {}
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponseDTO> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    private BigDecimal calculateConsultationFee(List<String> specialization) {
        if (specialization == null || specialization.isEmpty())
            return new BigDecimal("300.00");
        String spec = specialization.get(0).toLowerCase();
        switch (spec) {
            case "cardiology":
            case "neurology":
                return new BigDecimal("500.00");
            case "orthopedics":
            case "pediatrics":
                return new BigDecimal("400.00");
            case "general":
            case "family medicine":
                return new BigDecimal("200.00");
            default:
                return new BigDecimal("300.00");
        }
    }

    public InvoiceResponseDTO toResponseDto(Invoice invoice) {
        return InvoiceResponseDTO.builder()
                .id(invoice.getId())
                .appointmentId(invoice.getAppointment().getId())
                .patientId(invoice.getPatient().getId())
                .patientName(invoice.getPatient().getUser().getName())
                .amount(invoice.getAmount())
                .tax(invoice.getTax())
                .totalAmount(invoice.getTotalAmount())
                .status(invoice.getStatus())
                .invoiceNumber(invoice.getInvoiceNumber())
                .pdfPath(invoice.getPdfPath())
                .dueDate(invoice.getDueDate())
                .paymentMethod(invoice.getPaymentMethod())
                .notes(invoice.getNotes())
                .createdAt(invoice.getCreatedAt())
                .build();
    }

    public Invoice getInvoiceEntityById(Long id) {
        return invoiceRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Invoice not found"));
    }

    public Invoice saveInvoice(Invoice invoice) {
        return invoiceRepository.save(invoice);
    }
}
