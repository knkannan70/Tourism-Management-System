package com.tourism.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HotelReviewResponse {
    private Long id;
    private Long hotelId;
    private String hotelName;
    private Long userId;
    private String userFullName;
    private String userProfileImage;
    private Integer rating;
    private String comment;
    private Boolean isApproved;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
