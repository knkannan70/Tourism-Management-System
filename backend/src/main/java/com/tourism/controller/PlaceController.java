package com.tourism.controller;

import com.tourism.dto.request.PlaceRequest;
import com.tourism.dto.response.ApiResponse;
import com.tourism.dto.response.PlaceResponse;
import com.tourism.service.PlaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PlaceResponse>>> getAllPlaces(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long stateId,
            @RequestParam(required = false) Long districtId,
            @RequestParam(required = false) Long categoryId) {
        List<PlaceResponse> places;
        if (search != null && !search.isBlank()) {
            places = placeService.searchPlaces(search);
        } else if (stateId != null) {
            places = placeService.getPlacesByState(stateId);
        } else if (districtId != null) {
            places = placeService.getPlacesByDistrict(districtId);
        } else if (categoryId != null) {
            places = placeService.getPlacesByCategory(categoryId);
        } else {
            places = placeService.getAllPlaces();
        }
        return ResponseEntity.ok(ApiResponse.success("Places retrieved", places));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PlaceResponse>> getPlaceById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Place retrieved", placeService.getPlaceById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PlaceResponse>> createPlace(@Valid @RequestBody PlaceRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Place created", placeService.createPlace(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PlaceResponse>> updatePlace(
            @PathVariable Long id,
            @Valid @RequestBody PlaceRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Place updated", placeService.updatePlace(id, request)));
    }

    @PostMapping("/{id}/image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PlaceResponse>> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success("Image uploaded", placeService.uploadImage(id, file)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePlace(@PathVariable Long id) {
        placeService.deletePlace(id);
        return ResponseEntity.ok(ApiResponse.success("Place deleted", null));
    }
}
