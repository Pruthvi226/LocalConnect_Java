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
            provider.setOnTimePerformance(100.0);
            provider.setCancellationRate(0.0);
            userRepository.save(provider);
            return;
        }

        long total = allBookings.size();
        long completed = allBookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED).count();
        long cancelled = allBookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.CANCELLED).count();
        // Since we don't track on-time explicitly yet, we'll mock it based on completion
        double completionRate = ((double) completed / total) * 100.0;
        double cancellationRate = ((double) cancelled / total) * 100.0;
        double onTimePerformance = 100.0 - (cancellationRate * 0.5); // Mock metric

        // Trust score is a weighted sum out of 100
        // e.g. 70% based on completion rate, 30% based on on-time performance
        double rawScore = (completionRate * 0.7) + (onTimePerformance * 0.3);
        int trustScore = (int) Math.max(0, Math.min(100, rawScore));

        provider.setCompletionRate(Math.round(completionRate * 10.0) / 10.0);
        provider.setCancellationRate(Math.round(cancellationRate * 10.0) / 10.0);
        provider.setOnTimePerformance(Math.round(onTimePerformance * 10.0) / 10.0);
        provider.setTrustScore(trustScore);

        userRepository.save(provider);
    }
}
