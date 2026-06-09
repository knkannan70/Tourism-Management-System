package com.tourism.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class PlaceRequest {
    @NotBlank private String placeName;
    @NotBlank private String region;
    private String season;
    @Min(1) private Integer days;
    @DecimalMin("0.0") private BigDecimal cost;
    private String description;
    private String imageUrl;

    private Long categoryId;
    private Long stateId;
    private Long districtId;
    
    private String location;
    private Double latitude;
    private Double longitude;
    private String bestTime;
    
    @DecimalMin("0.0")
    private BigDecimal entryFee;
    
    private String openingTime;
    private String closingTime;
    
    private String nearbyAttractions;
    private String travelTips;
    private String popularActivities;
    
    private List<String> galleryUrls;
    private String videoUrl;
    private String googleMapsUrl;
}
