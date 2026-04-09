package com.vishal.hms_backend.controller;

import com.vishal.hms_backend.dto.InvoiceRequestDTO;
import com.vishal.hms_backend.dto.InvoiceResponseDTO;
import com.vishal.hms_backend.entity.Invoice;
import com.vishal.hms_backend.entity.PaymentStatus;
import com.vishal.hms_backend.service.InvoiceService;
import com.vishal.hms_backend.service.PdfGenerationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@Slf4j
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final PdfGenerationService pdfGenerationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'BILLING')")
    public ResponseEntity<List<InvoiceResponseDTO>> getAllInvoices() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'BILLING')")
    public ResponseEntity<InvoiceResponseDTO> createInvoice(@Valid @RequestBody InvoiceRequestDTO dto) {
        InvoiceResponseDTO created = invoiceService.createInvoice(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PostMapping("/generate/{appointmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'BILLING')")
    public ResponseEntity<InvoiceResponseDTO> generateInvoiceForAppointment(@PathVariable Long appointmentId) {
        InvoiceResponseDTO created = invoiceService.generateInvoiceForAppointment(appointmentId);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<List<InvoiceResponseDTO>> getInvoicesByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(invoiceService.getInvoicesByPatient(patientId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<InvoiceResponseDTO> getInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'BILLING')")
    public ResponseEntity<List<InvoiceResponseDTO>> getPendingInvoices() {
        return ResponseEntity.ok(invoiceService.getPendingInvoices());
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<Resource> downloadInvoicePdf(@PathVariable Long id) {
        try {
            log.info("PDF download request for invoice ID: {}", id);
            Invoice invoice = invoiceService.getInvoiceEntityById(id);

            // Generate PDF if not exists
            String pdfPath = invoice.getPdfPath();
            if (pdfPath == null || !Files.exists(Paths.get(pdfPath))) {
                log.info("Generating new PDF for invoice: {}", id);
                pdfPath = pdfGenerationService.generateInvoicePdf(invoice);
                invoice.setPdfPath(pdfPath);
                invoiceService.saveInvoice(invoice);
            }

            Path path = Paths.get(pdfPath);
            Resource resource = new FileSystemResource(path);

            if (!resource.exists() || !resource.isReadable()) {
                log.error("PDF file not found or not readable: {}", pdfPath);
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(path);
            if (contentType == null) {
                contentType = "application/pdf"; // Always serve as PDF
            }

            String fileName = invoice.getInvoiceNumber() + ".pdf"; // Always use .pdf extension

            log.info("Serving PDF file: {} with content type: {}", fileName, contentType);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + fileName + "\"")
                    .body(resource);

        } catch (IOException e) {
            log.error("Error downloading PDF for invoice {}", id, e);
            return ResponseEntity.internalServerError().build();
        } catch (Exception e) {
            log.error("Error processing invoice PDF request for invoice {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{id}/regenerate-pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'BILLING')")
    public ResponseEntity<String> regenerateInvoicePdf(@PathVariable Long id) {
        try {
            Invoice invoice = invoiceService.getInvoiceEntityById(id);
            String pdfPath = pdfGenerationService.generateInvoicePdf(invoice);
            invoice.setPdfPath(pdfPath);
            invoiceService.saveInvoice(invoice);

            log.info("PDF regenerated for invoice {}", id);
            return ResponseEntity.ok("PDF regenerated successfully");
        } catch (Exception e) {
            log.error("Error regenerating PDF for invoice {}", id, e);
            return ResponseEntity.internalServerError().body("Failed to regenerate PDF");
        }
    }

    @PutMapping("/{id}/payment-status")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'BILLING')")
    public ResponseEntity<InvoiceResponseDTO> updatePaymentStatus(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> request) {
        String statusStr = request.get("paymentStatus");
        PaymentStatus status = PaymentStatus.valueOf(statusStr);
        return ResponseEntity.ok(invoiceService.updatePaymentStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'BILLING')")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }
}
