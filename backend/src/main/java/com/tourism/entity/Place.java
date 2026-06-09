package com.tourism.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "places")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Place {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "place_name", nullable = false, length = 200)
    private String placeName;

    @Column(nullable = false, length = 100)
    private String region;

    @Column(length = 50)
    private String season;

    @Column(nullable = false)
    @Builder.Default
    private Integer days = 1;

    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal cost = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "state_id")
    private State state;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "district_id")
    private District district;

    @Column(length = 200)
    private String location;

    private Double latitude;
    private Double longitude;

    @Column(name = "best_time_to_visit", length = 100)
    private String bestTime;

    @Column(name = "entry_fee", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal entryFee = BigDecimal.ZERO;

    @Column(name = "opening_time", length = 20)
    private String openingTime;

    @Column(name = "closing_time", length = 20)
    private String closingTime;

    @Builder.Default
    private Double rating = 0.0;

    @Column(name = "review_count")
    @Builder.Default
    private Integer reviewCount = 0;

    @Column(name = "nearby_attractions", columnDefinition = "TEXT")
    private String nearbyAttractions;

    @Column(name = "travel_tips", columnDefinition = "TEXT")
    private String travelTips;

    @Column(name = "popular_activities", columnDefinition = "TEXT")
    private String popularActivities;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "video_url", length = 500)
    private String videoUrl;

    @Column(name = "video_thumbnail_url", length = 500)
    private String videoThumbnailUrl;

    @Column(name = "google_maps_url", length = 1000)
    private String googleMapsUrl;

    @Column(name = "view_count")
    @Builder.Default
    private Long viewCount = 0L;

    @Column(name = "booking_count")
    @Builder.Default
    private Long bookingCount = 0L;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.days == null) this.days = 1;
        if (this.cost == null) this.cost = BigDecimal.ZERO;
        if (this.entryFee == null) this.entryFee = BigDecimal.ZERO;
        if (this.rating == null) this.rating = 0.0;
        if (this.reviewCount == null) this.reviewCount = 0;
        if (this.viewCount == null) this.viewCount = 0L;
        if (this.bookingCount == null) this.bookingCount = 0L;
    }
}
