package com.tourism.controller;

import com.tourism.dto.request.PlaceReviewRequest;
import com.tourism.dto.response.ApiResponse;
import com.tourism.dto.response.PlaceReviewResponse;
import com.tourism.dto.response.UserResponse;
import com.tourism.service.PlaceReviewService;
import com.tourism.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlaceReviewController {

    private final PlaceReviewService placeReviewService;
    private final UserService userService;

    @GetMapping("/{placeId}/reviews")
    public ResponseEntity<ApiResponse<List<PlaceReviewResponse>>> getReviews(@PathVariable Long placeId) {
        return ResponseEntity.ok(ApiResponse.success("Reviews retrieved", placeReviewService.getReviewsByPlace(placeId)));
    }

    @GetMapping("/reviews/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PlaceReviewResponse>>> getAllReviews() {
        return ResponseEntity.ok(ApiResponse.success("All reviews retrieved", placeReviewService.getAllReviews()));
    }

    @PostMapping("/{placeId}/reviews")
    public ResponseEntity<ApiResponse<PlaceReviewResponse>> addReview(
            @PathVariable Long placeId,
            Authentication authentication,
            @Valid @RequestBody PlaceReviewRequest request) {
        UserResponse user = userService.getUserByEmail(authentication.getName());
        PlaceReviewResponse review = placeReviewService.addReview(placeId, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Review added successfully", review));
    }

    @PutMapping("/reviews/{reviewId}")
    public ResponseEntity<ApiResponse<PlaceReviewResponse>> updateReview(
            @PathVariable Long reviewId,
            Authentication authentication,
            @Valid @RequestBody PlaceReviewRequest request) {
        UserResponse user = userService.getUserByEmail(authentication.getName());
        PlaceReviewResponse review = placeReviewService.updateReview(reviewId, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Review updated", review));
    }

    @PutMapping("/reviews/{reviewId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PlaceReviewResponse>> approveReview(
            @PathVariable Long reviewId,
            @RequestParam boolean isApproved) {
        return ResponseEntity.ok(ApiResponse.success("Review approval status updated", placeReviewService.approveReview(reviewId, isApproved)));
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable Long reviewId,
            Authentication authentication) {
        UserResponse user = userService.getUserByEmail(authentication.getName());
        placeReviewService.deleteReview(reviewId, user.getId(), false);
        return ResponseEntity.ok(ApiResponse.success("Review deleted", null));
    }
}
