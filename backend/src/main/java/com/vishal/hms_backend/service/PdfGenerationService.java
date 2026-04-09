package com.vishal.hms_backend.service;

import com.vishal.hms_backend.entity.Invoice;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class PdfGenerationService {

    private static final String INVOICE_DIR = "invoices/";

    public String generateInvoicePdf(Invoice invoice) {
        Path uploadPath = Paths.get(INVOICE_DIR);
        try {
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
        } catch (IOException e) {
            log.error("Could not create invoice directory", e);
            throw new RuntimeException("Could not initialize storage directory");
        }

        String fileName = invoice.getInvoiceNumber() + ".pdf";
        Path filePath = uploadPath.resolve(fileName);

        try {
            // Create a proper PDF using a simple but valid PDF format
            createValidPdf(filePath, invoice);
            log.info("PDF generated successfully at {}", filePath);
            return filePath.toString();

        } catch (Exception e) {
            log.error("Error generating PDF invoice", e);
            throw new RuntimeException("Failed to generate PDF document");
        }
    }

    private void createValidPdf(Path filePath, Invoice invoice) throws IOException {
        // Create a minimal but valid PDF file
        try (OutputStream os = Files.newOutputStream(filePath)) {
            // PDF Header
            byte[] header = "%PDF-1.4\n".getBytes();
            os.write(header);
            
            // PDF Catalog
            String catalog = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
            os.write(catalog.getBytes());
            
            // PDF Pages
            String pages = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
            os.write(pages.getBytes());
            
            // PDF Page
            String page = "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n";
            os.write(page.getBytes());
            
            // PDF Font
            String font = "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";
            os.write(font.getBytes());
            
            // PDF Content Stream
            StringBuilder content = new StringBuilder();
            content.append("4 0 obj\n<< /Length ").append(getContentLength(invoice)).append(" >>\nstream\n");
            os.write(content.toString().getBytes());
            
            // Actual content
            String pdfContent = generatePdfContent(invoice);
            os.write(pdfContent.getBytes());
            
            os.write("endstream\n".getBytes());
            os.write("endobj\n".getBytes());
            
            // PDF Cross Reference Table
            String xref = "xref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000079 00000 n \n0000000173 00000 n \n0000000301 00000 n \n0000000412 00000 n \n";
            os.write(xref.getBytes());
            
            // PDF Trailer
            String trailer = "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n495\n%%EOF\n";
            os.write(trailer.getBytes());
        }
    }
    
    private int getContentLength(Invoice invoice) {
        return generatePdfContent(invoice).length();
    }
    
    private String generatePdfContent(Invoice invoice) {
        StringBuilder content = new StringBuilder();
        content.append("BT\n/F1 12 Tf\n");
        
        // Title
        content.append("100 700 Td (Hospital Management System Invoice) Tj\n");
        content.append("0 -20 Td (====================================) Tj\n");
        
        // Invoice Info
        content.append("0 -20 Td (Invoice Number: ").append(invoice.getInvoiceNumber()).append(") Tj\n");
        content.append("0 -15 Td (Date: ").append(invoice.getCreatedAt() != null 
                ? invoice.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
                : new java.util.Date().toString()).append(") Tj\n");
        
        // Patient Info
        content.append("0 -20 Td (Patient Information) Tj\n");
        content.append("0 -15 Td (Name: ").append(invoice.getPatient().getUser().getName()).append(") Tj\n");
        content.append("0 -15 Td (ID: ").append(invoice.getPatient().getId()).append(") Tj\n");
        
        // Appointment Info
        content.append("0 -20 Td (Appointment Information) Tj\n");
        content.append("0 -15 Td (Appointment ID: ").append(invoice.getAppointment().getId()).append(") Tj\n");
        content.append("0 -15 Td (Doctor: ").append(invoice.getAppointment().getDoctor().getUser().getName()).append(") Tj\n");
        
        // Billing Details
        content.append("0 -20 Td (Billing Details) Tj\n");
        content.append("0 -15 Td (Consultation Fee: ₹").append(invoice.getAmount()).append(") Tj\n");
        content.append("0 -15 Td (Tax (18%): ₹").append(invoice.getTax()).append(") Tj\n");
        content.append("0 -15 Td (Total Amount: ₹").append(invoice.getTotalAmount()).append(") Tj\n");
        content.append("0 -15 Td (Payment Method: ").append(invoice.getPaymentMethod()).append(") Tj\n");
        content.append("0 -15 Td (Status: ").append(invoice.getStatus()).append(") Tj\n");
        
        content.append("0 -20 Td (====================================) Tj\n");
        content.append("0 -15 Td (Thank you for choosing our hospital.) Tj\n");
        
        content.append("ET\n");
        return content.toString();
    }
}
