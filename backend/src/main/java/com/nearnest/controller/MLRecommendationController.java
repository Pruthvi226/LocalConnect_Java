package com.nearnest.controller;

import com.nearnest.dto.ServiceDto;
import com.nearnest.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
@RestController
@RequestMapping("/api/recommendations")
public class MLRecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    /**
     * Returns AI-ranked service recommendations for a specific user.
     * Powered by the Python ML microservice.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ServiceDto>> getRecommendations(@PathVariable(name = "userId") Long userId) {
        return ResponseEntity.ok(recommendationService.getRecommendationsForUser(Objects.requireNonNull(userId)));
    }
}
