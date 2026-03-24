package com.vishal.hms_backend.dto;

import com.vishal.hms_backend.entity.PaymentMethod;
import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestDTO {
    private Long invoiceId;
    private BigDecimal amountPaid;
    private PaymentMethod method; // CASH, CARD, UPI, INSURANCE
    private String transactionId;
}
