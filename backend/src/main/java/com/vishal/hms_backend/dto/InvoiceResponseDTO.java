package com.vishal.hms_backend.dto;

import com.vishal.hms_backend.entity.PaymentStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponseDTO {
    private Long id;
    private Long appointmentId;
    private Long patientId;
    private String patientName;
    private BigDecimal amount;
    private BigDecimal tax;
    private BigDecimal totalAmount;
    private PaymentStatus status;
    private String invoiceNumber;
    private String pdfPath;
    private LocalDate dueDate;
    private String paymentMethod;
    private String notes;
    private LocalDateTime createdAt;
}
