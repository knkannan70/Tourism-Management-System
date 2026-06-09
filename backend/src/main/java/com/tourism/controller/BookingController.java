package com.tourism.controller;

import com.tourism.dto.request.BookingRequest;
import com.tourism.dto.response.ApiResponse;
import com.tourism.dto.response.BookingResponse;
import com.tourism.dto.response.UserResponse;
import com.tourism.service.BookingService;
import com.tourism.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final UserService userService;
    private final com.tourism.service.PdfService pdfService;

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            Authentication authentication,
            @Valid @RequestBody BookingRequest request) {
        UserResponse user = userService.getUserByEmail(authentication.getName());
        BookingResponse booking = bookingService.createBooking(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Booking created successfully", booking));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings(Authentication authentication) {
        UserResponse user = userService.getUserByEmail(authentication.getName());
        List<BookingResponse> bookings = bookingService.getBookingsByUser(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Bookings retrieved", bookings));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(
            @PathVariable Long id,
            Authentication authentication) {
        BookingResponse booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(ApiResponse.success("Booking retrieved", booking));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadBookingPdf(
            @PathVariable Long id,
            Authentication authentication) {
        UserResponse user = userService.getUserByEmail(authentication.getName());
        byte[] pdfBytes = pdfService.generateBookingPdf(id, user.getId());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "booking-" + id + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelBooking(
            @PathVariable Long id,
            Authentication authentication) {
        UserResponse user = userService.getUserByEmail(authentication.getName());
        bookingService.cancelBooking(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> softDeleteBooking(
            @PathVariable Long id,
            Authentication authentication) {
        UserResponse user = userService.getUserByEmail(authentication.getName());
        bookingService.softDeleteBooking(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Booking deleted", null));
    }
}
