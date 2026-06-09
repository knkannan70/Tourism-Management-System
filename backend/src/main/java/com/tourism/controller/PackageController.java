package com.tourism.controller;

import com.tourism.dto.request.PackageRequest;
import com.tourism.dto.response.ApiResponse;
import com.tourism.dto.response.PackageResponse;
import com.tourism.service.PackageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/packages")
@RequiredArgsConstructor
public class PackageController {

    private final PackageService packageService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PackageResponse>>> getAllPackages(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {
        List<PackageResponse> packages;
        if (search != null || minPrice != null || maxPrice != null) {
            packages = packageService.searchPackages(search, minPrice, maxPrice);
        } else {
            packages = packageService.getAllPackages();
        }
        return ResponseEntity.ok(ApiResponse.success("Packages retrieved", packages));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PackageResponse>> getPackageById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Package retrieved", packageService.getPackageById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PackageResponse>> createPackage(@Valid @RequestBody PackageRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Package created", packageService.createPackage(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PackageResponse>> updatePackage(
            @PathVariable Long id,
            @Valid @RequestBody PackageRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Package updated", packageService.updatePackage(id, request)));
    }

    @PostMapping("/{id}/image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PackageResponse>> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success("Image uploaded", packageService.uploadImage(id, file)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePackage(@PathVariable Long id) {
        packageService.deletePackage(id);
        return ResponseEntity.ok(ApiResponse.success("Package deleted", null));
    }
}
