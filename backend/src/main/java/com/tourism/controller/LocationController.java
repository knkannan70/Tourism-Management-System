package com.tourism.controller;

import com.tourism.dto.response.ApiResponse;
import com.tourism.entity.District;
import com.tourism.entity.State;
import com.tourism.repository.DistrictRepository;
import com.tourism.repository.StateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class LocationController {

    private final StateRepository stateRepository;
    private final DistrictRepository districtRepository;

    @GetMapping("/states")
    public ResponseEntity<ApiResponse<List<State>>> getAllStates() {
        return ResponseEntity.ok(ApiResponse.success("States retrieved", stateRepository.findAll()));
    }

    @GetMapping("/states/{stateId}/districts")
    public ResponseEntity<ApiResponse<List<District>>> getDistrictsByState(@PathVariable Long stateId) {
        return ResponseEntity.ok(ApiResponse.success("Districts retrieved", districtRepository.findByStateId(stateId)));
    }

    @GetMapping("/districts")
    public ResponseEntity<ApiResponse<List<District>>> getAllDistricts() {
        return ResponseEntity.ok(ApiResponse.success("Districts retrieved", districtRepository.findAll()));
    }
}
