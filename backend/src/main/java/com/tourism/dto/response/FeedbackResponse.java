package com.tourism.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FeedbackResponse {
    private Long id;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private Long packageId;
    private String packageName;
    private Long bookingId;
    private String bookingName;
    private Integer rating;
    private String comment;
    private Boolean approved;
    private Integer likesCount;
    private Integer helpfulCount;
    private LocalDateTime createdAt;
}
