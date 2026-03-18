package com.nearnest.repository;

import com.nearnest.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByServiceId(Long serviceId);
    List<Review> findByUserId(Long userId);
    Optional<Review> findByUserIdAndServiceId(Long userId, Long serviceId);
}
