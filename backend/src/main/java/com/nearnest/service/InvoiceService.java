package com.nearnest.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.nearnest.model.Booking;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class InvoiceService {

    public byte[] generateInvoicePdf(Booking booking) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Font styles
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, Color.BLACK);
            Font subHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.DARK_GRAY);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 11, Color.BLACK);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.BLACK);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.GRAY);

            // Title and Branding
            Paragraph brand = new Paragraph("ProxiSense", headerFont);
            brand.setAlignment(Element.ALIGN_LEFT);
            document.add(brand);

            Paragraph slogan = new Paragraph("Hyperlocal Service Network", smallFont);
            slogan.setSpacingAfter(20);
            document.add(slogan);

            // Invoice Header
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            
            PdfPCell cellLeft = new PdfPCell();
            cellLeft.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
            cellLeft.addElement(new Paragraph("INVOICE", subHeaderFont));
            cellLeft.addElement(new Paragraph("Order ID: #" + String.format("%06d", booking.getId()), normalFont));
            cellLeft.addElement(new Paragraph("Date: " + booking.getBookingDate().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")), normalFont));
            headerTable.addCell(cellLeft);

            PdfPCell cellRight = new PdfPCell();
            cellRight.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
            cellRight.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph statusPara = new Paragraph("Status: " + booking.getStatus(), boldFont);
            if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
                statusPara.setFont(FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.RED));
            } else if (booking.getStatus() == Booking.BookingStatus.COMPLETED) {
                statusPara.setFont(FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, new Color(16, 185, 129)));
            }
            statusPara.setAlignment(Element.ALIGN_RIGHT);
            cellRight.addElement(statusPara);
            headerTable.addCell(cellRight);

            document.add(headerTable);
            document.add(new Paragraph("\n"));

            // Customer & Provider Info
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingBefore(20);

            PdfPCell customerCell = new PdfPCell();
            customerCell.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
            customerCell.addElement(new Paragraph("CUSTOMER", smallFont));
            customerCell.addElement(new Paragraph(booking.getUser().getFullName(), boldFont));
            customerCell.addElement(new Paragraph(booking.getUser().getEmail(), normalFont));
            customerCell.addElement(new Paragraph(booking.getUser().getPhone(), normalFont));
            infoTable.addCell(customerCell);

            PdfPCell providerCell = new PdfPCell();
            providerCell.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
            providerCell.addElement(new Paragraph("SERVICE PROVIDER", smallFont));
            providerCell.addElement(new Paragraph(booking.getService().getProvider().getFullName(), boldFont));
            providerCell.addElement(new Paragraph(booking.getService().getTitle(), normalFont));
            providerCell.addElement(new Paragraph("Service Location: " + booking.getService().getLocation(), normalFont));
            infoTable.addCell(providerCell);

            document.add(infoTable);
            document.add(new Paragraph("\n\n"));

            // Itemized Table
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setWidths(new float[] { 3, 1 });

            // Table Header
            PdfPCell h1 = new PdfPCell(new Phrase("Service Description", boldFont));
            h1.setBackgroundColor(new Color(245, 247, 250));
            h1.setPadding(10);
            table.addCell(h1);

            PdfPCell h2 = new PdfPCell(new Phrase("Amount", boldFont));
            h2.setBackgroundColor(new Color(245, 247, 250));
            h2.setPadding(10);
            table.addCell(h2);

            // Row 1: Service Base
            PdfPCell r1c1 = new PdfPCell(new Phrase(booking.getService().getTitle() + " - " + booking.getService().getCategory(), normalFont));
            r1c1.setPadding(10);
            table.addCell(r1c1);

            PdfPCell r1c2 = new PdfPCell(new Phrase("₹" + booking.getService().getPrice(), normalFont));
            r1c2.setPadding(10);
            table.addCell(r1c2);

            // Row 2: Platform Fee
            PdfPCell r2c1 = new PdfPCell(new Phrase("Platform Convenience Fee", normalFont));
            r2c1.setPadding(10);
            table.addCell(r2c1);

            PdfPCell r2c2 = new PdfPCell(new Phrase("₹" + (booking.getPlatformFee() != null ? booking.getPlatformFee() : 0), normalFont));
            r2c2.setPadding(10);
            table.addCell(r2c2);

            document.add(table);

            // Totals
            PdfPTable totalTable = new PdfPTable(2);
            totalTable.setWidthPercentage(100);
            totalTable.setWidths(new float[] { 3, 1 });

            PdfPCell empty = new PdfPCell(new Phrase("TOTAL AMOUNT", boldFont));
            empty.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
            empty.setPadding(10);
            empty.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalTable.addCell(empty);

            PdfPCell total = new PdfPCell(new Phrase("₹" + booking.getTotalPrice(), headerFont));
            total.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
            total.setPadding(10);
            total.setBackgroundColor(new Color(248, 250, 252));
            totalTable.addCell(total);


            document.add(totalTable);

            // Footer
            Paragraph footer = new Paragraph("Thank you for using ProxiSense!\nFor support, contact support@proxisense.com", smallFont);
            footer.setSpacingBefore(50);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
        } catch (DocumentException e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }
}
