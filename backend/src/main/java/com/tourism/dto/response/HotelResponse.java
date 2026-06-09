package com.tourism.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HotelResponse {
    private Long id;
    private String hotelName;
    private String city;
    private String address;
    private Long stateId;
    private String stateName;
    private Long districtId;
    private String districtName;
    private Long placeId;
    private String placeName;
    private BigDecimal cost;
    private BigDecimal pricePerNight;
    private String description;
    private String imageUrl;
    private String contactNumber;
    private String amenities;
    private Integer starRating;
    private Double rating;
    private Integer reviewCount;
    private List<String> galleryUrls;
    private String videoUrl;
    private String videoThumbnailUrl;
    private String googleMapsUrl;
    private String roomTypes;
    private LocalDateTime createdAt;
}
