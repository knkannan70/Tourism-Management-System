package com.tourism.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class FeedbackRequest {
    private Long packageId;

    private Long bookingId;

    @Min(1) @Max(5) @NotNull(message = "Rating must be between 1 and 5")
    private Integer rating;

    @NotBlank(message = "Comment is required")
    private String comment;
}
