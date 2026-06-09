package com.tourism.service;

import com.tourism.dto.request.HotelRequest;
import com.tourism.dto.response.HotelResponse;
import com.tourism.entity.*;
import com.tourism.exception.ResourceNotFoundException;
import com.tourism.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import com.tourism.util.VideoUtils;

@Service
@RequiredArgsConstructor
public class HotelService {

    private final HotelRepository hotelRepository;
    private final HotelImageRepository hotelImageRepository;
    private final HotelReviewRepository hotelReviewRepository;
    private final PackageRepository packageRepository;
    private final StateRepository stateRepository;
    private final DistrictRepository districtRepository;
    private final PlaceRepository placeRepository;
    private final FileStorageService fileStorageService;

    @Autowired
    @Lazy
    private PackageService packageService;

    public List<HotelResponse> getAllHotels() {
        return hotelRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public HotelResponse getHotelById(Long id) {
        return toResponse(findHotel(id));
    }

    public List<HotelResponse> searchHotels(String query) {
        return hotelRepository.findByHotelNameContainingIgnoreCaseOrCityContainingIgnoreCase(query, query)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<HotelResponse> getHotelsByState(Long stateId) {
        return hotelRepository.findByStateId(stateId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<HotelResponse> getHotelsByDistrict(Long districtId) {
        return hotelRepository.findByDistrictId(districtId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<HotelResponse> getHotelsByPlace(Long placeId) {
        return hotelRepository.findByPlaceId(placeId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Returns hotels for package creation: hotels explicitly linked to the place,
     * OR hotels in the same district that have no explicit place link (backward compat).
     */
    public List<HotelResponse> getHotelsForPackageCreation(Long placeId) {
        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> new ResourceNotFoundException("Place not found with id: " + placeId));
        Long districtId = place.getDistrict() != null ? place.getDistrict().getId() : null;
        if (districtId != null) {
            return hotelRepository.findHotelsForPackageCreation(placeId, districtId)
                    .stream().map(this::toResponse).collect(Collectors.toList());
        }
        // Fallback: if place has no district, just return hotels linked to the place
        return hotelRepository.findByPlaceId(placeId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public HotelResponse createHotel(HotelRequest request) {
        State state = request.getStateId() != null ? stateRepository.findById(request.getStateId()).orElse(null) : null;
        District district = request.getDistrictId() != null ? districtRepository.findById(request.getDistrictId()).orElse(null) : null;
        Place place = request.getPlaceId() != null ? placeRepository.findById(request.getPlaceId()).orElse(null) : null;

        BigDecimal price = request.getPricePerNight() != null ? request.getPricePerNight()
                : (request.getCost() != null ? request.getCost() : BigDecimal.ZERO);

        Hotel hotel = Hotel.builder()
                .hotelName(request.getHotelName())
                .city(request.getCity())
                .address(request.getAddress())
                .state(state)
                .district(district)
                .place(place)
                .cost(request.getCost() != null ? request.getCost() : BigDecimal.ZERO)
                .pricePerNight(price)
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .contactNumber(request.getContactNumber())
                .amenities(request.getAmenities())
                .starRating(request.getStarRating() != null ? request.getStarRating() : 3)
                .rating(0.0)
                .reviewCount(0)
                .videoUrl(request.getVideoUrl())
                .videoThumbnailUrl(VideoUtils.extractThumbnailUrl(request.getVideoUrl()))
                .googleMapsUrl(request.getGoogleMapsUrl())
                .roomTypes(request.getRoomTypes())
                .build();

        Hotel saved = hotelRepository.save(hotel);

        if (request.getGalleryUrls() != null) {
            for (String url : request.getGalleryUrls()) {
                hotelImageRepository.save(HotelImage.builder().hotel(saved).imageUrl(url).build());
            }
        }

        return toResponse(saved);
    }

    @Transactional
    public HotelResponse updateHotel(Long id, HotelRequest request) {
        Hotel hotel = findHotel(id);
        State state = request.getStateId() != null ? stateRepository.findById(request.getStateId()).orElse(null) : null;
        District district = request.getDistrictId() != null ? districtRepository.findById(request.getDistrictId()).orElse(null) : null;
        Place place = request.getPlaceId() != null ? placeRepository.findById(request.getPlaceId()).orElse(null) : null;

        hotel.setHotelName(request.getHotelName());
        hotel.setCity(request.getCity());
        if (request.getAddress() != null) hotel.setAddress(request.getAddress());
        hotel.setState(state);
        hotel.setDistrict(district);
        hotel.setPlace(place);
        if (request.getCost() != null) hotel.setCost(request.getCost());
        if (request.getPricePerNight() != null) hotel.setPricePerNight(request.getPricePerNight());
        hotel.setDescription(request.getDescription());
        if (request.getImageUrl() != null) hotel.setImageUrl(request.getImageUrl());
        if (request.getContactNumber() != null) hotel.setContactNumber(request.getContactNumber());
        if (request.getAmenities() != null) hotel.setAmenities(request.getAmenities());
        if (request.getStarRating() != null) hotel.setStarRating(request.getStarRating());
        hotel.setVideoUrl(request.getVideoUrl());
        hotel.setVideoThumbnailUrl(VideoUtils.extractThumbnailUrl(request.getVideoUrl()));
        hotel.setGoogleMapsUrl(request.getGoogleMapsUrl());
        hotel.setRoomTypes(request.getRoomTypes());

        Hotel saved = hotelRepository.save(hotel);

        if (request.getGalleryUrls() != null) {
            hotelImageRepository.deleteByHotelId(id);
            for (String url : request.getGalleryUrls()) {
                hotelImageRepository.save(HotelImage.builder().hotel(saved).imageUrl(url).build());
            }
        }

        return toResponse(saved);
    }

    public HotelResponse uploadImage(Long id, MultipartFile file) {
        Hotel hotel = findHotel(id);
        if (hotel.getImageUrl() != null) fileStorageService.deleteFile(hotel.getImageUrl());
        hotel.setImageUrl(fileStorageService.storeFile(file, "hotels"));
        return toResponse(hotelRepository.save(hotel));
    }

    @Transactional
    public HotelResponse uploadGalleryImage(Long id, MultipartFile file) {
        Hotel hotel = findHotel(id);
        String url = fileStorageService.storeFile(file, "hotels");
        hotelImageRepository.save(HotelImage.builder().hotel(hotel).imageUrl(url).build());
        return toResponse(hotel);
    }

    @Transactional
    public void deleteHotel(Long id) {
        Hotel hotel = findHotel(id);
        hotelImageRepository.deleteByHotelId(id);
        hotelReviewRepository.deleteByHotelId(id);
        packageRepository.findByHotelId(id).forEach(pkg -> packageService.deletePackage(pkg.getId()));
        hotelRepository.delete(hotel);
    }

    /**
     * Recalculates and persists the hotel rating from all reviews.
     * Called after any review add/edit/delete.
     */
    @Transactional
    public void recalculateRating(Long hotelId) {
        Hotel hotel = findHotel(hotelId);
        List<HotelReview> approvedReviews = hotelReviewRepository.findByHotelIdAndIsApprovedTrueOrderByCreatedAtDesc(hotelId);
        long count = approvedReviews.size();
        double avg = 0.0;
        if (count > 0) {
            double sum = approvedReviews.stream().mapToDouble(HotelReview::getRating).sum();
            avg = sum / count;
        }
        hotel.setRating(Math.round(avg * 10.0) / 10.0);
        hotel.setReviewCount((int) count);
        hotelRepository.save(hotel);
    }

    private Hotel findHotel(Long id) {
        return hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));
    }

    public HotelResponse toResponse(Hotel h) {
        List<String> gallery = hotelImageRepository.findByHotelId(h.getId()).stream()
                .map(HotelImage::getImageUrl)
                .collect(Collectors.toList());

        return HotelResponse.builder()
                .id(h.getId())
                .hotelName(h.getHotelName())
                .city(h.getCity())
                .address(h.getAddress())
                .stateId(h.getState() != null ? h.getState().getId() : null)
                .stateName(h.getState() != null ? h.getState().getStateName() : null)
                .districtId(h.getDistrict() != null ? h.getDistrict().getId() : null)
                .districtName(h.getDistrict() != null ? h.getDistrict().getDistrictName() : null)
                .placeId(h.getPlace() != null ? h.getPlace().getId() : null)
                .placeName(h.getPlace() != null ? h.getPlace().getPlaceName() : null)
                .cost(h.getCost())
                .pricePerNight(h.getPricePerNight() != null ? h.getPricePerNight() : h.getCost())
                .description(h.getDescription())
                .imageUrl(h.getImageUrl())
                .contactNumber(h.getContactNumber())
                .amenities(h.getAmenities())
                .starRating(h.getStarRating())
                .rating(h.getRating())
                .reviewCount(h.getReviewCount())
                .videoUrl(h.getVideoUrl())
                .videoThumbnailUrl(h.getVideoThumbnailUrl())
                .googleMapsUrl(h.getGoogleMapsUrl())
                .roomTypes(h.getRoomTypes())
                .galleryUrls(gallery)
                .createdAt(h.getCreatedAt())
                .build();
    }
}
