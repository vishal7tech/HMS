package com.vishal.hms_backend.repository;

import com.vishal.hms_backend.entity.InvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Long> {

    // Find items by invoice
    List<InvoiceItem> findByInvoiceId(Long invoiceId);

    // Find items by invoice and item type
    List<InvoiceItem> findByInvoiceIdAndItemType(Long invoiceId, String itemType);

    // Find items by item type
    List<InvoiceItem> findByItemType(String itemType);

    // Calculate total amount for an invoice
    @Query("SELECT COALESCE(SUM(ii.totalPrice), 0) FROM InvoiceItem ii WHERE ii.invoice.id = :invoiceId")
    java.math.BigDecimal calculateTotalByInvoiceId(@Param("invoiceId") Long invoiceId);

    // Count items by invoice
    long countByInvoiceId(Long invoiceId);

    // Delete items by invoice (useful when deleting an invoice)
    void deleteByInvoiceId(Long invoiceId);

    // Find items by service code
    List<InvoiceItem> findByServiceCode(String serviceCode);

    // Find items containing description (for search functionality)
    @Query("SELECT ii FROM InvoiceItem ii WHERE ii.description LIKE %:description%")
    List<InvoiceItem> findByDescriptionContaining(@Param("description") String description);
}
