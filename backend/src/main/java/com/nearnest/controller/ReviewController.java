package com.nearnest.controller;

import com.nearnest.dto.ReviewDto;
import com.nearnest.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    @Autowired
    ReviewService reviewService;

    @GetMapping("/service/{serviceId}")
    public ResponseEntity<List<ReviewDto>> getServiceReviews(@PathVariable(name = "serviceId") Long serviceId) {
        return ResponseEntity.ok(reviewService.getServiceReviews(serviceId));
    }

    @PostMapping
    public ResponseEntity<ReviewDto> createReview(
            @RequestParam(name = "serviceId") Long serviceId,
            @RequestParam(name = "rating") Integer rating,
            @RequestParam(name = "comment", required = false) String comment) {
        return ResponseEntity.ok(reviewService.createReview(serviceId, rating, comment));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReviewDto> updateReview(
            @PathVariable(name = "id") Long id,
            @RequestParam(name = "rating", required = false) Integer rating,
            @RequestParam(name = "comment", required = false) String comment) {
        return ResponseEntity.ok(reviewService.updateReview(id, rating, comment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteReview(@PathVariable(name = "id") Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(Map.of("message", "Review deleted successfully"));
    }
}
