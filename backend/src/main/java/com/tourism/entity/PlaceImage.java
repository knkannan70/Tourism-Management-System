package com.tourism.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "place_images")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id", nullable = false)
    private Place place;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;
}
