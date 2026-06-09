package com.tourism.controller;

import com.tourism.dto.request.ChangePasswordRequest;
import com.tourism.dto.request.ProfileUpdateRequest;
import com.tourism.dto.response.ApiResponse;
import com.tourism.dto.response.UserResponse;
import com.tourism.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMyProfile(Authentication authentication) {
        String email = authentication.getName();
        UserResponse user = userService.getUserByEmail(email);
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved", user));
    }

    // Alias endpoint to match frontend /api/users/profile calls
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(Authentication authentication) {
        return getMyProfile(authentication);
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateMyProfile(
            Authentication authentication,
            @RequestBody ProfileUpdateRequest request) {
        String email = authentication.getName();
        UserResponse current = userService.getUserByEmail(email);
        UserResponse updated = userService.updateProfile(current.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", updated));
    }

    // Alias endpoint to match frontend /api/users/profile PUT calls
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            Authentication authentication,
            @RequestBody ProfileUpdateRequest request) {
        return updateMyProfile(authentication, request);
    }

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        String email = authentication.getName();
        UserResponse current = userService.getUserByEmail(email);
        userService.changePassword(current.getId(), request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @PostMapping("/me/image")
    public ResponseEntity<ApiResponse<UserResponse>> uploadProfileImage(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        String email = authentication.getName();
        UserResponse current = userService.getUserByEmail(email);
        UserResponse updated = userService.uploadProfileImage(current.getId(), file);
        return ResponseEntity.ok(ApiResponse.success("Profile image uploaded", updated));
    }

    // Alias endpoint to match frontend /api/users/profile/image calls
    @PostMapping("/profile/image")
    public ResponseEntity<ApiResponse<UserResponse>> uploadProfileImageAlias(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        return uploadProfileImage(authentication, file);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("User retrieved", userService.getUserById(id)));
    }
}
