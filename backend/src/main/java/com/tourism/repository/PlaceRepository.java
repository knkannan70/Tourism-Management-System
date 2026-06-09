package com.tourism.repository;

import com.tourism.entity.Place;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlaceRepository extends JpaRepository<Place, Long> {
    List<Place> findByRegionContainingIgnoreCase(String region);
    List<Place> findByPlaceNameContainingIgnoreCaseOrRegionContainingIgnoreCase(String name, String region);
    
    List<Place> findByCategoryId(Long categoryId);
    List<Place> findByStateId(Long stateId);
    List<Place> findByDistrictId(Long districtId);

    long countByCategoryId(Long categoryId);
    long countByStateId(Long stateId);
    long countByDistrictId(Long districtId);
}
