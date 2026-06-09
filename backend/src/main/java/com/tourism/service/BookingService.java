package com.tourism.service;

import com.tourism.dto.request.BookingRequest;
import com.tourism.dto.response.BookingResponse;
import com.tourism.entity.Booking;
import com.tourism.entity.TourPackage;
import com.tourism.entity.User;
import com.tourism.exception.BadRequestException;
import com.tourism.exception.ResourceNotFoundException;
import com.tourism.repository.BookingRepository;
import com.tourism.repository.PackageRepository;
import com.tourism.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final PackageRepository packageRepository;
    private final PackageService packageService;

    public BookingResponse createBooking(Long userId, BookingRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        TourPackage pkg = packageRepository.findById(request.getPackageId())
                .orElseThrow(() -> new ResourceNotFoundException("Package not found with id: " + request.getPackageId()));
        if (request.getTravelDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Travel date must be in the future");
        }
        Booking booking = Booking.builder()
                .user(user)
                .tourPackage(pkg)
                .bookingDate(LocalDate.now())
                .travelDate(request.getTravelDate())
                .totalAmount(request.getTotalAmount() != null ? request.getTotalAmount() : pkg.getPrice())
                .bookingStatus("CONFIRMED")
                .numberOfPersons(request.getNumberOfPersons() != null ? request.getNumberOfPersons() : 1)
                .specialRequests(request.getSpecialRequests())
                .paymentStatus(request.getPaymentStatus() != null ? request.getPaymentStatus() : "PAID")
                .paymentId(request.getPaymentId() != null ? request.getPaymentId() : "TXN" + System.currentTimeMillis())
                .build();
        return toResponse(bookingRepository.save(booking));
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<BookingResponse> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserIdAndUserDeletedFalse(userId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public BookingResponse getBookingById(Long id) {
        return toResponse(findBooking(id));
    }

    public BookingResponse updateBookingStatus(Long id, String status) {
        Booking booking = findBooking(id);
        List<String> validStatuses = List.of("PENDING", "CONFIRMED", "CANCELLED", "COMPLETED");
        if (!validStatuses.contains(status.toUpperCase())) {
            throw new BadRequestException("Invalid booking status: " + status);
        }
        booking.setBookingStatus(status.toUpperCase());
        return toResponse(bookingRepository.save(booking));
    }

    public void cancelBooking(Long id, Long userId) {
        Booking booking = findBooking(id);
        if (!booking.getUser().getId().equals(userId)) {
            throw new BadRequestException("You can only cancel your own bookings");
        }
        String currentStatus = booking.getBookingStatus();
        if ("CANCELLED".equals(currentStatus)) {
            throw new BadRequestException("Booking is already cancelled");
        }
        if ("COMPLETED".equals(currentStatus)) {
            throw new BadRequestException("Cannot cancel a completed booking");
        }
        booking.setBookingStatus("CANCELLED");
        bookingRepository.save(booking);
    }

    public void deleteBooking(Long id) {
        bookingRepository.delete(findBooking(id));
    }

    public void softDeleteBooking(Long id, Long userId) {
        Booking booking = findBooking(id);
        if (!booking.getUser().getId().equals(userId)) {
            throw new BadRequestException("You can only delete your own bookings");
        }
        booking.setUserDeleted(true);
        bookingRepository.save(booking);
    }

    private Booking findBooking(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }

    public BookingResponse toResponse(Booking b) {
        var pkgDto = packageService.toResponse(b.getTourPackage());
        return BookingResponse.builder()
                .id(b.getId())
                .userId(b.getUser().getId())
                .userFullName(b.getUser().getFullName())
                .userEmail(b.getUser().getEmail())
                .tourPackage(pkgDto)
                .bookingDate(b.getBookingDate())
                .travelDate(b.getTravelDate())
                .totalAmount(b.getTotalAmount())
                .bookingStatus(b.getBookingStatus())
                .status(b.getBookingStatus())
                .packageName(pkgDto.getPackageName())
                .placeName(pkgDto.getPlace() != null ? pkgDto.getPlace().getPlaceName() : "")
                .packageImageUrl(pkgDto.getImageUrl())
                .numberOfPersons(b.getNumberOfPersons() != null ? b.getNumberOfPersons() : 1)
                .specialRequests(b.getSpecialRequests())
                .paymentStatus(b.getPaymentStatus())
                .paymentId(b.getPaymentId())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
