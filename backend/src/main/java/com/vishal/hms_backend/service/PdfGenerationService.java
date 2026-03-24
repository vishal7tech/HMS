package com.vishal.hms_backend.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.vishal.hms_backend.entity.Invoice;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.FileOutputStream;
import java.io.IOException;
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

        try (FileOutputStream fos = new FileOutputStream(filePath.toFile())) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, fos);

            document.open();

            // Add Title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22);
            Paragraph title = new Paragraph("Hospital Management System Invoice", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Add Invoice Info
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12);

            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingAfter(20);

            infoTable.addCell(getCell("Invoice Number:", boldFont));
            infoTable.addCell(getCell(invoice.getInvoiceNumber(), normalFont));

            infoTable.addCell(getCell("Date:", boldFont));
            String dateStr = invoice.getAppointment().getSlotTime()
                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
            infoTable.addCell(getCell(dateStr, normalFont));

            infoTable.addCell(getCell("Patient Name:", boldFont));
            infoTable.addCell(getCell(invoice.getPatient().getUser().getName(), normalFont));

            infoTable.addCell(getCell("Doctor Name:", boldFont));
            infoTable.addCell(getCell(invoice.getAppointment().getDoctor().getUser().getName(), normalFont));

            document.add(infoTable);

            // Add Billing Items
            PdfPTable itemsTable = new PdfPTable(2);
            itemsTable.setWidthPercentage(100);
            itemsTable.setSpacingAfter(20);

            PdfPCell descHeader = new PdfPCell(new Phrase("Description", boldFont));
            descHeader.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
            descHeader.setPadding(5);

            PdfPCell amountHeader = new PdfPCell(new Phrase("Amount (USD)", boldFont));
            amountHeader.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
            amountHeader.setPadding(5);

            itemsTable.addCell(descHeader);
            itemsTable.addCell(amountHeader);

            itemsTable.addCell(getCell("Consultation Fee", normalFont));
            itemsTable.addCell(getCell("$" + invoice.getAmount().toString(), normalFont));

            document.add(itemsTable);

            // Total
            Paragraph total = new Paragraph("Total Amount: $" + invoice.getAmount().toString(), titleFont);
            total.setAlignment(Element.ALIGN_RIGHT);
            document.add(total);

            // Footer
            Paragraph footer = new Paragraph("Thank you for choosing our hospital.", normalFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(50);
            document.add(footer);

            document.close();
            log.info("PDF generated successfully at {}", filePath);

            return filePath.toString();

        } catch (Exception e) {
            log.error("Error generating PDF invoice", e);
            throw new RuntimeException("Failed to generate PDF document");
        }
    }

    private PdfPCell getCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(PdfPCell.NO_BORDER);
        cell.setPadding(5);
        return cell;
    }
}
