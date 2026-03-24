package com.vishal.hms_backend.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceRequestDTO {
    private Long appointmentId;
    private BigDecimal amount;
}
