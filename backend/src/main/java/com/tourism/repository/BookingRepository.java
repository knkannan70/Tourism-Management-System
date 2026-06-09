package com.tourism.repository;

import com.tourism.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);
    List<Booking> findByUserIdAndUserDeletedFalse(Long userId);
    List<Booking> findByBookingStatus(String status);
    long countByBookingStatus(String status);

    @Query("SELECT SUM(b.totalAmount) FROM Booking b WHERE b.bookingStatus = 'CONFIRMED'")
    BigDecimal sumRevenue();

    boolean existsByUserIdAndTourPackage_PlaceIdAndBookingStatus(Long userId, Long placeId, String status);
    boolean existsByUserIdAndTourPackage_HotelIdAndBookingStatus(Long userId, Long hotelId, String status);

    List<Booking> findByUserIdAndTourPackage_PlaceId(Long userId, Long placeId);
    List<Booking> findByUserIdAndTourPackage_HotelId(Long userId, Long hotelId);

    void deleteByTourPackageId(Long packageId);
    void deleteByUserId(Long userId);
}
