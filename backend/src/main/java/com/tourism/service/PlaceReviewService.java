package com.tourism.service;

import com.tourism.dto.request.PlaceReviewRequest;
import com.tourism.dto.response.PlaceReviewResponse;
import com.tourism.entity.*;
import com.tourism.exception.BadRequestException;
import com.tourism.exception.ResourceNotFoundException;
import com.tourism.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlaceReviewService {

    private final PlaceReviewRepository placeReviewRepository;
    private final PlaceRepository placeRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    public List<PlaceReviewResponse> getReviewsByPlace(Long placeId) {
        return placeReviewRepository.findByPlaceIdAndIsApprovedTrueOrderByCreatedAtDesc(placeId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<PlaceReviewResponse> getReviewsByUser(Long userId) {
        return placeReviewRepository.findByUserId(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<PlaceReviewResponse> getAllReviews() {
        return placeReviewRepository.findAll()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public PlaceReviewResponse addReview(Long placeId, Long userId, PlaceReviewRequest request) {
        Booking booking = null;
        if (request.getBookingId() != null) {
            booking = bookingRepository.findById(request.getBookingId())
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + request.getBookingId()));
            if (!booking.getUser().getId().equals(userId)) {
                throw new BadRequestException("You can only review your own bookings.");
            }
        } else {
            List<Booking> bookings = bookingRepository.findByUserIdAndTourPackage_PlaceId(userId, placeId);
            booking = bookings.stream()
                    .filter(b -> b.getBookingStatus().equalsIgnoreCase("CONFIRMED") || b.getBookingStatus().equalsIgnoreCase("COMPLETED"))
                    .findFirst()
                    .orElseThrow(() -> new BadRequestException("You can only review places you have visited through a confirmed booking."));
        }

        if (!booking.getBookingStatus().equalsIgnoreCase("CONFIRMED") && !booking.getBookingStatus().equalsIgnoreCase("COMPLETED")) {
            throw new BadRequestException("You can only review places you have visited through a confirmed booking.");
        }

        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> new ResourceNotFoundException("Place not found with id: " + placeId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        PlaceReview review = placeReviewRepository.findByPlaceIdAndUserId(placeId, userId)
                .orElse(PlaceReview.builder().place(place).user(user).booking(booking).isApproved(false).build());

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setBooking(booking);
        review.setIsApproved(false); // Reset approval status on update
        PlaceReview saved = placeReviewRepository.save(review);
        recalculateRating(placeId);
        return toResponse(saved);
    }

    @Transactional
    public PlaceReviewResponse updateReview(Long reviewId, Long userId, PlaceReviewRequest request) {
        PlaceReview review = placeReviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));
        if (!review.getUser().getId().equals(userId)) {
            throw new BadRequestException("You can only edit your own reviews");
        }
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setIsApproved(false); // Reset approval status on edit
        PlaceReview saved = placeReviewRepository.save(review);
        recalculateRating(review.getPlace().getId());
        return toResponse(saved);
    }

    @Transactional
    public PlaceReviewResponse approveReview(Long reviewId, boolean isApproved) {
        PlaceReview review = placeReviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));
        review.setIsApproved(isApproved);
        PlaceReview saved = placeReviewRepository.save(review);
        recalculateRating(review.getPlace().getId());
        return toResponse(saved);
    }

    @Transactional
    public void deleteReview(Long reviewId, Long userId, boolean isAdmin) {
        PlaceReview review = placeReviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));
        if (!isAdmin && !review.getUser().getId().equals(userId)) {
            throw new BadRequestException("You can only delete your own reviews");
        }
        Long placeId = review.getPlace().getId();
        placeReviewRepository.delete(review);
        recalculateRating(placeId);
    }

    /**
     * Recalculates the place average rating from all reviews and persists it.
     */
    private void recalculateRating(Long placeId) {
        placeRepository.findById(placeId).ifPresent(place -> {
            // Fetch only APPROVED reviews to calculate rating
            List<PlaceReview> approvedReviews = placeReviewRepository.findByPlaceIdAndIsApprovedTrueOrderByCreatedAtDesc(placeId);
            long count = approvedReviews.size();
            double avg = 0.0;
            if (count > 0) {
                double sum = approvedReviews.stream().mapToDouble(PlaceReview::getRating).sum();
                avg = sum / count;
            }
            place.setRating(Math.round(avg * 10.0) / 10.0);
            place.setReviewCount((int) count);
            placeRepository.save(place);
        });
    }

    public PlaceReviewResponse toResponse(PlaceReview r) {
        return PlaceReviewResponse.builder()
                .id(r.getId())
                .placeId(r.getPlace().getId())
                .placeName(r.getPlace().getPlaceName())
                .userId(r.getUser().getId())
                .userFullName(r.getUser().getFullName())
                .userProfileImage(r.getUser().getProfileImageUrl())
                .rating(r.getRating())
                .comment(r.getComment())
                .isApproved(r.getIsApproved())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
