package com.tourism.repository;

import com.tourism.entity.HotelReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface HotelReviewRepository extends JpaRepository<HotelReview, Long> {
    List<HotelReview> findByHotelIdOrderByCreatedAtDesc(Long hotelId);
    List<HotelReview> findByHotelIdAndIsApprovedTrueOrderByCreatedAtDesc(Long hotelId);
    List<HotelReview> findByUserId(Long userId);
    Optional<HotelReview> findByHotelIdAndUserId(Long hotelId, Long userId);
    boolean existsByHotelIdAndUserId(Long hotelId, Long userId);

    @Query("SELECT AVG(r.rating) FROM HotelReview r WHERE r.hotel.id = :hotelId AND r.isApproved = true")
    Double averageRatingByHotelId(Long hotelId);

    @Query("SELECT COUNT(r) FROM HotelReview r WHERE r.hotel.id = :hotelId AND r.isApproved = true")
    Long countByHotelId(Long hotelId);

    void deleteByHotelId(Long hotelId);
    void deleteByUserId(Long userId);
}
