package com.tourism.service;

import com.tourism.dto.request.ProfileUpdateRequest;
import com.tourism.dto.request.RegisterRequest;
import com.tourism.dto.response.UserResponse;
import com.tourism.entity.User;
import com.tourism.exception.BadRequestException;
import com.tourism.exception.ResourceNotFoundException;
import com.tourism.repository.BookingRepository;
import com.tourism.repository.FeedbackRepository;
import com.tourism.repository.HotelReviewRepository;
import com.tourism.repository.PlaceReviewRepository;
import com.tourism.repository.UserRepository;
import com.tourism.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FeedbackRepository feedbackRepository;
    private final BookingRepository bookingRepository;
    private final WishlistRepository wishlistRepository;
    private final PlaceReviewRepository placeReviewRepository;
    private final HotelReviewRepository hotelReviewRepository;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;

    public UserResponse createUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword() != null ? request.getPassword() : "Default@123"))
                .phone(request.getPhone())
                .address(request.getAddress())
                .role("USER")
                .build();
        return toResponse(userRepository.save(user));
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public UserResponse getUserById(Long id) {
        return toResponse(findUser(id));
    }

    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(Long id, ProfileUpdateRequest request) {
        User user = findUser(id);
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already in use");
            }
            user.setEmail(request.getEmail());
        }
        return toResponse(userRepository.save(user));
    }

    public void changePassword(Long id, String currentPassword, String newPassword) {
        User user = findUser(id);
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public UserResponse uploadProfileImage(Long id, MultipartFile file) {
        User user = findUser(id);
        if (user.getProfileImageUrl() != null) {
            fileStorageService.deleteFile(user.getProfileImageUrl());
        }
        String url = fileStorageService.storeFile(file, "users");
        user.setProfileImageUrl(url);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse adminUpdateUser(Long id, ProfileUpdateRequest request) {
        return updateProfile(id, request);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = findUser(id);
        feedbackRepository.deleteByUserId(id);
        bookingRepository.deleteByUserId(id);
        wishlistRepository.deleteByUserId(id);
        placeReviewRepository.deleteByUserId(id);
        hotelReviewRepository.deleteByUserId(id);
        userRepository.delete(user);
    }

    public void disableUser(Long id) {
        User user = findUser(id);
        user.setActive(false);
        userRepository.save(user);
    }

    public void enableUser(Long id) {
        User user = findUser(id);
        user.setActive(true);
        userRepository.save(user);
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .profileImageUrl(user.getProfileImageUrl())
                .role(user.getRole())
                .active(user.getActive() != null ? user.getActive() : true)
                .lastLogin(user.getLastLogin())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
