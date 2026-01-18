package com.localservicefinder.service;

import com.localservicefinder.model.Booking;
import com.localservicefinder.model.Booking.BookingStatus;
import com.localservicefinder.model.Service;
import com.localservicefinder.model.User;
import com.localservicefinder.repository.BookingRepository;
import com.localservicefinder.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@org.springframework.stereotype.Service
public class BookingService {
    @Autowired
    BookingRepository bookingRepository;

    @Autowired
    ServiceRepository serviceRepository;

    @Autowired
    AuthService authService;

    @Autowired
    EmailService emailService;

    public List<Booking> getUserBookings() {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }
        return bookingRepository.findByUserId(currentUser.getId());
    }

    public List<Booking> getAllBookings() {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null || currentUser.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only admins can view all bookings");
        }
        return bookingRepository.findAll();
    }

    @Transactional
    public Booking createBooking(Long serviceId, LocalDateTime bookingDate, String notes) {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }

        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        if (!service.getIsAvailable()) {
            throw new RuntimeException("Service is not available");
        }

        // Check for conflicting bookings (within 1 hour window)
        LocalDateTime startTime = bookingDate.minusHours(1);
        LocalDateTime endTime = bookingDate.plusHours(1);
        List<Booking> conflictingBookings = bookingRepository.findConflictingBookings(
                serviceId, startTime, endTime);

        if (!conflictingBookings.isEmpty()) {
            throw new RuntimeException("This time slot is already booked");
        }

        Booking booking = new Booking();
        booking.setUser(currentUser);
        booking.setService(service);
        booking.setBookingDate(bookingDate);
        booking.setStatus(BookingStatus.PENDING);
        booking.setNotes(notes);

        Booking savedBooking = bookingRepository.save(booking);

        // Send email notification
        try {
            emailService.sendBookingConfirmation(currentUser.getEmail(), savedBooking);
        } catch (Exception e) {
            // Log error but don't fail the booking
            System.err.println("Failed to send email: " + e.getMessage());
        }

        return savedBooking;
    }

    @Transactional
    public Booking updateBooking(Long id, BookingStatus status, String notes) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }

        // Users can only update their own bookings, providers can update bookings for their services
        boolean canUpdate = currentUser.getId().equals(booking.getUser().getId()) ||
                           currentUser.getId().equals(booking.getService().getProvider().getId()) ||
                           currentUser.getRole() == User.Role.ADMIN;

        if (!canUpdate) {
            throw new RuntimeException("You don't have permission to update this booking");
        }

        if (status != null) {
            booking.setStatus(status);
        }
        if (notes != null) {
            booking.setNotes(notes);
        }

        return bookingRepository.save(booking);
    }

    @Transactional
    public void cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }

        if (!currentUser.getId().equals(booking.getUser().getId()) && 
            currentUser.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("You don't have permission to cancel this booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    public Optional<Booking> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }
}
