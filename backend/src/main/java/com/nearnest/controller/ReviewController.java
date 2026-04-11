package com.nearnest.controller;

import com.nearnest.dto.ReviewDto;
import com.nearnest.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    @Autowired
    ReviewService reviewService;

    @GetMapping("/service/{serviceId}")
    public ResponseEntity<List<ReviewDto>> getServiceReviews(@PathVariable(name = "serviceId") Long serviceId) {
        return ResponseEntity.ok(reviewService.getServiceReviews(Objects.requireNonNull(serviceId)));
    }

    @GetMapping("/service/{serviceId}/eligible")
    public ResponseEntity<Map<String, Object>> checkReviewEligibility(@PathVariable(name = "serviceId") Long serviceId) {
        java.util.Optional<Long> bookingId = reviewService.getEligibleBookingId(serviceId);
        return ResponseEntity.ok(Map.of(
            "eligible", bookingId.isPresent(),
            "bookingId", bookingId.orElse(null)
        ));
    }

    @PostMapping
    public ResponseEntity<ReviewDto> createReview(
            @RequestParam(name = "bookingId") Long bookingId,
            @RequestParam(name = "rating") Integer rating,
            @RequestParam(name = "comment", required = false) String comment,
            @RequestParam(name = "imageUrls", required = false) java.util.List<String> imageUrls) {
        return ResponseEntity.ok(reviewService.createReview(Objects.requireNonNull(bookingId), Objects.requireNonNull(rating), comment, imageUrls));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReviewDto> updateReview(
            @PathVariable(name = "id") Long id,
            @RequestParam(name = "rating", required = false) Integer rating,
            @RequestParam(name = "comment", required = false) String comment) {
        return ResponseEntity.ok(reviewService.updateReview(Objects.requireNonNull(id), rating, comment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteReview(@PathVariable(name = "id") Long id) {
        reviewService.deleteReview(Objects.requireNonNull(id));
        return ResponseEntity.ok(Map.of("message", "Review deleted successfully"));
    }
}
