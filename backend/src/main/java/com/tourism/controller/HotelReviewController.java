package com.tourism.controller;

import com.tourism.dto.request.HotelReviewRequest;
import com.tourism.dto.response.ApiResponse;
import com.tourism.dto.response.HotelReviewResponse;
import com.tourism.dto.response.UserResponse;
import com.tourism.service.HotelReviewService;
import com.tourism.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
public class HotelReviewController {

    private final HotelReviewService hotelReviewService;
    private final UserService userService;

    @GetMapping("/{hotelId}/reviews")
    public ResponseEntity<ApiResponse<List<HotelReviewResponse>>> getReviews(@PathVariable Long hotelId) {
        return ResponseEntity.ok(ApiResponse.success("Reviews retrieved", hotelReviewService.getReviewsByHotel(hotelId)));
    }

    @GetMapping("/reviews/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<HotelReviewResponse>>> getAllReviews() {
        return ResponseEntity.ok(ApiResponse.success("All reviews retrieved", hotelReviewService.getAllReviews()));
    }

    @PostMapping("/{hotelId}/reviews")
    public ResponseEntity<ApiResponse<HotelReviewResponse>> addReview(
            @PathVariable Long hotelId,
            Authentication authentication,
            @Valid @RequestBody HotelReviewRequest request) {
        UserResponse user = userService.getUserByEmail(authentication.getName());
        HotelReviewResponse review = hotelReviewService.addReview(hotelId, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Review added successfully", review));
    }

    @PutMapping("/reviews/{reviewId}")
    public ResponseEntity<ApiResponse<HotelReviewResponse>> updateReview(
            @PathVariable Long reviewId,
            Authentication authentication,
            @Valid @RequestBody HotelReviewRequest request) {
        UserResponse user = userService.getUserByEmail(authentication.getName());
        HotelReviewResponse review = hotelReviewService.updateReview(reviewId, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Review updated", review));
    }

    @PutMapping("/reviews/{reviewId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HotelReviewResponse>> approveReview(
            @PathVariable Long reviewId,
            @RequestParam boolean isApproved) {
        return ResponseEntity.ok(ApiResponse.success("Review approval status updated", hotelReviewService.approveReview(reviewId, isApproved)));
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable Long reviewId,
            Authentication authentication) {
        UserResponse user = userService.getUserByEmail(authentication.getName());
        hotelReviewService.deleteReview(reviewId, user.getId(), false);
        return ResponseEntity.ok(ApiResponse.success("Review deleted", null));
    }
}
