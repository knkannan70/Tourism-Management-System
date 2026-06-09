package com.tourism.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.tourism.entity.Booking;
import com.tourism.exception.ResourceNotFoundException;
import com.tourism.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class PdfService {

    private final BookingRepository bookingRepository;

    public byte[] generateBookingPdf(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to download this booking PDF");
        }

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, baos);

            document.open();

            // Title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, Color.BLUE);
            Paragraph title = new Paragraph("TourVista - Booking Invoice", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Booking Details Table
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);
            table.setSpacingAfter(10f);

            addTableRow(table, "Booking ID:", String.valueOf(booking.getId()));
            addTableRow(table, "Customer Name:", booking.getUser().getFullName());
            addTableRow(table, "Customer Email:", booking.getUser().getEmail());
            addTableRow(table, "Package Name:", booking.getTourPackage().getPackageName());
            addTableRow(table, "Booking Date:", booking.getBookingDate().format(DateTimeFormatter.ISO_DATE));
            addTableRow(table, "Travel Date:", booking.getTravelDate().format(DateTimeFormatter.ISO_DATE));
            addTableRow(table, "Number of Persons:", String.valueOf(booking.getNumberOfPersons()));
            addTableRow(table, "Total Amount:", "Rs. " + booking.getTotalAmount());
            addTableRow(table, "Booking Status:", booking.getBookingStatus());
            addTableRow(table, "Payment Status:", booking.getPaymentStatus());

            document.add(table);

            // Footer
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY);
            Paragraph footer = new Paragraph("Thank you for choosing TourVista! For any inquiries, contact info@tourvista.com.", footerFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(30);
            document.add(footer);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    private void addTableRow(PdfPTable table, String header, String value) {
        Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        PdfPCell hcell = new PdfPCell(new Phrase(header, headFont));
        hcell.setBorder(Rectangle.NO_BORDER);
        hcell.setPaddingBottom(10);
        table.addCell(hcell);

        PdfPCell vcell = new PdfPCell(new Phrase(value != null ? value : ""));
        vcell.setBorder(Rectangle.NO_BORDER);
        vcell.setPaddingBottom(10);
        table.addCell(vcell);
    }
}
