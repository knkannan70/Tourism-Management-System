package com.tourism.repository;

import com.tourism.entity.State;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface StateRepository extends JpaRepository<State, Long> {
    Optional<State> findByStateName(String stateName);
    boolean existsByStateName(String stateName);
}
