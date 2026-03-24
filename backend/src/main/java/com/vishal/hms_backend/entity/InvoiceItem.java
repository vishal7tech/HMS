package com.vishal.hms_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoice_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private BigDecimal quantity;

    @Column(nullable = false)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private BigDecimal totalPrice;

    @Column(name = "item_type")
    private String itemType; // e.g., "CONSULTATION", "MEDICINE", "LAB_TEST", "PROCEDURE"

    @Column(name = "service_code")
    private String serviceCode; // For billing codes

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        // Calculate total price if not set
        if (totalPrice == null && quantity != null && unitPrice != null) {
            totalPrice = quantity.multiply(unitPrice);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        // Recalculate total price
        if (quantity != null && unitPrice != null) {
            totalPrice = quantity.multiply(unitPrice);
        }
    }
}
