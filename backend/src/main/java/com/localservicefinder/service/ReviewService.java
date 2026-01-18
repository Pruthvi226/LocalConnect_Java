package com.localservicefinder.service;

import com.localservicefinder.model.Review;
import com.localservicefinder.model.Service;
import com.localservicefinder.model.User;
import com.localservicefinder.repository.ReviewRepository;
import com.localservicefinder.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@org.springframework.stereotype.Service
public class ReviewService {
    @Autowired
    ReviewRepository reviewRepository;

    @Autowired
    ServiceRepository serviceRepository;

    @Autowired
    AuthService authService;

    public List<Review> getServiceReviews(Long serviceId) {
        return reviewRepository.findByServiceId(serviceId);
    }

    @Transactional
    public Review createReview(Long serviceId, Integer rating, String comment) {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }

        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        // Check if user already reviewed this service
        Optional<Review> existingReview = reviewRepository.findByUserIdAndServiceId(
                currentUser.getId(), serviceId);
        if (existingReview.isPresent()) {
            throw new RuntimeException("You have already reviewed this service");
        }

        Review review = new Review();
        review.setUser(currentUser);
        review.setService(service);
        review.setRating(rating);
        review.setComment(comment);

        Review savedReview = reviewRepository.save(review);

        // Update service rating
        updateServiceRating(serviceId);

        return savedReview;
    }

    @Transactional
    public Review updateReview(Long id, Integer rating, String comment) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }

        if (!currentUser.getId().equals(review.getUser().getId()) && 
            currentUser.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("You don't have permission to update this review");
        }

        if (rating != null) {
            review.setRating(rating);
        }
        if (comment != null) {
            review.setComment(comment);
        }

        Review updatedReview = reviewRepository.save(review);

        // Update service rating
        updateServiceRating(review.getService().getId());

        return updatedReview;
    }

    @Transactional
    public void deleteReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }

        if (!currentUser.getId().equals(review.getUser().getId()) && 
            currentUser.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("You don't have permission to delete this review");
        }

        Long serviceId = review.getService().getId();
        reviewRepository.delete(review);

        // Update service rating
        updateServiceRating(serviceId);
    }

    @Transactional
    private void updateServiceRating(Long serviceId) {
        List<Review> reviews = reviewRepository.findByServiceId(serviceId);
        if (reviews.isEmpty()) {
            Service service = serviceRepository.findById(serviceId).orElse(null);
            if (service != null) {
                service.setAverageRating(0.0);
                service.setTotalReviews(0);
                serviceRepository.save(service);
            }
            return;
        }

        double averageRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        service.setAverageRating(averageRating);
        service.setTotalReviews(reviews.size());
        serviceRepository.save(service);
    }
}
