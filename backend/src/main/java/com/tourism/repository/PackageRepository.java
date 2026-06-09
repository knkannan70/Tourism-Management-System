package com.tourism.repository;

import com.tourism.entity.TourPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PackageRepository extends JpaRepository<TourPackage, Long> {
    @Query("SELECT p FROM TourPackage p WHERE " +
           "(:search IS NULL OR LOWER(p.packageName) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice)")
    List<TourPackage> searchPackages(
        @Param("search") String search,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice
    );

    long countByPlaceId(Long placeId);
    List<TourPackage> findByPlaceId(Long placeId);
    List<TourPackage> findByHotelId(Long hotelId);
}
