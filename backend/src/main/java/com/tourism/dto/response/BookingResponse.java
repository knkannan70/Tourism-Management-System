package com.tourism.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookingResponse {
    private Long id;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private PackageResponse tourPackage;
    private LocalDate bookingDate;
    private LocalDate travelDate;
    private BigDecimal totalAmount;
    private String bookingStatus;
    private String packageName;
    private String placeName;
    private String packageImageUrl;
    private String status;
    private Integer numberOfPersons;
    private String specialRequests;
    private String paymentStatus;
    private String paymentId;
    private LocalDateTime createdAt;
}
