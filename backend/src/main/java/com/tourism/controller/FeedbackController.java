package com.tourism.controller;

import com.tourism.dto.request.FeedbackRequest;
import com.tourism.dto.response.ApiResponse;
import com.tourism.dto.response.FeedbackResponse;
import com.tourism.dto.response.UserResponse;
import com.tourism.service.FeedbackService;
import com.tourism.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final UserService userService;

    // Public / authenticated users fetch only APPROVED feedback
    @GetMapping("/api/feedback")
    public ResponseEntity<ApiResponse<List<FeedbackResponse>>> getApprovedFeedback() {
        return ResponseEntity.ok(ApiResponse.success("Feedback retrieved", feedbackService.getApprovedFeedback()));
    }

    @GetMapping("/api/feedback/package/{packageId}")
    public ResponseEntity<ApiResponse<List<FeedbackResponse>>> getFeedbackByPackage(@PathVariable Long packageId) {
        return ResponseEntity.ok(ApiResponse.success("Feedback retrieved", feedbackService.getFeedbackByPackage(packageId)));
    }

    @GetMapping("/api/feedback/average-rating")
    public ResponseEntity<ApiResponse<Double>> getAverageRating() {
        return ResponseEntity.ok(ApiResponse.success("Average rating", feedbackService.getAverageRating()));
    }

    @GetMapping("/api/feedback/{id}")
    public ResponseEntity<ApiResponse<FeedbackResponse>> getFeedbackById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Feedback retrieved", feedbackService.getFeedbackById(id)));
    }

    @PostMapping("/api/feedback")
    public ResponseEntity<ApiResponse<FeedbackResponse>> createFeedback(
            Authentication authentication,
            @Valid @RequestBody FeedbackRequest request) {
        UserResponse user = userService.getUserByEmail(authentication.getName());
        FeedbackResponse feedback = feedbackService.createFeedback(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Feedback submitted for approval", feedback));
    }

    @PostMapping("/api/feedback/{id}/like")
    public ResponseEntity<ApiResponse<FeedbackResponse>> likeFeedback(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Feedback liked", feedbackService.likeFeedback(id)));
    }

    @PostMapping("/api/feedback/{id}/helpful")
    public ResponseEntity<ApiResponse<FeedbackResponse>> helpfulFeedback(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Feedback marked helpful", feedbackService.helpfulFeedback(id)));
    }

    @DeleteMapping("/api/feedback/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFeedback(
            @PathVariable Long id,
            Authentication authentication) {
        // Simple deletion (can restrict if necessary)
        feedbackService.deleteFeedback(id);
        return ResponseEntity.ok(ApiResponse.success("Feedback deleted", null));
    }
}
