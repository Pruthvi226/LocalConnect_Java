package com.localservicefinder.controller;

import com.localservicefinder.model.Review;
import com.localservicefinder.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    @Autowired
    ReviewService reviewService;

    @GetMapping("/service/{serviceId}")
    public ResponseEntity<List<Review>> getServiceReviews(@PathVariable Long serviceId) {
        return ResponseEntity.ok(reviewService.getServiceReviews(serviceId));
    }

    @PostMapping
    public ResponseEntity<?> createReview(
            @RequestParam Long serviceId,
            @RequestParam Integer rating,
            @RequestParam(required = false) String comment) {
        try {
            Review review = reviewService.createReview(serviceId, rating, comment);
            return ResponseEntity.ok(review);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReview(
            @PathVariable Long id,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) String comment) {
        try {
            Review updatedReview = reviewService.updateReview(id, rating, comment);
            return ResponseEntity.ok(updatedReview);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        try {
            reviewService.deleteReview(id);
            return ResponseEntity.ok(Map.of("message", "Review deleted successfully"));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
