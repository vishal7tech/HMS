package com.vishal.hms_backend.repository;

import com.vishal.hms_backend.entity.Billing;
import com.vishal.hms_backend.entity.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BillingRepository extends JpaRepository<Billing, Long> {

    // Check if billing exists for an appointment
    boolean existsByAppointmentId(Long appointmentId);

    // Find billing by appointment
    Billing findByAppointmentId(Long appointmentId);

    // Find by status
    List<Billing> findByStatus(PaymentStatus status);

    // Find by status and created after date
    List<Billing> findByStatusAndCreatedAtAfter(PaymentStatus status, LocalDateTime dateTime);

    // Find by created date range
    List<Billing> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    // Find overdue invoices (pending with due date before today)
    @Query("SELECT b FROM Billing b WHERE b.status = 'PENDING' AND b.dueDate < :today")
    List<Billing> findOverdueInvoices(@Param("today") LocalDate today);

    // Calculate sum by status
    @Query("SELECT COALESCE(SUM(b.amount), 0) FROM Billing b WHERE b.status = :status")
    BigDecimal sumAmountByStatus(@Param("status") PaymentStatus status);

    // Calculate sum by status and date range
    @Query("SELECT COALESCE(SUM(b.amount), 0) FROM Billing b WHERE b.status = :status AND b.createdAt BETWEEN :start AND :end")
    BigDecimal sumAmountByStatusAndDateRange(
            @Param("status") PaymentStatus status, 
            @Param("start") LocalDateTime start, 
            @Param("end") LocalDateTime end);

    // Count by status
    long countByStatus(PaymentStatus status);

    // Find by patient
    List<Billing> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    // Find by doctor
    List<Billing> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);

    // Find by multiple filters with pagination
    @Query("SELECT b FROM Billing b WHERE " +
           "(:status IS NULL OR b.status = :status) AND " +
           "(:fromDate IS NULL OR b.invoiceDate >= :fromDate) AND " +
           "(:toDate IS NULL OR b.invoiceDate <= :toDate) AND " +
           "(:patientId IS NULL OR b.patient.id = :patientId) AND " +
           "(:doctorId IS NULL OR b.doctor.id = :doctorId)")
    Page<Billing> findByFilters(
            @Param("status") PaymentStatus status,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("patientId") Long patientId,
            @Param("doctorId") Long doctorId,
            Pageable pageable);

    // Get today's billing total
    @Query("SELECT COALESCE(SUM(b.amount), 0) FROM Billing b WHERE b.createdAt >= :todayStart AND b.createdAt <= :todayEnd")
    BigDecimal getTodayBilling(@Param("todayStart") LocalDateTime todayStart, @Param("todayEnd") LocalDateTime todayEnd);

    // Get billing statistics for dashboard
    @Query("SELECT " +
           "COALESCE(SUM(CASE WHEN b.createdAt >= :todayStart AND b.createdAt <= :todayEnd THEN b.amount ELSE 0 END), 0) as todayBilling, " +
           "COALESCE(COUNT(CASE WHEN b.status = 'PENDING' THEN 1 END), 0) as pendingCount, " +
           "COALESCE(SUM(CASE WHEN b.status = 'PENDING' THEN b.amount ELSE 0 END), 0) as pendingAmount, " +
           "COALESCE(SUM(CASE WHEN b.status = 'PAID' AND b.createdAt >= :monthStart THEN b.amount ELSE 0 END), 0) as paidAmount, " +
           "COALESCE(COUNT(CASE WHEN b.status = 'PENDING' AND b.dueDate < :today THEN 1 END), 0) as overdueCount, " +
           "COALESCE(SUM(CASE WHEN b.status = 'PENDING' AND b.dueDate < :today THEN b.amount ELSE 0 END), 0) as overdueAmount " +
           "FROM Billing b")
    Object[] getBillingStatistics(
            @Param("todayStart") LocalDateTime todayStart,
            @Param("todayEnd") LocalDateTime todayEnd,
            @Param("monthStart") LocalDateTime monthStart,
            @Param("today") LocalDate today);

    // Find invoices that need to be marked as overdue
    @Query("SELECT b FROM Billing b WHERE b.status = 'PENDING' AND b.dueDate < :today")
    List<Billing> findInvoicesToMarkOverdue(@Param("today") LocalDate today);
}
