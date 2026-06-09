package com.tourism.service;

import com.tourism.config.JwtTokenProvider;
import com.tourism.dto.request.LoginRequest;
import com.tourism.dto.request.RegisterRequest;
import com.tourism.dto.request.ResetPasswordRequest;
import com.tourism.dto.response.AuthResponse;
import com.tourism.entity.Admin;
import com.tourism.entity.User;
import com.tourism.exception.BadRequestException;
import com.tourism.exception.ResourceNotFoundException;
import com.tourism.repository.AdminRepository;
import com.tourism.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .address(request.getAddress())
                .role("USER")
                .build();
        user = userRepository.save(user);
        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole(), user.getId());
        return AuthResponse.builder()
                .token(token).role(user.getRole()).email(user.getEmail())
                .id(user.getId()).fullName(user.getFullName())
                .build();
    }

    public AuthResponse loginUser(LoginRequest request) {
        User user = userRepository.findByEmail(request.getIdentifier())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (Boolean.FALSE.equals(user.getActive())) {
            throw new BadRequestException("Your account has been disabled. Please contact the administrator.");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid credentials");
        }
        user.setLastLogin(java.time.LocalDateTime.now());
        userRepository.save(user);
        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole(), user.getId());
        return AuthResponse.builder()
                .token(token).role(user.getRole()).email(user.getEmail())
                .id(user.getId()).fullName(user.getFullName())
                .build();
    }

    public AuthResponse loginAdmin(LoginRequest request) {
        Admin admin = adminRepository.findByUsername(request.getIdentifier())
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new BadRequestException("Invalid credentials");
        }
        String token = jwtTokenProvider.generateToken(admin.getUsername(), admin.getRole(), admin.getId());
        return AuthResponse.builder()
                .token(token).role(admin.getRole()).username(admin.getUsername())
                .id(admin.getId())
                .build();
    }

    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with this email"));
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
