package com.tourism.controller;

import com.tourism.dto.request.HotelRequest;
import com.tourism.dto.response.ApiResponse;
import com.tourism.dto.response.HotelResponse;
import com.tourism.service.HotelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<HotelResponse>>> getAllHotels(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long stateId,
            @RequestParam(required = false) Long districtId) {
        List<HotelResponse> hotels;
        if (search != null && !search.isBlank()) {
            hotels = hotelService.searchHotels(search);
        } else if (stateId != null) {
            hotels = hotelService.getHotelsByState(stateId);
        } else if (districtId != null) {
            hotels = hotelService.getHotelsByDistrict(districtId);
        } else {
            hotels = hotelService.getAllHotels();
        }
        return ResponseEntity.ok(ApiResponse.success("Hotels retrieved", hotels));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HotelResponse>> getHotelById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Hotel retrieved", hotelService.getHotelById(id)));
    }

    /**
     * Returns hotels suitable for package creation based on the selected place.
     * Includes hotels explicitly linked to the place + hotels in the same district with no place_id (backward compat).
     */
    @GetMapping("/by-place/{placeId}")
    public ResponseEntity<ApiResponse<List<HotelResponse>>> getHotelsByPlace(@PathVariable Long placeId) {
        return ResponseEntity.ok(ApiResponse.success("Hotels retrieved for place",
                hotelService.getHotelsForPackageCreation(placeId)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HotelResponse>> createHotel(@Valid @RequestBody HotelRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Hotel created", hotelService.createHotel(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HotelResponse>> updateHotel(
            @PathVariable Long id,
            @Valid @RequestBody HotelRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Hotel updated", hotelService.updateHotel(id, request)));
    }

    @PostMapping("/{id}/image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HotelResponse>> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success("Image uploaded", hotelService.uploadImage(id, file)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteHotel(@PathVariable Long id) {
        hotelService.deleteHotel(id);
        return ResponseEntity.ok(ApiResponse.success("Hotel deleted", null));
    }
}
