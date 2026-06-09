package com.tourism.service;

import com.tourism.dto.request.HotelReviewRequest;
import com.tourism.dto.response.HotelReviewResponse;
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
public class HotelReviewService {

    private final HotelReviewRepository hotelReviewRepository;
    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final HotelService hotelService;

    public List<HotelReviewResponse> getReviewsByHotel(Long hotelId) {
        return hotelReviewRepository.findByHotelIdAndIsApprovedTrueOrderByCreatedAtDesc(hotelId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<HotelReviewResponse> getReviewsByUser(Long userId) {
        return hotelReviewRepository.findByUserId(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<HotelReviewResponse> getAllReviews() {
        return hotelReviewRepository.findAll()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public HotelReviewResponse addReview(Long hotelId, Long userId, HotelReviewRequest request) {
        Booking booking = null;
        if (request.getBookingId() != null) {
            booking = bookingRepository.findById(request.getBookingId())
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + request.getBookingId()));
            if (!booking.getUser().getId().equals(userId)) {
                throw new BadRequestException("You can only review your own bookings.");
            }
        } else {
            List<Booking> bookings = bookingRepository.findByUserIdAndTourPackage_HotelId(userId, hotelId);
            booking = bookings.stream()
                    .filter(b -> b.getBookingStatus().equalsIgnoreCase("CONFIRMED") || b.getBookingStatus().equalsIgnoreCase("COMPLETED"))
                    .findFirst()
                    .orElseThrow(() -> new BadRequestException("You can only review hotels you have visited through a confirmed booking."));
        }

        if (!booking.getBookingStatus().equalsIgnoreCase("CONFIRMED") && !booking.getBookingStatus().equalsIgnoreCase("COMPLETED")) {
            throw new BadRequestException("You can only review hotels you have visited through a confirmed booking.");
        }

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + hotelId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        HotelReview review = hotelReviewRepository.findByHotelIdAndUserId(hotelId, userId)
                .orElse(HotelReview.builder().hotel(hotel).user(user).booking(booking).isApproved(false).build());

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setBooking(booking);
        review.setIsApproved(false); // Reset approval status on update
        HotelReview saved = hotelReviewRepository.save(review);
        hotelService.recalculateRating(hotelId);
        return toResponse(saved);
    }

    @Transactional
    public HotelReviewResponse updateReview(Long reviewId, Long userId, HotelReviewRequest request) {
        HotelReview review = hotelReviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));
        if (!review.getUser().getId().equals(userId)) {
            throw new BadRequestException("You can only edit your own reviews");
        }
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setIsApproved(false); // Reset approval status on edit
        HotelReview saved = hotelReviewRepository.save(review);
        hotelService.recalculateRating(review.getHotel().getId());
        return toResponse(saved);
    }

    @Transactional
    public HotelReviewResponse approveReview(Long reviewId, boolean isApproved) {
        HotelReview review = hotelReviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));
        review.setIsApproved(isApproved);
        HotelReview saved = hotelReviewRepository.save(review);
        hotelService.recalculateRating(review.getHotel().getId());
        return toResponse(saved);
    }

    @Transactional
    public void deleteReview(Long reviewId, Long userId, boolean isAdmin) {
        HotelReview review = hotelReviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));
        if (!isAdmin && !review.getUser().getId().equals(userId)) {
            throw new BadRequestException("You can only delete your own reviews");
        }
        Long hotelId = review.getHotel().getId();
        hotelReviewRepository.delete(review);
        hotelService.recalculateRating(hotelId);
    }

    public HotelReviewResponse toResponse(HotelReview r) {
        return HotelReviewResponse.builder()
                .id(r.getId())
                .hotelId(r.getHotel().getId())
                .hotelName(r.getHotel().getHotelName())
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
