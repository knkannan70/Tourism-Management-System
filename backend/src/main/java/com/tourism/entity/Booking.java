package com.tourism.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "package_id", nullable = false)
    private TourPackage tourPackage;

    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;

    @Column(name = "travel_date", nullable = false)
    private LocalDate travelDate;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "booking_status", nullable = false, length = 30)
    @Builder.Default
    private String bookingStatus = "PENDING";

    @Column(name = "number_of_persons")
    @Builder.Default
    private Integer numberOfPersons = 1;

    @Column(name = "special_requests", columnDefinition = "TEXT")
    private String specialRequests;

    @Column(name = "payment_status", length = 30)
    @Builder.Default
    private String paymentStatus = "PAID";

    @Column(name = "payment_id", length = 100)
    private String paymentId;

    @Column(name = "user_deleted")
    @Builder.Default
    private Boolean userDeleted = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.bookingStatus == null) this.bookingStatus = "CONFIRMED";
        if (this.paymentStatus == null) this.paymentStatus = "PAID";
        if (this.userDeleted == null) this.userDeleted = false;
    }
}
