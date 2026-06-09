package com.tourism.repository;

import com.tourism.entity.District;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DistrictRepository extends JpaRepository<District, Long> {
    List<District> findByStateId(Long stateId);
    Optional<District> findByDistrictNameAndStateStateName(String districtName, String stateName);
}
