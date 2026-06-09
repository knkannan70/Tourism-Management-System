package com.tourism.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PackageRequest {
    @NotBlank private String packageName;
    @NotNull private Long placeId;
    @NotNull private Long hotelId;
    @NotBlank private String duration;
    @DecimalMin("0.0") private BigDecimal price;
    private String description;
    private String imageUrl;
}
