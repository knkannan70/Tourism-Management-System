package com.tourism.service;

import com.tourism.dto.request.PlaceRequest;
import com.tourism.dto.response.PlaceResponse;
import com.tourism.entity.*;
import com.tourism.exception.ResourceNotFoundException;
import com.tourism.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import java.util.List;
import java.util.stream.Collectors;
import com.tourism.util.VideoUtils;

@Service
@RequiredArgsConstructor
public class PlaceService {

    private final PlaceRepository placeRepository;
    private final CategoryRepository categoryRepository;
    private final StateRepository stateRepository;
    private final DistrictRepository districtRepository;
    private final PlaceImageRepository placeImageRepository;
    private final PlaceReviewRepository placeReviewRepository;
    private final PackageRepository packageRepository;
    private final HotelRepository hotelRepository;
    private final FileStorageService fileStorageService;

    @Autowired
    @Lazy
    private PackageService packageService;

    @Autowired
    @Lazy
    private HotelService hotelService;

    public List<PlaceResponse> getAllPlaces() {
        return placeRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public PlaceResponse getPlaceById(Long id) {
        return toResponse(findPlace(id));
    }

    public List<PlaceResponse> searchPlaces(String query) {
        return placeRepository.findByPlaceNameContainingIgnoreCaseOrRegionContainingIgnoreCase(query, query)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<PlaceResponse> getPlacesByState(Long stateId) {
        return placeRepository.findByStateId(stateId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<PlaceResponse> getPlacesByDistrict(Long districtId) {
        return placeRepository.findByDistrictId(districtId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<PlaceResponse> getPlacesByCategory(Long categoryId) {
        return placeRepository.findByCategoryId(categoryId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public PlaceResponse createPlace(PlaceRequest request) {
        Category category = request.getCategoryId() != null ? categoryRepository.findById(request.getCategoryId()).orElse(null) : null;
        State state = request.getStateId() != null ? stateRepository.findById(request.getStateId()).orElse(null) : null;
        District district = request.getDistrictId() != null ? districtRepository.findById(request.getDistrictId()).orElse(null) : null;

        Place place = Place.builder()
                .placeName(request.getPlaceName())
                .region(request.getRegion())
                .season(request.getSeason())
                .days(request.getDays() != null ? request.getDays() : 1)
                .cost(request.getCost() != null ? request.getCost() : java.math.BigDecimal.ZERO)
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .category(category)
                .state(state)
                .district(district)
                .location(request.getLocation())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .bestTime(request.getBestTime())
                .entryFee(request.getEntryFee() != null ? request.getEntryFee() : java.math.BigDecimal.ZERO)
                .openingTime(request.getOpeningTime())
                .closingTime(request.getClosingTime())
                .nearbyAttractions(request.getNearbyAttractions())
                .travelTips(request.getTravelTips())
                .popularActivities(request.getPopularActivities())
                .videoUrl(request.getVideoUrl())
                .videoThumbnailUrl(VideoUtils.extractThumbnailUrl(request.getVideoUrl()))
                .googleMapsUrl(request.getGoogleMapsUrl())
                .build();

        Place saved = placeRepository.save(place);

        if (request.getGalleryUrls() != null) {
            for (String url : request.getGalleryUrls()) {
                placeImageRepository.save(PlaceImage.builder().place(saved).imageUrl(url).build());
            }
        }

        return toResponse(saved);
    }

    @Transactional
    public PlaceResponse updatePlace(Long id, PlaceRequest request) {
        Place place = findPlace(id);

        Category category = request.getCategoryId() != null ? categoryRepository.findById(request.getCategoryId()).orElse(null) : null;
        State state = request.getStateId() != null ? stateRepository.findById(request.getStateId()).orElse(null) : null;
        District district = request.getDistrictId() != null ? districtRepository.findById(request.getDistrictId()).orElse(null) : null;

        place.setPlaceName(request.getPlaceName());
        place.setRegion(request.getRegion());
        place.setSeason(request.getSeason());
        place.setDays(request.getDays());
        place.setCost(request.getCost());
        place.setDescription(request.getDescription());
        if (request.getImageUrl() != null) place.setImageUrl(request.getImageUrl());

        place.setCategory(category);
        place.setState(state);
        place.setDistrict(district);
        place.setLocation(request.getLocation());
        place.setLatitude(request.getLatitude());
        place.setLongitude(request.getLongitude());
        place.setBestTime(request.getBestTime());
        place.setEntryFee(request.getEntryFee());
        place.setOpeningTime(request.getOpeningTime());
        place.setClosingTime(request.getClosingTime());
        place.setNearbyAttractions(request.getNearbyAttractions());
        place.setTravelTips(request.getTravelTips());
        place.setPopularActivities(request.getPopularActivities());
        place.setVideoUrl(request.getVideoUrl());
        place.setVideoThumbnailUrl(VideoUtils.extractThumbnailUrl(request.getVideoUrl()));
        place.setGoogleMapsUrl(request.getGoogleMapsUrl());

        Place saved = placeRepository.save(place);

        if (request.getGalleryUrls() != null) {
            placeImageRepository.deleteByPlaceId(id);
            for (String url : request.getGalleryUrls()) {
                placeImageRepository.save(PlaceImage.builder().place(saved).imageUrl(url).build());
            }
        }

        return toResponse(saved);
    }

    public PlaceResponse uploadImage(Long id, MultipartFile file) {
        Place place = findPlace(id);
        if (place.getImageUrl() != null) fileStorageService.deleteFile(place.getImageUrl());
        place.setImageUrl(fileStorageService.storeFile(file, "places"));
        return toResponse(placeRepository.save(place));
    }

    @Transactional
    public PlaceResponse uploadGalleryImage(Long id, MultipartFile file) {
        Place place = findPlace(id);
        String url = fileStorageService.storeFile(file, "places");
        placeImageRepository.save(PlaceImage.builder().place(place).imageUrl(url).build());
        return toResponse(place);
    }

    @Transactional
    public void deletePlace(Long id) {
        Place place = findPlace(id);
        placeImageRepository.deleteByPlaceId(id);
        placeReviewRepository.deleteByPlaceId(id);
        packageRepository.findByPlaceId(id).forEach(pkg -> packageService.deletePackage(pkg.getId()));
        hotelRepository.findByPlaceId(id).forEach(hotel -> hotelService.deleteHotel(hotel.getId()));
        placeRepository.delete(place);
    }

    private Place findPlace(Long id) {
        return placeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Place not found with id: " + id));
    }

    public PlaceResponse toResponse(Place p) {
        if (p == null) return null;

        List<String> gallery = placeImageRepository.findByPlaceId(p.getId()).stream()
                .map(PlaceImage::getImageUrl)
                .collect(Collectors.toList());

        return PlaceResponse.builder()
                .id(p.getId())
                .placeName(p.getPlaceName())
                .region(p.getRegion())
                .season(p.getSeason())
                .days(p.getDays())
                .cost(p.getCost())
                .description(p.getDescription())
                .imageUrl(p.getImageUrl())
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .categoryName(p.getCategory() != null ? p.getCategory().getCategoryName() : null)
                .stateId(p.getState() != null ? p.getState().getId() : null)
                .stateName(p.getState() != null ? p.getState().getStateName() : null)
                .districtId(p.getDistrict() != null ? p.getDistrict().getId() : null)
                .districtName(p.getDistrict() != null ? p.getDistrict().getDistrictName() : null)
                .location(p.getLocation())
                .latitude(p.getLatitude())
                .longitude(p.getLongitude())
                .bestTime(p.getBestTime())
                .entryFee(p.getEntryFee())
                .openingTime(p.getOpeningTime())
                .closingTime(p.getClosingTime())
                .rating(p.getRating())
                .reviewCount(p.getReviewCount())
                .nearbyAttractions(p.getNearbyAttractions())
                .travelTips(p.getTravelTips())
                .popularActivities(p.getPopularActivities())
                .videoUrl(p.getVideoUrl())
                .videoThumbnailUrl(p.getVideoThumbnailUrl())
                .googleMapsUrl(p.getGoogleMapsUrl())
                .galleryUrls(gallery)
                .createdAt(p.getCreatedAt())
                .build();
    }
}
