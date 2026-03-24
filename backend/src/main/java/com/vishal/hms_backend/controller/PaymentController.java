package com.vishal.hms_backend.controller;

import com.vishal.hms_backend.dto.PaymentRequestDTO;
import com.vishal.hms_backend.dto.PaymentResponseDTO;
import com.vishal.hms_backend.entity.PaymentStatus;
import com.vishal.hms_backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'BILLING')")
    public ResponseEntity<PaymentResponseDTO> processPayment(@Valid @RequestBody PaymentRequestDTO dto) {
        PaymentResponseDTO created = paymentService.processPayment(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'PATIENT', 'BILLING')")
    public ResponseEntity<List<PaymentResponseDTO>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/invoice/{invoiceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'PATIENT')")
    public ResponseEntity<List<PaymentResponseDTO>> getPaymentsForInvoice(@PathVariable Long invoiceId) {
        return ResponseEntity.ok(paymentService.getPaymentsForInvoice(invoiceId));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'BILLING')")
    public ResponseEntity<PaymentResponseDTO> updatePaymentStatus(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> request) {
        String statusStr = request.get("status");
        PaymentStatus status = PaymentStatus.valueOf(statusStr);
        return ResponseEntity.ok(paymentService.updatePaymentStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'BILLING')")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }
}
