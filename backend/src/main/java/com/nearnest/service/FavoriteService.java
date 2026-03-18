package com.nearnest.service;

import com.nearnest.dto.FavoriteDto;
import com.nearnest.model.Favorite;
import com.nearnest.model.Service;
import com.nearnest.model.User;
import com.nearnest.repository.FavoriteRepository;
import com.nearnest.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class FavoriteService {
    @Autowired
    FavoriteRepository favoriteRepository;

    @Autowired
    ServiceRepository serviceRepository;

    @Autowired
    AuthService authService;

    @Transactional
    public FavoriteDto addToFavorites(Long serviceId) {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }

        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        // Check if already favorited
        if (favoriteRepository.existsByUserAndService(currentUser, service)) {
            throw new RuntimeException("Service is already in favorites");
        }

        Favorite favorite = new Favorite();
        favorite.setUser(currentUser);
        favorite.setService(service);

        Favorite savedFavorite = favoriteRepository.save(favorite);
        return FavoriteDto.fromEntity(savedFavorite);
    }

    @Transactional
    public void removeFromFavorites(Long serviceId) {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }

        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        Favorite favorite = favoriteRepository.findByUserAndService(currentUser, service)
                .orElseThrow(() -> new RuntimeException("Service is not in favorites"));

        favoriteRepository.delete(favorite);
    }

    public List<FavoriteDto> getUserFavorites() {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }

        return favoriteRepository.findByUser(currentUser).stream()
                .map(FavoriteDto::fromEntity)
                .collect(Collectors.toList());
    }

    public boolean isFavorite(Long serviceId) {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            return false;
        }

        Service service = serviceRepository.findById(serviceId)
                .orElse(null);

        if (service == null) {
            return false;
        }

        return favoriteRepository.existsByUserAndService(currentUser, service);
    }
}
