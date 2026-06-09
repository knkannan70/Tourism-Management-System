package com.tourism.controller;

import com.tourism.dto.response.ApiResponse;
import com.tourism.dto.response.PackageResponse;
import com.tourism.dto.response.UserResponse;
import com.tourism.service.UserService;
import com.tourism.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PackageResponse>>> getUserWishlist(Authentication authentication) {
        UserResponse user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Wishlist retrieved", wishlistService.getUserWishlist(user.getId())));
    }

    @PostMapping("/{packageId}")
    public ResponseEntity<ApiResponse<Void>> addToWishlist(
            @PathVariable Long packageId,
            Authentication authentication) {
        UserResponse user = userService.getUserByEmail(authentication.getName());
        wishlistService.addToWishlist(user.getId(), packageId);
        return ResponseEntity.ok(ApiResponse.success("Added to wishlist", null));
    }

    @DeleteMapping("/{packageId}")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(
            @PathVariable Long packageId,
            Authentication authentication) {
        UserResponse user = userService.getUserByEmail(authentication.getName());
        wishlistService.removeFromWishlist(user.getId(), packageId);
        return ResponseEntity.ok(ApiResponse.success("Removed from wishlist", null));
    }

    @GetMapping("/{packageId}/status")
    public ResponseEntity<ApiResponse<Boolean>> isInWishlist(
            @PathVariable Long packageId,
            Authentication authentication) {
        UserResponse user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Status checked", wishlistService.isInWishlist(user.getId(), packageId)));
    }
}
