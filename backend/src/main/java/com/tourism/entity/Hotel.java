package com.tourism.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "hotels")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hotel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hotel_name", nullable = false, length = 200)
    private String hotelName;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(length = 300)
    private String address;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "state_id")
    private State state;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "district_id")
    private District district;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "place_id")
    private Place place;

    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal cost = BigDecimal.ZERO;

    @Column(name = "price_per_night", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal pricePerNight = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "contact_number", length = 20)
    private String contactNumber;

    @Column(columnDefinition = "TEXT")
    private String amenities;

    @Column(name = "star_rating")
    @Builder.Default
    private Integer starRating = 3;

    @Column(name = "rating")
    @Builder.Default
    private Double rating = 0.0;

    @Column(name = "review_count")
    @Builder.Default
    private Integer reviewCount = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "video_url", length = 500)
    private String videoUrl;

    @Column(name = "video_thumbnail_url", length = 500)
    private String videoThumbnailUrl;

    @Column(name = "google_maps_url", length = 1000)
    private String googleMapsUrl;

    @Column(name = "room_types", columnDefinition = "TEXT")
    private String roomTypes;

    @Column(name = "view_count")
    @Builder.Default
    private Long viewCount = 0L;

    @Column(name = "booking_count")
    @Builder.Default
    private Long bookingCount = 0L;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.cost == null) this.cost = BigDecimal.ZERO;
        if (this.pricePerNight == null) this.pricePerNight = this.cost;
        if (this.rating == null) this.rating = 0.0;
        if (this.reviewCount == null) this.reviewCount = 0;
        if (this.starRating == null) this.starRating = 3;
        if (this.viewCount == null) this.viewCount = 0L;
        if (this.bookingCount == null) this.bookingCount = 0L;
    }
}
