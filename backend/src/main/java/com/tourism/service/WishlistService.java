package com.tourism.service;

import com.tourism.dto.response.PackageResponse;
import com.tourism.entity.TourPackage;
import com.tourism.entity.User;
import com.tourism.entity.Wishlist;
import com.tourism.exception.BadRequestException;
import com.tourism.exception.ResourceNotFoundException;
import com.tourism.repository.PackageRepository;
import com.tourism.repository.UserRepository;
import com.tourism.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final PackageRepository packageRepository;
    private final PackageService packageService;

    public List<PackageResponse> getUserWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId).stream()
                .map(item -> packageService.toResponse(item.getTourPackage()))
                .collect(Collectors.toList());
    }

    public void addToWishlist(Long userId, Long packageId) {
        if (wishlistRepository.existsByUserIdAndTourPackageId(userId, packageId)) {
            throw new BadRequestException("Package is already in wishlist");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        TourPackage pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found"));
        
        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .tourPackage(pkg)
                .build();
        wishlistRepository.save(wishlist);
    }

    public void removeFromWishlist(Long userId, Long packageId) {
        Wishlist wishlist = wishlistRepository.findByUserIdAndTourPackageId(userId, packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist item not found"));
        wishlistRepository.delete(wishlist);
    }

    public boolean isInWishlist(Long userId, Long packageId) {
        return wishlistRepository.existsByUserIdAndTourPackageId(userId, packageId);
    }
}
