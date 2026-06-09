package com.tourism.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PackageResponse {
    private Long id;
    private String packageName;
    private PlaceResponse place;
    private HotelResponse hotel;
    private String duration;
    private BigDecimal price;
    private String description;
    private String imageUrl;
    private LocalDateTime createdAt;
}
