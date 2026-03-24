package com.vishal.hms_backend.repository;

import com.vishal.hms_backend.entity.Payment;
import com.vishal.hms_backend.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByInvoiceId(Long invoiceId);

    @Query("SELECT SUM(p.amountPaid) FROM Payment p WHERE p.status = com.vishal.hms_backend.entity.PaymentStatus.PAID")
    java.math.BigDecimal calculateTotalRevenue();
}
