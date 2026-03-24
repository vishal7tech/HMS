package com.vishal.hms_backend.repository;

import com.vishal.hms_backend.entity.Billing;
import com.vishal.hms_backend.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillingRepository extends JpaRepository<Billing, Long> {
    List<Billing> findByPatientId(Long patientId);

    List<Billing> findByAppointmentId(Long appointmentId);

    boolean existsByAppointmentId(Long appointmentId);

    List<Billing> findByPaymentStatus(PaymentStatus paymentStatus);

    long countByPaymentStatus(PaymentStatus paymentStatus);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(b.amount) FROM Billing b WHERE b.paymentStatus = com.vishal.hms_backend.entity.PaymentStatus.PAID")
    java.math.BigDecimal calculateTotalRevenue();
}
