package com.tourism.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String profileImageUrl;
    private String role;
    private Boolean active;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
}
