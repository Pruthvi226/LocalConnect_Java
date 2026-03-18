package com.nearnest.service;

import com.nearnest.dto.BookingDto;
import com.nearnest.dto.UserDto;
import com.nearnest.model.Booking;
import com.nearnest.model.Service;
import com.nearnest.repository.BookingRepository;
import com.nearnest.repository.ServiceRepository;
import com.nearnest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class AdminService {
    @Autowired
    UserRepository userRepository;

    @Autowired
    ServiceRepository serviceRepository;

    @Autowired
    BookingRepository bookingRepository;

    public Map<String, Object> getAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        // Total counts
        analytics.put("totalUsers", userRepository.count());
        analytics.put("totalServices", serviceRepository.count());
        analytics.put("totalBookings", bookingRepository.count());

        // Top services by bookings
        List<Service> allServices = serviceRepository.findAll();
        Map<String, Long> serviceBookingCounts = allServices.stream()
                .collect(Collectors.toMap(
                    Service::getTitle,
                    s -> (long) s.getBookings().size(),
                    (existing, replacement) -> existing
                ));
        analytics.put("topServices", serviceBookingCounts);

        // Popular categories
        List<String> categories = serviceRepository.findAllDistinctCategories();
        Map<String, Long> categoryCounts = categories.stream()
                .collect(Collectors.toMap(
                    cat -> cat,
                    cat -> (long) serviceRepository.findByCategory(cat).size()
                ));
        analytics.put("popularCategories", categoryCounts);

        // Booking statistics
        Map<String, Long> bookingStats = new HashMap<>();
        bookingStats.put("pending", (long) bookingRepository.findByStatus(Booking.BookingStatus.PENDING).size());
        bookingStats.put("confirmed", (long) bookingRepository.findByStatus(Booking.BookingStatus.CONFIRMED).size());
        bookingStats.put("completed", (long) bookingRepository.findByStatus(Booking.BookingStatus.COMPLETED).size());
        bookingStats.put("cancelled", (long) bookingRepository.findByStatus(Booking.BookingStatus.CANCELLED).size());
        analytics.put("bookingStats", bookingStats);

        // Recent bookings (last 7 days)
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        List<Booking> recentBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getCreatedAt().isAfter(weekAgo))
                .collect(Collectors.toList());
        analytics.put("recentBookings", recentBookings.size());

        // Busiest hours analysis (bookings by hour of day)
        Map<Integer, Long> busiestHours = bookingRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                    b -> b.getBookingDate().getHour(),
                    Collectors.counting()
                ));
        // Convert to TreeMap for sorted order
        Map<Integer, Long> sortedBusiestHours = new TreeMap<>(busiestHours);
        analytics.put("busiestHours", sortedBusiestHours);

        return analytics;
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<BookingDto> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(BookingDto::fromEntity)
                .collect(Collectors.toList());
    }
}
