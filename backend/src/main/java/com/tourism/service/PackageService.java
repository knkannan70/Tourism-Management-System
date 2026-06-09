package com.tourism.service;

import com.tourism.dto.request.PackageRequest;
import com.tourism.dto.response.PackageResponse;
import com.tourism.entity.Hotel;
import com.tourism.entity.Place;
import com.tourism.entity.TourPackage;
import com.tourism.exception.ResourceNotFoundException;
import com.tourism.repository.BookingRepository;
import com.tourism.repository.HotelRepository;
import com.tourism.repository.PackageRepository;
import com.tourism.repository.PlaceRepository;
import com.tourism.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PackageService {

    private final PackageRepository packageRepository;
    private final PlaceRepository placeRepository;
    private final HotelRepository hotelRepository;
    private final BookingRepository bookingRepository;
    private final WishlistRepository wishlistRepository;
    private final FileStorageService fileStorageService;

    @Autowired
    @Lazy
    private PlaceService placeService;

    @Autowired
    @Lazy
    private HotelService hotelService;

    public List<PackageResponse> getAllPackages() {
        return packageRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public PackageResponse getPackageById(Long id) {
        return toResponse(findPackage(id));
    }

    public List<PackageResponse> searchPackages(String search, BigDecimal minPrice, BigDecimal maxPrice) {
        return packageRepository.searchPackages(search, minPrice, maxPrice)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public PackageResponse createPackage(PackageRequest request) {
        Place place = placeRepository.findById(request.getPlaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Place not found with id: " + request.getPlaceId()));
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + request.getHotelId()));
        TourPackage pkg = TourPackage.builder()
                .packageName(request.getPackageName())
                .place(place).hotel(hotel)
                .duration(request.getDuration())
                .price(request.getPrice())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .build();
        return toResponse(packageRepository.save(pkg));
    }

    @Transactional
    public PackageResponse updatePackage(Long id, PackageRequest request) {
        TourPackage pkg = findPackage(id);
        Place place = placeRepository.findById(request.getPlaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Place not found with id: " + request.getPlaceId()));
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + request.getHotelId()));
        pkg.setPackageName(request.getPackageName());
        pkg.setPlace(place);
        pkg.setHotel(hotel);
        pkg.setDuration(request.getDuration());
        pkg.setPrice(request.getPrice());
        pkg.setDescription(request.getDescription());
        if (request.getImageUrl() != null) pkg.setImageUrl(request.getImageUrl());
        return toResponse(packageRepository.save(pkg));
    }

    public PackageResponse uploadImage(Long id, MultipartFile file) {
        TourPackage pkg = findPackage(id);
        if (pkg.getImageUrl() != null) fileStorageService.deleteFile(pkg.getImageUrl());
        pkg.setImageUrl(fileStorageService.storeFile(file, "packages"));
        return toResponse(packageRepository.save(pkg));
    }

    @Transactional
    public void deletePackage(Long id) {
        TourPackage pkg = findPackage(id);
        bookingRepository.deleteByTourPackageId(id);
        wishlistRepository.deleteByTourPackageId(id);
        packageRepository.delete(pkg);
    }

    private TourPackage findPackage(Long id) {
        return packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found with id: " + id));
    }

    public PackageResponse toResponse(TourPackage p) {
        return PackageResponse.builder()
                .id(p.getId())
                .packageName(p.getPackageName())
                .place(placeService.toResponse(p.getPlace()))
                .hotel(hotelService.toResponse(p.getHotel()))
                .duration(p.getDuration())
                .price(p.getPrice())
                .description(p.getDescription())
                .imageUrl(p.getImageUrl())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
