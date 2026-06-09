package com.tourism.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "states")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class State {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "state_name", nullable = false, unique = true, length = 100)
    private String stateName;
}
