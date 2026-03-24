package com.vishal.hms_backend.repository;

import com.vishal.hms_backend.entity.Invoice;
import com.vishal.hms_backend.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByPatientId(Long patientId);

    Optional<Invoice> findByAppointmentId(Long appointmentId);

    boolean existsByAppointmentId(Long appointmentId);

    List<Invoice> findByStatus(PaymentStatus status);

    List<Invoice> findByStatusAndCreatedAtAfter(PaymentStatus status, LocalDateTime after);

    List<Invoice> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    long countByStatus(PaymentStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(i.amount) FROM Invoice i WHERE i.status = 'PENDING'")
    java.math.BigDecimal calculateTotalOutstanding();
}
