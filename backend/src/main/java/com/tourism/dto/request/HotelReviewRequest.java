package com.tourism.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class HotelReviewRequest {
    @NotNull @Min(1) @Max(5)
    private Integer rating;
    private String comment;
    private Long bookingId;
}
