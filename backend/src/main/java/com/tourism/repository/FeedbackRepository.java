package com.tourism.repository;

import com.tourism.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByUserId(Long userId);
    List<Feedback> findByApprovedTrue();
    List<Feedback> findByTourPackageIdAndApprovedTrue(Long packageId);
    List<Feedback> findByBookingId(Long bookingId);

    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.approved = true")
    Double averageRating();

    void deleteByUserId(Long userId);
}
