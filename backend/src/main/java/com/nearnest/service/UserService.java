package com.nearnest.service;

import com.nearnest.dto.UserProfileDto;
import com.nearnest.dto.UserUpdateDto;
import com.nearnest.exception.ResourceNotFoundException;
import com.nearnest.model.Booking;
import com.nearnest.model.User;
import com.nearnest.repository.BookingRepository;
import com.nearnest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private BookingRepository bookingRepository;

    public UserProfileDto getCurrentUserProfile() {
        User user = authService.getCurrentUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not authenticated");
        }
        return UserProfileDto.fromEntity(user);
    }

    public UserProfileDto getUserProfileById(@NonNull Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserProfileDto.fromEntity(user);
    }

    public UserProfileDto updateUserProfile(@NonNull UserUpdateDto updateDto) {
        User user = authService.getCurrentUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not authenticated");
        }

        if (updateDto.getFullName() != null) user.setFullName(updateDto.getFullName());
        if (updateDto.getPhone() != null) user.setPhone(updateDto.getPhone());
        if (updateDto.getAddress() != null) user.setAddress(updateDto.getAddress());
        if (updateDto.getBio() != null) user.setBio(updateDto.getBio());
        if (updateDto.getProfileImageUrl() != null) user.setProfileImageUrl(updateDto.getProfileImageUrl());
        if (updateDto.getBankAccountNumber() != null) user.setBankAccountNumber(updateDto.getBankAccountNumber());
        if (updateDto.getIfscCode() != null) user.setIfscCode(updateDto.getIfscCode());
        if (updateDto.getUpiId() != null) user.setUpiId(updateDto.getUpiId());

        User updatedUser = userRepository.save(user);
        return UserProfileDto.fromEntity(updatedUser);
    }

    @Transactional
    public void recalculateTrustScore(@NonNull Long providerId) {
        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        if (provider.getRole() != User.Role.PROVIDER) {
            return;
        }

        List<Booking> allBookings = bookingRepository.findByService_Provider_Id(providerId);
        if (allBookings.isEmpty()) {
            provider.setTrustScore(100);
            provider.setCompletionRate(100.0);
            provider.setResponseScore(100.0);
            provider.setAverageRating(0.0);
            userRepository.save(provider);
            return;
        }

        long completed = allBookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED).count();
        long cancelled = allBookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.CANCELLED).count();
        
        // 1. Completion Rate (50%)
        double completionRate = ((double) completed / Math.max(1, (completed + cancelled))) * 100.0;

        // 2. Response Score (30%) - Calculated based on time to accept
        // Average seconds to accept
        double avgResponseSeconds = allBookings.stream()
                .filter(b -> b.getAcceptedAt() != null)
                .mapToLong(b -> java.time.Duration.between(b.getCreatedAt(), b.getAcceptedAt()).getSeconds())
                .average()
                .orElse(3600); // Default 1 hour if no data
        
        // Scale: 0 mins = 100, 24 hours = 0
        double responseScore = Math.max(0, 100 - (avgResponseSeconds / 864)); 

        // 3. Customer Rating (20%) - Normalized to 0-100
        double ratingScore = (provider.getAverageRating() / 5.0) * 100.0;
        
        double rawScore = (completionRate * 0.5) + (responseScore * 0.3) + (ratingScore * 0.2);
        int trustScore = (int) Math.max(0, Math.min(100, rawScore));

        provider.setCompletionRate(Math.round(completionRate * 10.0) / 10.0);
        provider.setResponseScore(Math.round(responseScore * 10.0) / 10.0);
        provider.setTrustScore(trustScore);

        userRepository.save(provider);
    }
}
