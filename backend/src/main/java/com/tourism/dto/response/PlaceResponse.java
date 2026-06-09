package com.tourism.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PlaceResponse {
    private Long id;
    private String placeName;
    private String region;
    private String season;
    private Integer days;
    private BigDecimal cost;
    private String description;
    private String imageUrl;

    private Long categoryId;
    private String categoryName;
    private Long stateId;
    private String stateName;
    private Long districtId;
    private String districtName;

    private String location;
    private Double latitude;
    private Double longitude;
    private String bestTime;
    private BigDecimal entryFee;
    private String openingTime;
    private String closingTime;
    private Double rating;
    private Integer reviewCount;
    private String nearbyAttractions;
    private String travelTips;
    private String popularActivities;
    
    private List<String> galleryUrls;
    private String videoUrl;
    private String videoThumbnailUrl;
    private String googleMapsUrl;
    private LocalDateTime createdAt;
}
