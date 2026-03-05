package com.localservicefinder.repository;

import com.localservicefinder.model.Booking;
import com.localservicefinder.model.Booking.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);
    List<Booking> findByServiceId(Long serviceId);
    List<Booking> findByService_Provider_Id(Long providerId);
    List<Booking> findByStatus(BookingStatus status);
    
    @Query("SELECT b FROM Booking b WHERE b.service.id = :serviceId AND " +
           "b.bookingDate BETWEEN :startTime AND :endTime AND " +
           "b.status IN ('PENDING', 'CONFIRMED')")
    List<Booking> findConflictingBookings(
        @Param("serviceId") Long serviceId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.service.id = :serviceId AND " +
           "b.bookingDate >= :startDate AND b.bookingDate < :endDate")
    Long countBookingsByServiceAndDateRange(
        @Param("serviceId") Long serviceId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
}
