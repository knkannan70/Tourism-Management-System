package com.tourism.service;

import com.tourism.dto.request.FeedbackRequest;
import com.tourism.dto.response.FeedbackResponse;
import com.tourism.entity.Booking;
import com.tourism.entity.Feedback;
import com.tourism.entity.TourPackage;
import com.tourism.entity.User;
import com.tourism.exception.BadRequestException;
import com.tourism.exception.ResourceNotFoundException;
import com.tourism.repository.BookingRepository;
import com.tourism.repository.FeedbackRepository;
import com.tourism.repository.PackageRepository;
import com.tourism.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final PackageRepository packageRepository;
    private final BookingRepository bookingRepository;

    public FeedbackResponse createFeedback(Long userId, FeedbackRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Booking booking = null;
        TourPackage pkg;

        if (request.getBookingId() != null) {
            // New flow: derive package from booking
            booking = bookingRepository.findById(request.getBookingId())
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + request.getBookingId()));
            // Verify the booking belongs to this user
            if (!booking.getUser().getId().equals(userId)) {
                throw new BadRequestException("You can only submit feedback for your own bookings");
            }
            pkg = booking.getTourPackage();
        } else if (request.getPackageId() != null) {
            // Legacy flow: use packageId directly
            pkg = packageRepository.findById(request.getPackageId())
                    .orElseThrow(() -> new ResourceNotFoundException("Package not found with id: " + request.getPackageId()));
        } else {
            throw new BadRequestException("Either bookingId or packageId must be provided");
        }

        Feedback feedback = Feedback.builder()
                .user(user)
                .tourPackage(pkg)
                .booking(booking)
                .rating(request.getRating())
                .comment(request.getComment())
                .approved(false) // requires admin approval
                .likesCount(0)
                .helpfulCount(0)
                .build();
        return toResponse(feedbackRepository.save(feedback));
    }

    public List<FeedbackResponse> getAllFeedback() {
        return feedbackRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<FeedbackResponse> getApprovedFeedback() {
        return feedbackRepository.findByApprovedTrue().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<FeedbackResponse> getFeedbackByPackage(Long packageId) {
        return feedbackRepository.findByTourPackageIdAndApprovedTrue(packageId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<FeedbackResponse> getFeedbackByUser(Long userId) {
        return feedbackRepository.findByUserId(userId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public FeedbackResponse getFeedbackById(Long id) {
        return toResponse(findFeedback(id));
    }

    public FeedbackResponse approveFeedback(Long id) {
        Feedback feedback = findFeedback(id);
        feedback.setApproved(true);
        return toResponse(feedbackRepository.save(feedback));
    }

    public FeedbackResponse rejectFeedback(Long id) {
        Feedback feedback = findFeedback(id);
        feedback.setApproved(false);
        return toResponse(feedbackRepository.save(feedback));
    }

    public FeedbackResponse likeFeedback(Long id) {
        Feedback feedback = findFeedback(id);
        feedback.setLikesCount(feedback.getLikesCount() + 1);
        return toResponse(feedbackRepository.save(feedback));
    }

    public FeedbackResponse helpfulFeedback(Long id) {
        Feedback feedback = findFeedback(id);
        feedback.setHelpfulCount(feedback.getHelpfulCount() + 1);
        return toResponse(feedbackRepository.save(feedback));
    }

    public void deleteFeedback(Long id) {
        feedbackRepository.delete(findFeedback(id));
    }

    public Double getAverageRating() {
        Double avg = feedbackRepository.averageRating();
        return avg != null ? avg : 0.0;
    }

    private Feedback findFeedback(Long id) {
        return feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with id: " + id));
    }

    public FeedbackResponse toResponse(Feedback f) {
        if (f == null) return null;

        String bookingName = null;
        Long bookingId = null;
        if (f.getBooking() != null) {
            bookingId = f.getBooking().getId();
            String pkgName = f.getBooking().getTourPackage() != null
                    ? f.getBooking().getTourPackage().getPackageName() : "";
            String placeName = f.getBooking().getTourPackage() != null
                    && f.getBooking().getTourPackage().getPlace() != null
                    ? f.getBooking().getTourPackage().getPlace().getPlaceName() : "";
            bookingName = pkgName + " - " + placeName + " (" + f.getBooking().getBookingDate() + ")";
        }

        return FeedbackResponse.builder()
                .id(f.getId())
                .userId(f.getUser().getId())
                .userFullName(f.getUser().getFullName())
                .userEmail(f.getUser().getEmail())
                .packageId(f.getTourPackage() != null ? f.getTourPackage().getId() : null)
                .packageName(f.getTourPackage() != null ? f.getTourPackage().getPackageName() : "Global")
                .bookingId(bookingId)
                .bookingName(bookingName)
                .rating(f.getRating())
                .comment(f.getComment())
                .approved(f.getApproved())
                .likesCount(f.getLikesCount())
                .helpfulCount(f.getHelpfulCount())
                .createdAt(f.getCreatedAt())
                .build();
    }
}
