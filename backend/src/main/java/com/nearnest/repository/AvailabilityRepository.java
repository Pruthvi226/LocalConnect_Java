package com.nearnest.repository;

import com.nearnest.model.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long> {
    List<Availability> findByUserId(Long userId);
    List<Availability> findByUserIdAndDayOfWeek(Long userId, int dayOfWeek);
    List<Availability> findByUserIdAndIsActiveTrue(Long userId);
}
