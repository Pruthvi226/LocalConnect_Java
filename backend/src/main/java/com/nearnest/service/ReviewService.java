package com.nearnest.service;

import com.nearnest.dto.ReviewDto;
import com.nearnest.model.Review;
import com.nearnest.model.Service;
import com.nearnest.model.User;
import com.nearnest.model.Booking;
import com.nearnest.repository.ReviewRepository;
import com.nearnest.repository.ServiceRepository;
import com.nearnest.repository.UserRepository;
import com.nearnest.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class ReviewService {
    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    public java.util.Optional<Long> getEligibleBookingId(Long serviceId) {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) return java.util.Optional.empty();
        
        java.util.Optional<Booking> booking = bookingRepository.findFirstByServiceIdAndUserIdAndStatusInOrderByCreatedAtDesc(
            serviceId, currentUser.getId(), 
            java.util.List.of(Booking.BookingStatus.COMPLETED, Booking.BookingStatus.REVIEW_PENDING)
        );
        
        if (booking.isPresent() && !reviewRepository.existsByBookingId(booking.get().getId())) {
            return java.util.Optional.of(booking.get().getId());
        }
        return java.util.Optional.empty();
    }

    public List<ReviewDto> getServiceReviews(@NonNull Long serviceId) {
        return reviewRepository.findByServiceId(Objects.requireNonNull(serviceId)).stream()
                .map(ReviewDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ReviewDto> getProviderReviews(@NonNull Long providerId) {
        return reviewRepository.findByProviderId(Objects.requireNonNull(providerId)).stream()
                .map(ReviewDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewDto createReview(@NonNull Long bookingId, @NonNull Integer rating, String comment, java.util.List<String> imageUrls) {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }

        Booking booking = bookingRepository.findById(Objects.requireNonNull(bookingId))
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You are not authorized to review this booking");
        }

        // Only allow review if booking is COMPLETED or REVIEW_PENDING
        if (booking.getStatus() != com.nearnest.model.Booking.BookingStatus.REVIEW_PENDING && 
            booking.getStatus() != com.nearnest.model.Booking.BookingStatus.COMPLETED) {
            throw new RuntimeException("Booking must be completed before reviewing");
        }

        if (reviewRepository.existsByBookingId(bookingId)) {
            throw new RuntimeException("You have already reviewed this booking");
        }

        Review review = new Review();
        review.setCustomer(currentUser);
        review.setBooking(booking);
        review.setProvider(booking.getService().getProvider());
        review.setService(booking.getService());
        review.setRating(rating);
        review.setComment(comment);
        if (imageUrls != null) {
            review.setImageUrls(new java.util.ArrayList<>(imageUrls));
        }

        Review savedReview = reviewRepository.save(review);

        // Update booking status from REVIEW_PENDING to COMPLETED if needed
        if (booking.getStatus() == com.nearnest.model.Booking.BookingStatus.REVIEW_PENDING) {
            booking.setStatus(com.nearnest.model.Booking.BookingStatus.COMPLETED);
            bookingRepository.save(booking);
        }

        // Update provider rating
        updateProviderRating(Objects.requireNonNull(booking.getService().getProvider().getId()));
        // Update service rating as well
        updateServiceRating(Objects.requireNonNull(booking.getService().getId()));

        return ReviewDto.fromEntity(savedReview);
    }

    @Transactional
    public ReviewDto updateReview(@NonNull Long id, Integer rating, String comment) {
        Review review = reviewRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Review not found"));

        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }

        if (!currentUser.getId().equals(review.getCustomer().getId()) && 
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

        // Update ratings
        updateProviderRating(Objects.requireNonNull(review.getProvider().getId()));
        updateServiceRating(Objects.requireNonNull(review.getService().getId()));

        return ReviewDto.fromEntity(updatedReview);
    }

    @Transactional
    public void deleteReview(@NonNull Long id) {
        Review review = reviewRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Review not found"));

        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }

        if (!currentUser.getId().equals(review.getCustomer().getId()) && 
            currentUser.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("You don't have permission to delete this review");
        }

        Long providerId = review.getProvider().getId();
        Long serviceId = review.getService().getId();
        reviewRepository.delete(review);

        // Update ratings
        updateProviderRating(Objects.requireNonNull(providerId));
        updateServiceRating(Objects.requireNonNull(serviceId));
    }

    @Transactional
    private void updateServiceRating(Long serviceId) {
        List<Review> reviews = reviewRepository.findByServiceId(Objects.requireNonNull(serviceId));
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

    @Transactional
    private void updateProviderRating(Long providerId) {
        List<Review> reviews = reviewRepository.findByProviderId(Objects.requireNonNull(providerId));
        if (reviews.isEmpty()) {
            User provider = userRepository.findById(Objects.requireNonNull(providerId)).orElse(null);
            if (provider != null) {
                provider.setAverageRating(0.0);
                provider.setTotalReviews(0);
                userRepository.save(provider);
            }
            return;
        }

        double averageRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        User provider = userRepository.findById(Objects.requireNonNull(providerId))
                .orElseThrow(() -> new RuntimeException("Provider not found"));
        provider.setAverageRating(averageRating);
        provider.setTotalReviews(reviews.size());
        userRepository.save(provider);

        // Explicitly trigger trust score recalculation
        userService.recalculateTrustScore(providerId);
    }
}
