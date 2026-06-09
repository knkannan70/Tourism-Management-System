package com.tourism.repository;

import com.tourism.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {
    List<Hotel> findByCityContainingIgnoreCase(String city);
    List<Hotel> findByHotelNameContainingIgnoreCaseOrCityContainingIgnoreCase(String name, String city);
    List<Hotel> findByStateId(Long stateId);
    List<Hotel> findByDistrictId(Long districtId);
    List<Hotel> findByPlaceId(Long placeId);
    List<Hotel> findByCostLessThanEqual(BigDecimal maxCost);
    List<Hotel> findByCostBetween(BigDecimal minCost, BigDecimal maxCost);
    long countByStateId(Long stateId);
    long countByDistrictId(Long districtId);
    long countByPlaceId(Long placeId);

    /**
     * Returns hotels explicitly linked to the given place,
     * OR hotels in the same district that have no explicit place link (backward compat).
     */
    @Query("SELECT h FROM Hotel h WHERE h.place.id = :placeId " +
           "OR (h.place IS NULL AND h.district.id = :districtId)")
    List<Hotel> findHotelsForPackageCreation(
            @Param("placeId") Long placeId,
            @Param("districtId") Long districtId);
}
