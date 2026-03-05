package com.localservicefinder.service;

import com.localservicefinder.model.Favorite;
import com.localservicefinder.model.Service;
import com.localservicefinder.model.User;
import com.localservicefinder.repository.FavoriteRepository;
import com.localservicefinder.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@org.springframework.stereotype.Service
public class FavoriteService {
    @Autowired
    FavoriteRepository favoriteRepository;

    @Autowired
    ServiceRepository serviceRepository;

    @Autowired
    AuthService authService;

    @Transactional
    public Favorite addToFavorites(Long serviceId) {
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

        return favoriteRepository.save(favorite);
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

    public List<Favorite> getUserFavorites() {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }

        return favoriteRepository.findByUser(currentUser);
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
