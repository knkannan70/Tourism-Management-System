package com.tourism.repository;

import com.tourism.entity.PlaceReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PlaceReviewRepository extends JpaRepository<PlaceReview, Long> {
    List<PlaceReview> findByPlaceIdOrderByCreatedAtDesc(Long placeId);
    List<PlaceReview> findByPlaceIdAndIsApprovedTrueOrderByCreatedAtDesc(Long placeId);
    List<PlaceReview> findByUserId(Long userId);
    Optional<PlaceReview> findByPlaceIdAndUserId(Long placeId, Long userId);
    boolean existsByPlaceIdAndUserId(Long placeId, Long userId);

    @Query("SELECT AVG(r.rating) FROM PlaceReview r WHERE r.place.id = :placeId AND r.isApproved = true")
    Double averageRatingByPlaceId(Long placeId);

    @Query("SELECT COUNT(r) FROM PlaceReview r WHERE r.place.id = :placeId AND r.isApproved = true")
    Long countByPlaceId(Long placeId);

    void deleteByPlaceId(Long placeId);
    void deleteByUserId(Long userId);
}
