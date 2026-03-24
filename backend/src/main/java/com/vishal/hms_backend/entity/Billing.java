package com.vishal.hms_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "billing", indexes = {
    @Index(name = "idx_billing_due_date_status", columnList = "dueDate, status"),
    @Index(name = "idx_billing_appointment_id", columnList = "appointment_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Slf4j
public class Billing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", nullable = false, unique = true)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Appointment appointment;

    @NotNull
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @NotNull
    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate;

    @NotNull
    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private PatientProfile patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private DoctorProfile doctor;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        
        // Set default dates if not provided
        if (invoiceDate == null) {
            invoiceDate = LocalDate.now();
        }
        if (dueDate == null) {
            // Default due date is 30 days from invoice date
            dueDate = invoiceDate.plusDays(30);
        }
        
        log.debug("Creating billing record for appointment {}, amount {}, due date {}", 
                appointment != null ? appointment.getId() : "null", amount, dueDate);
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        log.debug("Updating billing record {} with status {}", id, status);
    }

    /**
     * Check if this billing is overdue (due date passed and still pending)
     */
    public boolean isOverdue() {
        return status == PaymentStatus.PENDING && dueDate.isBefore(LocalDate.now());
    }

    /**
     * Calculate overdue days
     */
    public long getOverdueDays() {
        if (!isOverdue()) {
            return 0;
        }
        return LocalDate.now().until(dueDate).getDays() * -1;
    }
}
