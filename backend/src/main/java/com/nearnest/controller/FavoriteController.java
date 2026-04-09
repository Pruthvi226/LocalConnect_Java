package com.nearnest.controller;

import com.nearnest.dto.FavoriteDto;
import com.nearnest.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {
    @Autowired
    FavoriteService favoriteService;

    @PostMapping("/{serviceId}")
    public ResponseEntity<FavoriteDto> addToFavorites(@PathVariable Long serviceId) {
        return ResponseEntity.ok(favoriteService.addToFavorites(Objects.requireNonNull(serviceId)));
    }

    @DeleteMapping("/{serviceId}")
    public ResponseEntity<Map<String, String>> removeFromFavorites(@PathVariable Long serviceId) {
        favoriteService.removeFromFavorites(Objects.requireNonNull(serviceId));
        return ResponseEntity.ok(Map.of("message", "Service removed from favorites"));
    }

    @GetMapping
    public ResponseEntity<List<FavoriteDto>> getUserFavorites() {
        return ResponseEntity.ok(favoriteService.getUserFavorites());
    }

    @GetMapping("/check/{serviceId}")
    public ResponseEntity<Map<String, Boolean>> isFavorite(@PathVariable Long serviceId) {
        boolean isFavorite = favoriteService.isFavorite(Objects.requireNonNull(serviceId));
        return ResponseEntity.ok(Map.of("isFavorite", isFavorite));
    }
}
