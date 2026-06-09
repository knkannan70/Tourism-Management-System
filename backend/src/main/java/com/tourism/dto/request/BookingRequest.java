package com.tourism.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;
import java.math.BigDecimal;

@Data
public class BookingRequest {
    @NotNull private Long packageId;
    @NotNull private LocalDate travelDate;
    private BigDecimal totalAmount;
    private Integer numberOfPersons;
    private String specialRequests;
    private String paymentStatus;
    private String paymentId;
}
