package com.nearnest.service;

import com.nearnest.dto.UserProfileDto;
import com.nearnest.dto.UserUpdateDto;
import com.nearnest.exception.ResourceNotFoundException;
import com.nearnest.model.User;
import com.nearnest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService;

    public UserProfileDto getCurrentUserProfile() {
        User user = authService.getCurrentUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not authenticated");
        }
        return UserProfileDto.fromEntity(user);
    }

    public UserProfileDto getUserProfileById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserProfileDto.fromEntity(user);
    }

    public UserProfileDto updateUserProfile(UserUpdateDto updateDto) {
        User user = authService.getCurrentUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not authenticated");
        }

        if (updateDto.getFullName() != null) user.setFullName(updateDto.getFullName());
        if (updateDto.getPhone() != null) user.setPhone(updateDto.getPhone());
        if (updateDto.getAddress() != null) user.setAddress(updateDto.getAddress());
        if (updateDto.getBio() != null) user.setBio(updateDto.getBio());
        if (updateDto.getProfileImageUrl() != null) user.setProfileImageUrl(updateDto.getProfileImageUrl());

        User updatedUser = userRepository.save(user);
        return UserProfileDto.fromEntity(updatedUser);
    }
}
