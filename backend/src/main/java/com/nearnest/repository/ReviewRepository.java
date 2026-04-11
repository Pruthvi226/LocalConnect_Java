package com.nearnest.repository;

import com.nearnest.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByServiceId(Long serviceId);
    List<Review> findByCustomerId(Long customerId);
    List<Review> findByProviderId(Long providerId);
    Optional<Review> findByCustomerIdAndServiceId(Long customerId, Long serviceId);
    Optional<Review> findByBookingId(Long bookingId);
    boolean existsByBookingId(Long bookingId);
}
