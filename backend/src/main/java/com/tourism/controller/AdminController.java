package com.tourism.controller;

import com.tourism.dto.request.HotelRequest;
import com.tourism.dto.request.PackageRequest;
import com.tourism.dto.request.PlaceRequest;
import com.tourism.dto.request.ProfileUpdateRequest;
import com.tourism.dto.request.RegisterRequest;
import com.tourism.dto.response.*;
import com.tourism.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final PlaceService placeService;
    private final HotelService hotelService;
    private final PackageService packageService;
    private final BookingService bookingService;
    private final FeedbackService feedbackService;
    private final DashboardService dashboardService;
    private final PlaceReviewService placeReviewService;
    private final HotelReviewService hotelReviewService;

    // ---- Dashboard ----
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStats>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats", dashboardService.getStats()));
    }

    // ---- Reports ----
    @GetMapping("/reports/revenue")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRevenueReport() {
        return ResponseEntity.ok(ApiResponse.success("Revenue report retrieved", dashboardService.getRevenueReport()));
    }

    @GetMapping("/reports/bookings")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getBookingReport() {
        return ResponseEntity.ok(ApiResponse.success("Booking report retrieved", dashboardService.getBookingReport()));
    }

    // ---- Users ----
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", userService.getAllUsers()));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.success("User created", userService.createUser(request)));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("User retrieved", userService.getUserById(id)));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("User updated", userService.adminUpdateUser(id, request)));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted", null));
    }

    @PutMapping("/users/{id}/disable")
    public ResponseEntity<ApiResponse<Void>> disableUser(@PathVariable Long id) {
        userService.disableUser(id);
        return ResponseEntity.ok(ApiResponse.success("User disabled", null));
    }

    @PutMapping("/users/{id}/enable")
    public ResponseEntity<ApiResponse<Void>> enableUser(@PathVariable Long id) {
        userService.enableUser(id);
        return ResponseEntity.ok(ApiResponse.success("User enabled", null));
    }

    // ---- Places ----
    @GetMapping("/places")
    public ResponseEntity<ApiResponse<List<PlaceResponse>>> getAllPlaces() {
        return ResponseEntity.ok(ApiResponse.success("Places retrieved", placeService.getAllPlaces()));
    }

    @PostMapping("/places")
    public ResponseEntity<ApiResponse<PlaceResponse>> createPlace(@Valid @RequestBody PlaceRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Place created", placeService.createPlace(request)));
    }

    @PutMapping("/places/{id}")
    public ResponseEntity<ApiResponse<PlaceResponse>> updatePlace(
            @PathVariable Long id, @Valid @RequestBody PlaceRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Place updated", placeService.updatePlace(id, request)));
    }

    @PostMapping("/places/{id}/image")
    public ResponseEntity<ApiResponse<PlaceResponse>> uploadPlaceImage(
            @PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success("Image uploaded", placeService.uploadImage(id, file)));
    }

    @PostMapping("/places/{id}/gallery")
    public ResponseEntity<ApiResponse<PlaceResponse>> uploadPlaceGalleryImage(
            @PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success("Gallery image uploaded", placeService.uploadGalleryImage(id, file)));
    }

    @DeleteMapping("/places/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePlace(@PathVariable Long id) {
        placeService.deletePlace(id);
        return ResponseEntity.ok(ApiResponse.success("Place deleted", null));
    }

    // ---- Hotels ----
    @GetMapping("/hotels")
    public ResponseEntity<ApiResponse<List<HotelResponse>>> getAllHotels() {
        return ResponseEntity.ok(ApiResponse.success("Hotels retrieved", hotelService.getAllHotels()));
    }

    @PostMapping("/hotels")
    public ResponseEntity<ApiResponse<HotelResponse>> createHotel(@Valid @RequestBody HotelRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Hotel created", hotelService.createHotel(request)));
    }

    @PutMapping("/hotels/{id}")
    public ResponseEntity<ApiResponse<HotelResponse>> updateHotel(
            @PathVariable Long id, @Valid @RequestBody HotelRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Hotel updated", hotelService.updateHotel(id, request)));
    }

    @PostMapping("/hotels/{id}/image")
    public ResponseEntity<ApiResponse<HotelResponse>> uploadHotelImage(
            @PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success("Image uploaded", hotelService.uploadImage(id, file)));
    }

    @PostMapping("/hotels/{id}/gallery")
    public ResponseEntity<ApiResponse<HotelResponse>> uploadHotelGalleryImage(
            @PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success("Gallery image uploaded", hotelService.uploadGalleryImage(id, file)));
    }

    @DeleteMapping("/hotels/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteHotel(@PathVariable Long id) {
        hotelService.deleteHotel(id);
        return ResponseEntity.ok(ApiResponse.success("Hotel deleted", null));
    }

    // ---- Packages ----
    @GetMapping("/packages")
    public ResponseEntity<ApiResponse<List<PackageResponse>>> getAllPackages() {
        return ResponseEntity.ok(ApiResponse.success("Packages retrieved", packageService.getAllPackages()));
    }

    @PostMapping("/packages")
    public ResponseEntity<ApiResponse<PackageResponse>> createPackage(@Valid @RequestBody PackageRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Package created", packageService.createPackage(request)));
    }

    @PutMapping("/packages/{id}")
    public ResponseEntity<ApiResponse<PackageResponse>> updatePackage(
            @PathVariable Long id, @Valid @RequestBody PackageRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Package updated", packageService.updatePackage(id, request)));
    }

    @PostMapping("/packages/{id}/image")
    public ResponseEntity<ApiResponse<PackageResponse>> uploadPackageImage(
            @PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success("Image uploaded", packageService.uploadImage(id, file)));
    }

    @DeleteMapping("/packages/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePackage(@PathVariable Long id) {
        packageService.deletePackage(id);
        return ResponseEntity.ok(ApiResponse.success("Package deleted", null));
    }

    // ---- Bookings ----
    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllBookings() {
        return ResponseEntity.ok(ApiResponse.success("Bookings retrieved", bookingService.getAllBookings()));
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Booking retrieved", bookingService.getBookingById(id)));
    }

    @PutMapping("/bookings/{id}/status")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBookingStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        BookingResponse booking = bookingService.updateBookingStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Booking status updated", booking));
    }

    @DeleteMapping("/bookings/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.ok(ApiResponse.success("Booking deleted", null));
    }

    // ---- Feedback ----
    @GetMapping("/feedback")
    public ResponseEntity<ApiResponse<List<FeedbackResponse>>> getAllFeedback() {
        return ResponseEntity.ok(ApiResponse.success("Feedback retrieved", feedbackService.getAllFeedback()));
    }

    @PutMapping("/feedback/{id}/approve")
    public ResponseEntity<ApiResponse<FeedbackResponse>> approveFeedback(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Feedback approved", feedbackService.approveFeedback(id)));
    }

    @PutMapping("/feedback/{id}/reject")
    public ResponseEntity<ApiResponse<FeedbackResponse>> rejectFeedback(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Feedback rejected", feedbackService.rejectFeedback(id)));
    }

    @DeleteMapping("/feedback/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFeedback(@PathVariable Long id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.ok(ApiResponse.success("Feedback deleted", null));
    }

    // ---- Place Reviews ----
    @GetMapping("/place-reviews")
    public ResponseEntity<ApiResponse<List<PlaceReviewResponse>>> getAllPlaceReviews() {
        return ResponseEntity.ok(ApiResponse.success("Place reviews retrieved", placeReviewService.getAllReviews()));
    }

    @DeleteMapping("/place-reviews/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePlaceReview(@PathVariable Long id) {
        placeReviewService.deleteReview(id, null, true);
        return ResponseEntity.ok(ApiResponse.success("Place review deleted", null));
    }

    @PutMapping("/place-reviews/{id}/approve")
    public ResponseEntity<ApiResponse<PlaceReviewResponse>> approvePlaceReview(
            @PathVariable Long id, @RequestParam boolean isApproved) {
        return ResponseEntity.ok(ApiResponse.success("Place review approval status updated", placeReviewService.approveReview(id, isApproved)));
    }

    // ---- Hotel Reviews ----
    @GetMapping("/hotel-reviews")
    public ResponseEntity<ApiResponse<List<HotelReviewResponse>>> getAllHotelReviews() {
        return ResponseEntity.ok(ApiResponse.success("Hotel reviews retrieved", hotelReviewService.getAllReviews()));
    }

    @DeleteMapping("/hotel-reviews/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteHotelReview(@PathVariable Long id) {
        hotelReviewService.deleteReview(id, null, true);
        return ResponseEntity.ok(ApiResponse.success("Hotel review deleted", null));
    }

    @PutMapping("/hotel-reviews/{id}/approve")
    public ResponseEntity<ApiResponse<HotelReviewResponse>> approveHotelReview(
            @PathVariable Long id, @RequestParam boolean isApproved) {
        return ResponseEntity.ok(ApiResponse.success("Hotel review approval status updated", hotelReviewService.approveReview(id, isApproved)));
    }
}
