package com.tourism.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class HotelRequest {
    @NotBlank private String hotelName;
    @NotBlank private String city;
    private String address;
    private Long stateId;
    private Long districtId;
    private Long placeId;
    @DecimalMin("0.0") private BigDecimal cost;
    @DecimalMin("0.0") private BigDecimal pricePerNight;
    private String description;
    private String imageUrl;
    private String contactNumber;
    private String amenities;
    private Integer starRating;
    private List<String> galleryUrls;
    private String videoUrl;
    private String googleMapsUrl;
    private String roomTypes;
}
