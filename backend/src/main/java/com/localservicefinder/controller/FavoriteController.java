package com.localservicefinder.controller;

import com.localservicefinder.model.Favorite;
import com.localservicefinder.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {
    @Autowired
    FavoriteService favoriteService;

    @PostMapping("/{serviceId}")
    public ResponseEntity<?> addToFavorites(@PathVariable Long serviceId) {
        try {
            Favorite favorite = favoriteService.addToFavorites(serviceId);
            return ResponseEntity.ok(favorite);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{serviceId}")
    public ResponseEntity<?> removeFromFavorites(@PathVariable Long serviceId) {
        try {
            favoriteService.removeFromFavorites(serviceId);
            return ResponseEntity.ok(Map.of("message", "Service removed from favorites"));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping
    public ResponseEntity<?> getUserFavorites() {
        try {
            List<Favorite> favorites = favoriteService.getUserFavorites();
            return ResponseEntity.ok(favorites);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/check/{serviceId}")
    public ResponseEntity<?> isFavorite(@PathVariable Long serviceId) {
        try {
            boolean isFavorite = favoriteService.isFavorite(serviceId);
            return ResponseEntity.ok(Map.of("isFavorite", isFavorite));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
