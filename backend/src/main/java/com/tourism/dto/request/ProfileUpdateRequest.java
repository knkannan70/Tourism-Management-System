package com.tourism.dto.request;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String fullName;
    private String phone;
    private String address;
    private String email;
}
